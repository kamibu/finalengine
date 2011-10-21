/*global
    assert         :  false,
    BasicMaterial  :  false,
    Material       :  false,
    SceneNode      :  false
*/

/**
 * @class
 * A 3D object with a mesh and a material.
 *
 * @extends SceneNode
 * @constructor
 */
function Drawable() {
    SceneNode.call( this );
    /**
     * @public
     * @type Mesh
     * @default null
     */
    this.mesh = null;

    /**
     * @public
     * @type Material
     * @default Instance of BasicMaterial
     */
    this.material = new BasicMaterial();
}

Drawable.prototype = {
    constructor: Drawable,
    onBeforeRender: function( camera ) {
    },
    /**
     * Set the material to be used for rendering this drawable.
     *
     * @param {Material} material
     */
    setMaterial: function( material ) {
        /*DEBUG*/
            assert( Material.prototype.isPrototypeOf( material ), 'Tried to set a material which is not or does not inherit from Material' );
        /*DEBUG_END*/
        this.material = material;
        return this;
    },
    repeatTexture: function( times ) {
        this.mesh.vertexAttributes.UVCoord.scale( times );
    },
    getExportData: function( exporter ) {
        var ret = {};
        ret.parent = this.SceneNode_getExportData( exporter );
        ret.mesh = this.mesh.name;
        ret.material = this.material.name;
        exporter.alsoSave( this.mesh );
        exporter.alsoSave( this.material );
        return ret;
    },
    setImportData: function( importer, data ) {
        this.SceneNode_setImportData( importer, data.parent );
        var self = this;
        importer.load( data.mesh, function( mesh ) {
            self.mesh = mesh;
        } );
        importer.load( data.material, function( material ) {
            self.material = material;
        } );
    }
};

Drawable.extend( SceneNode );
