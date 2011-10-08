/*global SoundAsset:false, Importer: false */

/**
 * @class
 *
 * Imports sound files into SoundSource instances.
 */
function SoundLoader() {
}

SoundLoader.prototype = {
    constructor: SoundLoader,
    load: function( path, importer, callback ) {
        var request = new XMLHttpRequest();
        request.open( "GET", path, true );
        request.responseType = "arraybuffer";
        request.onload = function() {
            var soundAsset = new SoundAsset( request.response );
            callback( soundAsset );
        };
        request.send();
    }
};

( function() {
    var soundLoader = new SoundLoader();
    Importer.setLoader( 'mp3', soundLoader );
    Importer.setLoader( 'wav', soundLoader );
    Importer.setLoader( 'ogg', soundLoader );
}() );
