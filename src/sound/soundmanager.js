/*jshint newcap: false */
/*global SoundSource: false, webkitAudioContext:  false */

/**
 * @class
 *
 * Manages 3D sound sources using Web Audio Api.
 *
 * This falls back to playing the sound at different volumes when Web Audio Api is not available.
 *
 * @constructor
 */
function SoundManager( scene, camera ) {
    var self = this;

    this.scene = scene;
    this.camera = camera;
    this.bufferData = {};

    this.scene.on( 'childadded', function onchildadded( node ) {
        if ( node instanceof SoundSource ) {
            self.addSource( node );
        }
        else {
            for ( var i = 0; i < node.children.length; ++i ) {
                onchildadded( node.children[ i ] );
            }
        }
    } );
    this.scene.on( 'childremoved', function onchildremoved( node ) {
        if ( node instanceof SoundSource ) {
            self.removeSource( node );
        }
        else {
            for ( var i = 0; i < node.children.length; ++i ) {
                onchildremoved( node.children[ i ] );
            }
        }
    } );

    this.playing = {};
    this.callbacks = {};

    if ( webkitAudioContext ) {
        this.context = new webkitAudioContext();
        this.compressor = this.context.createDynamicsCompressor();
        this.compressor.connect( this.context.destination );
    }
}

SoundManager.MAX_HEARING_DISTANCE = 200;

SoundManager.prototype = {
    /**
     * @public
     */
    update: function( dt ) {
        var uid, cpos = this.camera.getAbsolutePosition().data;
        if ( this.context ) {
            this.context.listener.setPosition( cpos[ 0 ], cpos[ 1 ], cpos[ 2 ] );
            for ( uid in this.playing ) {
                this.updatePanner( this.playing[ uid ].source, this.playing[ uid ].panner );
            }
        }
    },
    addSource: function( source ) {
        var self = this;

        if ( !( source instanceof SoundSource ) ) {
            return;
        }

        function onplaying( asset ) {
            self.playAsset( source, asset );
        }
        function onended( asset ) {
            self.endAsset( source, asset );
        }
        function onsoundadded( asset ) {
            if ( self.context && source.parent != self.camera ) {
                self.loadBufferData( asset );
            }
            else {
                asset.tag.load();
            }
        }

        source.on( 'playing', onplaying );
        source.on( 'ended', onended );
        source.on( 'soundadded', onsoundadded );

        this.callbacks[ source.uid ] = {
            onplaying: onplaying,
            onended: onended,
            onsoundadded: onsoundadded
        };
    },
    removeSource: function( source ) {
        var eventName, callbacks = this.callbacks[ source.uid ];
        for ( eventName in callbacks ) {
            source.removeListener( eventName, callbacks[ eventName ] );
        }
    },
    playAsset: function( source, asset ) {
        var self = this;
        if ( this.context && source.parent != this.camera ) {
            if ( this.bufferData[ asset.uid ] ) {
                this.playFromAudioBuffer( source, asset );
            }
            else {
                this.loadBufferData( asset, function() {
                    self.playFromAudioBuffer( source, asset );
                } );
            }
        }
        else {
            this.playFromAudioTag( source, asset );
        }
    },
    playFromAudioTag: function( source, asset ) {
        var distVector = source.getAbsolutePosition().subtract( this.camera.getAbsolutePosition() ),
            dist = distVector.length(),
            vol = ( SoundManager.MAX_HEARING_DISTANCE - dist ) / SoundManager.MAX_HEARING_DISTANCE;

        asset.tag.load();
        asset.tag.volume = vol > 0 ? vol : 0;
        asset.tag.play();
    },
    playFromAudioBuffer: function( source, asset ) {
        var bufferSource = this.context.createBufferSource(),
            panner = this.context.createPanner(),
            gain = this.context.createGainNode();

        bufferSource.buffer = this.context.createBuffer( this.bufferData[ asset.uid ], false );

        this.updatePanner( source, panner );

        bufferSource.connect( panner );
        panner.connect( gain );
        gain.connect( this.compressor );

        bufferSource.loop = source.loop == SoundSource.LOOP_ONE;
        bufferSource.noteOn( 0 );

        this.playing[ source.uid ] = {
            asset: asset,
            source: source,
            bufferSource: bufferSource,
            start: this.context.currentTime,
            end: source.loop ? Infinity : this.context.currentTime + bufferSource.buffer.duration,
            panner: panner
        };
    },
    endAsset: function( source, asset ) {
        if ( source.loop != SoundSource.LOOP_ONE ) {
            delete this.playing[ source.uid ];
        }
    },
    updatePanner: function( source, panner ) {
        var pos = source.getAbsolutePosition().data,
            vel = source.getVelocity().data;

        panner.setPosition( pos[ 0 ], pos[ 1 ], pos[ 2 ] );
        panner.setVelocity( vel[ 0 ], vel[ 1 ], vel[ 2 ] );
    },
    loadBufferData: function( asset, callback ) {
        var self = this, request = new XMLHttpRequest();

        request.open( "GET", asset.url, true );
        request.responseType = "arraybuffer";
        request.onload = function() {
            self.bufferData[ asset.uid ] = request.response;
            if ( typeof callback == "function" ) {
                callback();
            }
        };
        request.send();
    }
};
