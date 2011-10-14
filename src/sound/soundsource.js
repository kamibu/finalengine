/*global SceneNode: false, Vector3: false, SoundAsset: false, EventEmitter: false */

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
     * @type {SoundAsset}
     * @default null
     */
    this.nowPlaying = null;

    /**
     * Whether the next song will be played when a song ends.
     * @type Number
     */
    this.playUntilLast = false;

    /**
     * The index of the asset that is played now or will be played next.
     */
    this.currentTrack = 0;

    /**
     * The velocity of this source.
     */
    this.velocity = new Vector3();

    /**
     * A unique identifier (local)
     */
    this.uid = SoundSource.uid++;

    /**
     * @default SoundSource.LOOP_NONE
     */
    this.loop = SoundSource.LOOP_NONE;

    this.assets = [];
}

/**
 * Don't loop songs.
 */
SoundSource.LOOP_NONE = 0;

/**
 * Repeat the song being played infinately.
 */
SoundSource.LOOP_ONE = 1;

/**
 * If playing all songs, restart playing all songs when the last one is played.
 */
SoundSource.LOOP_ALL = 2;

SoundSource.prototype = {
    constructor: SoundSource,
    /**
     * Add sound to asset list.
     */
    addSound: function( asset ) {
        this.assets.push( asset );
        this.emit( 'soundadded', asset );
    },
    _play: function( asset ) {
        var self = this;
        asset.getMetadata( function( metadata ) {
            var durationms = metadata.duration / 1000;

            self.nowPlaying = asset;
            self.emit( 'playing', asset );

            setTimeout( function() {
                self.ended();
            }, durationms );
        } );
    },
    /**
     * Play a SoundSource asset.
     * @param asset It can be a SoundAsset, the index of the asset in the list of assets, or no parameters to play the asset pointed by currentTrack property.
     */
    play: function( asset ) {
        if ( !( asset instanceof SoundAsset ) ) {
            if ( typeof asset == "number" ) {
                if ( this.currentTrack > this.assets.length ) {
                    console.log( 'play: unknown track number ' + asset );
                    return false;
                }
                this.currentTrack = asset;
                asset = this.assets[ this.currentTrack ];
            }
            else if ( !asset && this.assets.length ) {
                if ( this.currentTrack >= this.assets.length ) {
                    this.currentTrack = 0;
                }
                asset = this.assets[ this.currentTrack ];
            }
            else {
                console.log( 'invalid parameter to play', asset );
                return false;
            }
        }
        this.playUntilLast = false;
        this._play( asset );
    },
    /**
     * Play all assets until the last one.
     * @param startTrack The index of the asset to start from.
     */
    playAll: function( startTrack ) {
        startTrack = startTrack || 0;
        if ( startTrack >= this.assets.length ) {
            console.log( 'playAll: unknown track number ' + startTrack );
            return;
        }
        this.currentTrack = startTrack;
        if ( this.loop == SoundSource.LOOP_ONE ) {
            this.loop = SoundSource.LOOP_NONE;
        }
        this.playUntilLast = true;
        this._play( this.assets[ this.currentTrack ] );
    },
    /**
     * Set the sound source velocity.
     * Set this to change the sound according to the doppler effect.
     */
    setVelocity: function( v ) {
        this.velocity = v;
    },
    /**
     * Get the sound source velocity.
     */
    getVelocity: function() {
        return this.velocity;
    },
    ended: function() {
        this.emit( 'ended', this.nowPlaying );

        if ( this.playUntilLast ) {
            this.currentTrack = ( this.currentTrack + 1 ) % this.assets.length;
        }

        switch ( this.loop ) {
            case SoundSource.LOOP_NONE:
                this.nowPlaying = null;
                break;
            case SoundSource.LOOP_ONE:
                this.play( this.nowPlaying );
                break;
            case SoundSource.LOOP_ALL:
                if ( this.currentTrack > 0 ) {
                    this._play( this.assets[ this.currentTrack ] );
                }
                break;
            default:
                console.log( 'unknown soundsource loop property' );
        }
    }
};

SoundSource.extend( SceneNode );
SoundSource.uid = 0;
