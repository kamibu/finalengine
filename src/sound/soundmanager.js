/*jshint newcap: false */
/*global SoundSource: false, webkitAudioContext:  false */

/**
 * @class
 *
 * Manages 3D sound sources using Web Audio Api.
 *
 * This should fallback to playing the sound at different volumes when Web Audio Api is not available.
 */
function SoundManager( scene ) {
    this.scene = scene;
    this.context = new webkitAudioContext();
    this.compressor = this.context.createDynamicsCompressor();
    this.compressor.connect( this.context.destination );
}

SoundManager.prototype = {
    /**
     * @public
     */
    update: function( dt ) {
        var soundSources = this.scene.findClass( this.scene, SoundSource );
        for ( var i = 0; i < soundSources.length; ++i ) {
            this.handleSource( soundSources[ i ] );
        }
    },
    handleSource: function( source ) {
        var self = this;

        source.onPlaying = function( asset ) {
            var bufferSource = self.context.createBufferSource();
            bufferSource.buffer = self.context.createBuffer( asset.data, false );

            var panner = self.context.createPanner();
            var gain = self.context.createGainNode();

            var pos = this.getAbsolutePosition().data;
            panner.setPosition( pos[ 0 ], pos[ 1 ], pos[ 2 ] );

            bufferSource.connect( panner );
            panner.connect( gain );
            gain.connect( self.compressor );

            bufferSource.noteOn( 0 );
        };
    }
};
