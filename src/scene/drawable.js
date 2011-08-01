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
        ret.mesh = {
            mode: this.mesh.mode
        };
    },
    setImportData: function( importer, data ) {
        this.Node_setImportData( importer, data.parent );

    }
};

Drawable.extend( Node );
