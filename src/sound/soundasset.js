/*global EventEmitter: false */

/**
 * @class
 * A sound effect, soundtrack song or any other sound asset.
 *
 * @extends EventEmitter
 * @constructor
 * @param url
 * @param loadMetadata
 */
function SoundAsset( url ) {
    var self = this;
    EventEmitter.call( this );

    /**
     * A unique indentifer (local).
     * @type String
     */
    this.uid = SoundAsset.uid++;

    /**
     * The url of this asset.
     * @type String
     */
    this.url = url;

    /**
     * The duration of this asset. If metadata is not yet loaded, it is null.
     * @type Number
     */
    this.duration = null;

    /**
     * An HTML audio element with this asset as a source.
     * @type HTMLElement
     */
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
    /**
     * Call a callback with the metadata information.
     * @param Function callback A callback to pass the metadata.
     */
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
