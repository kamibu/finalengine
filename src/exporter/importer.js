/*jshint evil: true */
/*global Request: true, EventWaiter: true */

/**
 * @class
 *
 * Imports objects from JSON format.
 */
function Importer( resourcePath ) {
    if ( resourcePath[ resourcePath.length - 1 ] !== '/' ) {
        resourcePath += '/';
    }
    /**
     * @public
     */
    this.resourcePath = resourcePath;
    this.cache = {};
    this.waiter = new EventWaiter();
}

Importer.prototype = {
    constructor: Importer,
    _load: function( asset, callback ) {
        this.waiter.waitMore();
        if ( this.cache[ asset ] ) {
            callback( this.cache[ asset ] );
            this.waiter.waitLess();
            return;
        }
        var self = this;
        Request.get( this.resourcePath + asset + '.json', {}, function( data ) {
            var object = self.processData( data );
            self.cache[ asset ] = object;
            callback( object );
            self.waiter.waitLess();
        } );
    },
    /**
     * Loads an asset.
     *
     * @param {String} asset The path to the asset relative to resourcePath and without the .json extension.
     * @param {Function} callback Callback that is called with the loaded object as a parameter.
     */
    load: function( asset, callback ) {
        var self = this;
        this._load( asset, function(){} );

        this.waiter.once( 'complete', function() {
            callback( self.cache[ asset ] );
        } );
    },
    alsoLoad: function( asset, callback ) {
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
            var ObjectClass = eval( object[ 'class' ] );
            if ( typeof ObjectClass == 'function' ) {
                var ret = new ObjectClass();
                ret.setImportData( this, object.data );
                return ret;
            }
        }
        return null;
    }
};
