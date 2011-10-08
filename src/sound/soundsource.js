/*global Node: false */

/**
 * @class
 * @extends Node
 *
 * A node in the scene representing a source of sound.
 *
 * This can be thought of as a speaker that can play different SoundSources.
 */
function SoundSource() {
    Node.call( this );

    /**
     * The asset currently playing.
     * @default null
     */
    this.nowPlaying = null;
}

SoundSource.prototype = {
    /**
     * Play a SoundSource asset.
     */
    play: function( asset ) {
        this.nowPlaying = asset;
        this.onPlaying( asset );
    },
    onPlaying: function() {
    }
};

SoundSource.extend( Node );
