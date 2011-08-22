// extern
var Matrix4, Quaternion, Shader, UUID, Vector3, Color, Texture;

function Material() {
    this.uuid = UUID();
    this.uid = Material.uid++;
    this.name = this.uuid;

    this.libraries = [];
    this.defines = {};
    this.vertexShader = '';
    this.fragmentShader = '';
    this.parameters = {};
    this.engineParameters = {};
    this.cachedShader = null;
    this.validShader = false;
    this.transparent = false;

    this.copyOnWrite = null;
}

Material.uid = 0;

Material.prototype = {
    constructor: Material,
    define: function( name, value ) {
        if ( this.defines[ name ] != value ) {
            this.defines[ name ] = value;
            this.validShader = false;
            this.copyOnWrite = null;
        }
        return this;
    },
    setParameter: function( name, value ) {
        if ( value instanceof Texture ) {
            this.parameters[ name ] = {
                data: value
            };
        }
        else if ( typeof value !== 'object' ) {
            this.parameters[ name ] = {
                data: value
            };
        }
        else {
            this.parameters[ name ] = value;
        }
        return this;
    },
    getShader: function() {
        if ( this.copyOnWrite ) {
            this.cachedShader = this.copyOnWrite.getShader();
            this.validShader = true;
            this.copyOnWrite = null;
        }
        var vertexShader = '',
            fragmentShader = '',
            i, l = this.libraries.length,
            define,
            parameterName;

        if ( !this.validShader ) {
            this.validShader = true;

            for ( define in this.defines ) {
                vertexShader += '#define ' + define + ' ' + this.defines[ define ] + '\n';
                fragmentShader += '#define ' + define + ' ' + this.defines[ define ] + '\n';
            }

            for ( i = 0; i < l; i++ ) {
                vertexShader += this.libraries[ i ].vertexShader + '\n';
                fragmentShader += this.libraries[ i ].fragmentShader + '\n';
            }
            vertexShader += this.vertexShader;
            fragmentShader += this.fragmentShader;

            this.cachedShader = new Shader();
            this.cachedShader.setVertexSource( vertexShader );
            this.cachedShader.setFragmentSource( fragmentShader );
        }
        for ( parameterName in this.parameters ) {
            this.cachedShader.uniforms[ parameterName ] = this.parameters[ parameterName ].data;
        }
        return this.cachedShader;
    },
    clone: function() {
        var ret = new Material(),
            l = this.libraries.length,
            define,
            parameter;
        if ( this.validShader ) {
            ret.cachedShader = this.cachedShader;
            ret.validShader = true;
        }
        else {
            ret.copyOnWrite = this;
        }
        ret.transparent = this.transparent;
        for ( define in this.defines ) {
            ret.defines[ define ] = this.defines[ define ];
        }
        for ( parameter in this.parameters ) {
            ret.parameters[ parameter ] = this.parameters[ parameter ];
        }
        for ( var engineParameter in this.engineParameters ) {
            ret.engineParameters[ engineParameter ] = null;
        }
        while ( l-- ) {
            ret.libraries[ l ] = this.libraries[ l ];
        }
        ret.vertexShader = this.vertexShader;
        ret.fragmentShader = this.fragmentShader;
        return ret;
    },
    getExportData: function( exporter ) {
        var ret = {
            defines: {},
            parameters: {},
            engineParameters: {},
            shader: this.cachedShader.name,
            name: this.name
        };

        exporter.alsoSave( this.cachedShader );

        ret.vertexShader = this.vertexShader;
        ret.fragmentShader = this.fragmentShader;
//        ret.transparent = this.transparent;

        for ( var define in this.defines ) {
            ret.defines[ define ] = this.defines[ define ];
        }
        for ( var engineParameter in this.engineParameters ) {
            ret.engineParameters[ engineParameter ] = null;
        }
        for ( var parameter in this.parameters ) {
            var p = this.parameters[ parameter ];
            switch ( typeof p ) {
                case 'number':
                    ret.parameters[ parameter ] = p;
                    break;
                case 'object':
                    if ( p.data instanceof Texture ) {
                        ret.parameters[ parameter ] = {
                            type: p.data.constructor.name,
                            data: p.data.getExportData( exporter )
                        };
                    }
                    else {
                        ret.parameters[ parameter ] = {
                            type: p.constructor.name,
                            data: p.setTo( [] )
                        };
                    }
                    break;
            }
        }
        return ret;
    },
    setImportData: function( importer, data ) {
        this.name = data.name;
        var self = this;
        importer.alsoLoad( data.shader, function( shader ) {
            self.cachedShader = shader;
            self.validShader = true;
        } );

        this.vertexShader = data.vertexShader;
        this.fragmentShader = data.fragmentShader;
//        this.transparent = data.transparent;
        for ( var define in data.defines ) {
            this.defines[ define ] = data.defines[ define ];
        }
        for ( var engineParameter in data.engineParameters ) {
            this.engineParameters[ engineParameter ] = null;
        }
        for ( var parameter in data.parameters ) {
            switch ( typeof data.parameters[ parameter ] ) {
                case 'number':
                    this.parameters[ parameter ] = data.parameters[ parameter ];
                    break;
                case 'object':
                    var p = data.parameters[ parameter ];
                    switch ( p.type ) {
                        case 'Vector3':
                            this.parameters[ parameter ] = new Vector3( p.data );
                            break;
                        case 'Quaternion':
                            this.parameters[ parameter ] = new Quaternion( p.data );
                            break;
                        case 'Matrix4':
                            this.parameters[ parameter ] = new Matrix4( p.data );
                            break;
                        case 'Color':
                            this.parameters[ parameter ] = new Color( p.data );
                            break;
                        case 'Texture':
                            this.parameters[ parameter ] = {
                                data: new Texture().setImportData( importer, p.data )
                            };
                            break;
                    }
            }
        }
        return this;
    }
};
