/*jshint evil: true */

function Importer( resourcePath ) {
    if ( resourcePath[ resourcePath.length - 1 ] !== '/'  ){ 
        resourcePath += '/';
    }
    this.resourcePath = resourcePath;
    this.cache = {};
    this.isAlreadyLoading = false;
    this.pendingLoads = [];
}

Importer.prototype = {
    _load: function( asset, callback ) {
        if ( this.cache[ asset ] ) {
            this.processData( this.cache[ asset ], callback );
        }
        else {
            var self = this;
            Request.get( this.resourcePath + asset, {}, function( data ) {
                self.isAlreadyLoading = false;
                self.processData( data, callback );
                if ( self.isAlreadyLoading ) {
                    return;
                }
                if ( self.pendingLoads.length ) {
                    self.load.apply( self, this.pendingLoads.shift() );
                }
            });
        }
    },
    load: function( asset, callback ) {
        if ( this.isAlreadyLoading ) {
            this.pendingLoads.push( arguments );
            return;
        }
        this.isAlreadyLoading = true;
        this._load( asset, callback );
    },
    alsoLoad: function( asset, callback ) {
        console.log( 'here' );
        this._load( asset, callback );
    },
    processData: function( data ) {
        data = JSON.parse( data );
        var object = data.library[ data.object ];
        var library = data.library;
        for ( var key in library ) {
            this.cache[ key ] = library[ key ];
        }
        //Careful with eval statements..
        if ( /[a-zA-Z_$][0-9a-zA-Z_$]*/.test( object[ 'class' ] ) ) {
            var objectClass = eval( object[ 'class' ] );
            if ( typeof objectClass == 'function' ) {
                var ret = new objectClass();
                ret.setImportData( this, object.data );
                return ret;
            }
        }
        return null;
    }
};
