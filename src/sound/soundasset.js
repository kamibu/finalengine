/*global EventEmitter: false */

/**
 * @class
 * @constructor
 * @param url
 * @param loadMetadata
 */
function SoundAsset( url ) {
    var self = this;
    EventEmitter.call( this );

    this.uid = SoundAsset.uid++;
    this.url = url;
    this.duration = NaN;

    this.tag = document.createElement( 'audio' );
    this.tag.src = url;
    this.tag.addEventListener( 'loadedmetadata', function() {
        self.duration = this.duration;
        self.emit( 'loadedmetadata' );
    } );

    document.body.appendChild( this.tag );
}

SoundAsset.prototype = {
    constructor: SoundAsset,
    getMetadata: function( callback ) {
        var self = this;
        if ( this.duration ) {
            callback( { duration: this.duration } );
        }
        else {
            this.on( 'loadedmetadata', function() {
                callback( { duration: self.duration } );
            } );
        }
    }
};

SoundAsset.extend( EventEmitter );

SoundAsset.uid = 0;
