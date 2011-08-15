// extern
var Node, assert, Material;

function Drawable() {
    Node.call( this );
    this.mesh = null;
    this.material = null;
}

Drawable.prototype = {
    constructor: Drawable,
    onBeforeRender: function( camera ) {

    },
    setMaterial: function( material ) {
        /*DEBUG*/
            assert( Material.prototype.isPrototypeOf( material ), 'Tried to set a material which is not or does not inherit from Material' );
        /*DEBUG_END*/
        this.material = material;
        return this;
    },
    getExportData: function( exporter ) {
        var ret = {};
        ret.parent = this.Node_getExportData( exporter );
        ret.mesh = this.mesh.name;
        ret.material = this.material.name;
        exporter.alsoSave( this.mesh );
        exporter.alsoSave( this.material );
        return ret;
    },
    setImportData: function( importer, data ) {
        this.Node_setImportData( importer, data.parent );
        var self = this;
        importer.alsoLoad( data.mesh, function( mesh ) {
            self.mesh = mesh;
        } );
        importer.alsoLoad( data.material, function( material ) {
            self.material = material;
        } );
    }
};

Drawable.extend( Node );
