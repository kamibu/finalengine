function Material() {
    this.uuid = UUID();
    this.uid = Material.uid++;

    this.libraries = [];
    this.defines = {};
    this.vertexShader = '';
    this.fragmentShader = '';
    this.parameters = {};
    this.engineParamaters = {};
    this.cachedShader = null;
    this.validShader = false;
}

Material.uid = 0;

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
            this.cachedShader.setVertexShader( vertexShader );
            this.cachedShader.setFragmentShader( fragmentShader );
        }
        for ( parameterName in this.parameters ) {
            this.cachedShader.uniforms[ parameterName ] = this.parameters;
        }
        return this.cachedShader;
    },
    clone: function() {
        var ret = new Material(),
            l = this.libaries.length,
            define,
            parameter;

        ret.cachedShader = this.cachedShader;
        this.validShader = true;
        for ( define in this.defines ) {
            ret.defines[ define ] = this.defines[ define ];
        }
        for ( parameter in this.parameters ) {
            ret.parameters[ parameter ] = this.parameters[ parameter ];
        }
        while ( l-- ) {
            ret.libraries[ l ] = this.libraries[ l ];
        }
        ret.vertexShader = this.vertexShader;
        ret.fragmentShader = this.fragmentShader;
        return ret;
    },
    getExportData: function( exporter ) {
        var ret = {}, parameter;

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
};
