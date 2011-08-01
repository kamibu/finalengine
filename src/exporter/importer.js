/*jshint evil: true */

function Importer( resourcePath ) {
    if ( resourcePath[ resourcePath.length - 1 ] !== '/'  ){ 
        resourcePath += '/';
    }
    this.resourcePath = resourcePath;
    this.cache = {};
}

Importer.prototype = {
    load: function( asset, callback ) {
        if ( this.cache[ asset ] ) {
            this.processData( this.cache[ asset ], callback );
        }
        else {
            var self = this;
            Request.get( this.resourcePath + asset, function( data ){
                self.processData( data, callback );
            });
        }
    },
    processData: function( data ) {
        data = JSON.parse( data );
        var object = data.library[ data.object ];
        //Careful with eval statements..
        if ( /[a-zA-Z_$][0-9a-zA-Z_$]*/.test( object[ 'class' ] ) ) {
            var objectClass = eval( object[ 'class' ] );
            if ( typeof objectClass == 'function' ) {
                var ret = new objectClass();
                ret.setImportData( this, data );
            }
        }
    }        
};
