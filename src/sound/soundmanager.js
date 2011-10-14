/*jshint newcap: false */
/*global SoundAsset: false, SoundSource: false, webkitAudioContext:  false, assert: false */

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

    /**
     * The scene associated with this manager.
     */
    this.scene = scene;

    /**
     * The camera associated with this manager.
     */
    this.camera = camera;

    /**
     * Cached asset buffer data.
     */
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

/**
 * The distance from where the listener cannot hear anymore.
 * This is used only when the Web Audio Api is NOT being used.
 */
SoundManager.MAX_HEARING_DISTANCE = 200;

SoundManager.prototype = {
    constructor: SoundManager,
    /**
     * @public
     * @param Number dt milliseconds since last update
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
    /**
     * Manage a new SoundSource.
     * The SoundManager adds sources added to the associated scene by itself.
     * @param SoundSource source
     */
    addSource: function( source ) {
        var self = this;

        /*DEBUG*/
        assert( source instanceof SoundSource, 'Tried to add source that is not instance of SoundSource' );
        /*DEBUG_END*/

        function onplaying( asset ) {
            /*DEBUG*/
            assert( asset instanceof SoundAsset, 'Tried to play asset that is not instance of SoundAsset' );
            /*DEBUG_END*/
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
    /**
     * Stop managing a SoundSource and remove references to it.
     * The SoundManager removes sources removed from the associated scene by itself.
     * @param SoundSource source
     */
    removeSource: function( source ) {
        /*DEBUG*/
        assert( source instanceof SoundSource, 'Tried to remove source that is not instance of SoundSource' );
        assert( source.uid in this.callbacks, 'Tried to remove source that was not added' );
        /*DEBUG_END*/

        var eventName, callbacks = this.callbacks[ source.uid ];
        for ( eventName in callbacks ) {
            source.removeListener( eventName, callbacks[ eventName ] );
        }
        delete this.callbacks[ source.uid ];
        delete this.playing[ source.uid ];
    },
    /**
     * Start playing an asset from a sound source.
     * This is automatically called when a added SoundSource starts playing an asset.
     * @param SoundSource source
     * @param SoundAsset asset
     */
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
    /**
     * Stop playing a sound from an asset.
     * This is automatically called when a added SoundSource stops playing an asset.
     * @param SoundSource source
     * @param SoundAsset asset
     */
    endAsset: function( source, asset ) {
        // this.playing[ source.uid ].bufferSource.noteOff( 0 );
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
    /**
     * Load asset data to an ArrayBuffer.
     * @param SoundAsset asset
     * @param Function [callback] Will be called with an ArrayBuffer parameter.
     */
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
