/*global Request: false, Importer: false */

/**
 * @class
 * Loads JSON objects exported with the {@link Exporter} class.
 *
 * @constructor
 */
function JSONLoader() {
}

JSONLoader.prototype = {
    constructor: JSONLoader,
    /**
     * @public
     */
    load: function( path, importer, callback ) {
        var self = this;
        Request.get( path, {}, function( data ) {
            callback( self.processData( data, importer ) );
        } );
    },
    processData: function( data, importer ) {
        data = JSON.parse( data );
        var object = data.library[ data.object ];
        //Careful with eval statements..
        if ( /[a-zA-Z_$][0-9a-zA-Z_$]*/.test( object[ 'class' ] ) ) {
            var ObjectClass = eval( object[ 'class' ] );
            if ( typeof ObjectClass == 'function' ) {
                var ret = new ObjectClass();
                ret.setImportData( importer, object.data );
                return ret;
            }
        }
        return null;
    }
};

Importer.setLoader( 'json', new JSONLoader() );
