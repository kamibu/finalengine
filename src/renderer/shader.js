/*global UUID:true*/

/** @public */
function Shader() {
    this.uid = Shader.uid++;
    this.uuid = UUID.generateCanonicalForm();
    this.name = this.uuid;

    this.vertexSource = '';
    this.fragmentSource = '';

    this.uniforms = {};

    this.needsUpdate = false;
}

Shader.uid = 0;

Shader.prototype = {
    constructor: Shader,
    /** @public */
    setVertexSource: function( source ) {
        this.vertexSource = source;
        this.needsUpdate = true;
    },
    /** @public */
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
