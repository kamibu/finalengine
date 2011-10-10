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
     * @default null
     */
    this.nowPlaying = null;

    this.velocity = new Vector3();
    this.uid = SoundSource.uid++;
    this.currentTrack = 0;
    this.loop = SoundSource.LOOP_NONE;
    this.playAll = false;

    this.assets = [];
}

SoundSource.LOOP_NONE = 0;
SoundSource.LOOP_ONE = 1;
SoundSource.LOOP_ALL = 2;

SoundSource.prototype = {
    constructor: SoundSource,
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
        this.playAll = false;
        this._play( asset );
    },
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
        this.playAll = true;
        this._play( this.assets[ this.currentTrack ] );
    },
    setVelocity: function( v ) {
        this.velocity = v;
    },
    getVelocity: function() {
        return this.velocity;
    },
    ended: function() {
        this.emit( 'ended', this.nowPlaying );

        switch ( this.loop ) {
            case SoundSource.LOOP_NONE:
                this.currentTrack = ( this.currentTrack + 1 ) % this.assets.length;
                this.nowPlaying = null;
                break;
            case SoundSource.LOOP_ONE:
                this.play( this.nowPlaying );
                break;
            case SoundSource.LOOP_ALL:
                this.currentTrack = ( this.currentTrack + 1 ) % this.assets.length;
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
