function Material() {
    this.uuid = UUID();

    this.libraries = [];
    this.defines = {};
    this.vertexShader = '';
    this.fragmentShader = '';
    this.parameters = {};
    this.engineParamaters = {};
    this.shaderCache = null;
    this.validShader = false;
}

Material.prototype = {
    define: function( name, value ) {
        if ( this.defines[ name ] != value ) {
            this.defines[ name ] = value;
            this.validShader = false;
        }
    },
    setParameter: function( name, value ) {
        this.parameters[ name ] = value;
    },
    getShader: function() {
        if ( !this.validShader ) {
            this.validShader = true;

            var vertexShader = '';
            var fragmentShader = '';

            for ( define in this.defines ) {
                vertexShader += '#define ' + define + ' ' + this.defines[ define ] + '\n';
                fragmentShader += '#define ' + define + ' ' + this.defines[ define ] + '\n';
            }

            var l = this.libraries.length;
            for ( var i = 0; i < l; i++ ) {
                vertexShader += this.libraries[ i ].vertexShader + '\n';
                fragmentShader += this.libraries[ i ].fragmentShader + '\n';
            }
            vertexShader += this.vertexShader;
            fragmentShader += this.fragmentShader;

            this.shaderCache = new Shader();
            this.shaderCache.setVertexShader( vertexShader );
            this.shaderCache.setFragmentShader( fragmentShader );
        }
        for ( parameterName in this.parameters ) {
            this.shaderCache.uniforms[ parameterName ] = this.parameters;
        }
        return this.shaderCache;
    },
    clone: function() {
        var ret = new Material();
        ret.shaderCache = this.shaderCache;
        this.validShader = true;
        for ( define in this.defines ) {
            ret.defines[ define ] = this.defines[ define ];
        }
        for ( parameter in this.parameters ) {
            ret.parameters[ parameter ] = this.parameters[ parameter ];
        }
        var l = this.libraries.length;
        while ( l-- ) {
            ret.libraries[ l ] = this.libraries[ l ];
        }
        ret.vertexShader = this.vertexShader;
        ret.fragmentShader = this.fragmentShader;
        return ret;
    },
    getExportData: function( exporter ) {
        var ret = {};
        ret.shader = this.shader.uuid;
        ret.parameters = {};
        for ( parameter in this.parameters ) {
            switch( typeof this.parameters[ parameter ] ) {
                case 'number':
                    ret[ parameter ] = this.parameters[ parameter ];
                    break;
                case 'object':
                    ret[ parameter ] = '' ;
            }
        }
    },
    setImportData: function( importer ) {


    }
}
