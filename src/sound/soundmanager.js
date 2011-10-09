/*jshint newcap: false */
/*global SoundSource: false, webkitAudioContext:  false */

function BasicSoundManager( scene ) {
    this.scene = scene;
    this.tags = {};
}

BasicSoundManager.prototype = {
    constructor: BasicSoundManager,
    update: function( dt ) {
        var soundSources = this.scene.findClass( this.scene, SoundSource );
        for ( var i = 0; i < soundSources.length; ++i ) {
            this.handleSource( soundSources[ i ] );
        }
    },
    handleSource: function( source ) {
        var self = this;
        
        source.onPlaying = function( asset ) {
            asset.tag.play();
        };
    }
};

/**
 * @class
 *
 * Manages 3D sound sources using Web Audio Api.
 *
 * This should fallback to playing the sound at different volumes when Web Audio Api is not available.
 *
 * @constructor
 */
function SoundManager( scene ) {
    if ( webkitAudioContext ) {
        this.scene = scene;
        this.context = new webkitAudioContext();
        this.compressor = this.context.createDynamicsCompressor();
        this.compressor.connect( this.context.destination );

        this.context.oncomplete = function() {
            console.log( 'complete!' );
            console.log( arguments );
        };

        this.playing = {};
        this.bufferData = {};
        this.bufferSource = {};
    }
    else {
        return new BasicSoundManager();
    }
}

SoundManager.prototype = {
    /**
     * @public
     */
    update: function( dt ) {
        for ( var uid in this.playing ) {
            if ( this.playing[ uid ].end > this.context.currentTime ) {
                console.log( 'no longer playing ' + uid );
                this.playing[ uid ].source.nowPlaying = null;
                delete this.playing[ uid ];
                delete this.bufferSource[ uid ];
            }
        }

        var soundSources = this.scene.findClass( this.scene, SoundSource );
        for ( var i = 0; i < soundSources.length; ++i ) {
            this.handleSource( soundSources[ i ] );
        }
    },
    handleSource: function( source ) {
        var self = this, asset = source.nowPlaying;


        if ( !asset ) {
            return;
        }

        if ( !this.bufferData[ asset.uid ] ) {
            console.log( 'loading', asset.url, asset.uid, source.uid );
            var request = new XMLHttpRequest();
            request.open( "GET", asset.url, true );
            request.responseType = "arraybuffer";
            request.onload = function( data ) {
                console.log( 'loaded' );
                self.bufferData[ asset.uid ] = request.response;
                self.playSource( source, asset );
            };
            request.send();
            return;
        }

        console.log( 'trying to play' );
        this.playEffect( source, asset );
    },
    playEffect: function( source, effect ) {
        if ( !effect ) {
            console.log( 'no effect passed to playSource' );
            return;
        }

        if ( this.playing[ source.uid ] ) {
            console.log( 'source ' + source.uid + ' is playing right now' );
            return;
        }

        console.log( 'starting to play ' + source.uid + ' ' + effect.uid );

        var bufferSource = this.context.createBufferSource();
        bufferSource.buffer = this.context.createBuffer( this.bufferData[ effect.uid ], false );

        var panner = this.context.createPanner();
        var gain = this.context.createGainNode();

        var pos = source.getAbsolutePosition().data;
        panner.setPosition( pos[ 0 ], pos[ 1 ], pos[ 2 ] );

        bufferSource.connect( panner );
        panner.connect( gain );
        gain.connect( this.compressor );

        bufferSource.loop = true;
        bufferSource.noteOn( 0 );

        this.playing[ source.uid ] = { effect: effect, source: source, start: this.context.currentTime, end: this.context.currentTime + bufferSource.buffer.duration };
    }
};

