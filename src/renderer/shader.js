/*global UUID:true*/

/**
 * @class
 * A shader with a fragment and a vertex source.
 * @constructor */
function Shader() {
    this.uid = Shader.uid++;
    this.uuid = UUID.generateCanonicalForm();
    this.name = this.uuid;

    /**
     * @type String
     */
    this.vertexSource = '';

    /**
     * @type String
     */
    this.fragmentSource = '';

    /**
     * @type Object
     */
    this.uniforms = {};

    this.needsUpdate = false;
}

Shader.uid = 0;

Shader.prototype = {
    constructor: Shader,
    /**
     * @public
     * @param String source
     *
     * Sets the {@link vertexSource} attribute.
     */
    setVertexSource: function( source ) {
        this.vertexSource = source;
        this.needsUpdate = true;
    },
    /**
     * @public
     * @param String source
     *
     * Sets the {@link fragmentSource} attribute.
     */
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
