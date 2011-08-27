// extern
var Request;

function Exporter( resourcePath ) {
    if ( resourcePath[ resourcePath.length - 1 ] !== '/'  ){
        resourcePath += '/';
    }
    this.resourcePath = resourcePath;
    this.pending = [];
    this.isSaving = false;
}

Exporter.prototype = {
    save: function( object, callback ) {
        this.isSaving = true;

        console.log( object.name );
        var data = { library: {}, object: object.name };
        data.library[ object.name ] = {
            'class': object.constructor.name,
            'data': object.getExportData( this )
        };
        //console.log( object.name );
        var self = this;
        var payload = window.escape( JSON.stringify( data ) );
        console.log( 'Sending ' + payload.length / 1024 / 1024 + 'MB' );
        Request.post( 'http://localhost:5000/', { data: payload }, function() {
            if ( self.pending.length > 0 ) {
                self.save( self.pending.shift(), callback );
            }
            else {
                self.isSaving = false;
                callback();
            }
        } );
    },
    alsoSave: function( object ) {
        if ( this.isSaving ) {
            this.pending.push( object );
            return;
        }
        console.log( 'TON PAIRNEI' );
        this.save( object );
    }
};
