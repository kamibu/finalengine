/*global
    Request: false
*/

/**
 * @class
 * Exports objects to JSON format.
 *
 * <p>Objects to be exported must define a getExportData method that returns the data to be saved.</p>
 * <p>You need to run the exporter nodejs script on the resourcePath folder for exporting to work.</p>
 *
 * @constructor
 * @param {string} resourcePath The path to the folder to use for exports.
 */
function Exporter( resourcePath ) {
    if ( resourcePath[ resourcePath.length - 1 ] !== '/'  ){
        resourcePath += '/';
    }

    /**
     * @public
     * Resource export path.
     * @type String
     */
    this.resourcePath = resourcePath;

    /**
     * @public
     * @default false
     * @type Boolean
     */
    this.isSaving = false;

    this.pending = [];
}

Exporter.prototype = {
    /**
     * @public
     * Send object export data to exporter script for saving.
     * @param {Object} object Object to be saved.
     * @param {Function} callback Called when exporting is done.
     */
    save: function( object, callback ) {
        this.isSaving = true;

        // console.log( object.name );
        var data = { library: {}, object: object.name };
        data.library[ object.name ] = {
            'class': object.constructor.name,
            'data': object.getExportData( this )
        };
        //console.log( object.name );
        var self = this;
        var payload = window.escape( JSON.stringify( data ) );
        // console.log( 'Sending ' + payload.length / 1024 / 1024 + 'MB' );
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
        // console.log( 'TON PAIRNEI' );
        this.save( object );
    }
};
