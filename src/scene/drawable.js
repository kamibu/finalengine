// extern
var Node;

function Drawable() {
    Node.call( this );
    this.mesh = null;
}

Drawable.prototype = {
    constructor: Drawable,
    onBeforeRender: function( camera ) {

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
