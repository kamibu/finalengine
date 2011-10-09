/*global SceneNode: false */

/**
 * @class
 *
 * A node in the scene representing a source of sound.
 *
 * This can be thought of as a speaker that can play different SoundSources.
 *
 * @extends SceneNode
 *
 * @constructor
 */
function SoundSource() {
    SceneNode.call( this );

    /**
     * The asset currently playing.
     * @default null
     */
    this.nowPlaying = null;
    this.uid = SoundSource.uid++;
}

SoundSource.prototype = {
    /**
     * Play a SoundSource asset.
     */
    play: function( asset ) {
        this.nowPlaying = asset;
    },
    onPlaying: function() {
    }
};

SoundSource.extend( SceneNode );
SoundSource.uid = 0;
