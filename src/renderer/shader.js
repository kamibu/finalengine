var UUID;

function Shader() {
    this.uid = Shader.uid++;
    this.uuid = UUID();
    this.name = this.uuid;

    this.vertexSource = '';
    this.fragmentSource = '';

    this.uniforms = {};
	this.attributes = {};

    this.needsUpdate = false;
}

Shader.uid = 0;

Shader.prototype = {
    constructor: Shader,
    setVertexSource: function( source ) {
        this.vertexSource = source;
        this.needsUpdate = true;
    },
    setFragmentSource: function( source ) {
        this.fragmentSource = source;
        this.needsUpdate = true;
    },
    getExportData: function( exporter ) {
        return {
            vertexSource: this.vertexSource.split( '\n' ),
            fragmentSource: this.fragmentSource.split( '\n' ),
            name: this.name
        };
    },
    setImportData: function( importer, data ) {
        this.vertexSource = data.vertexSource.join( '\n' );
        this.fragmentSource = data.fragmentSource.join( '\n' );
        this.name = data.name;
        this.needsUpdate = true;
        return this;
    }
};
