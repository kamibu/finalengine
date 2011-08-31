// extern
var Camera, RenderManager, Scene, Importer, Exporter;

function Application() {
    this.renderManager = new RenderManager();
    this.scene = new Scene();
    this.camera = new Camera().setPosition( [ 0, 0, 10 ] );

    this.importer = new Importer( 'resources' );
    this.exporter = new Exporter( 'resources' );

    this.scene.appendChild( this.camera );

    var canvas = this.renderManager.renderer.canvas;
    this.setupCanvas( canvas );

    var self = this;
    this._nextFrame = null;
    this.capFPS( 60 );

    ( function renderLoop() {
        self.renderManager.renderScene( self.scene, self.camera );
        // console.log( self._nextFrame );
        self._nextFrame( renderLoop );
    }() );
}

Application.prototype = {
    constructor: Application,
    setupCanvas: function( canvas ) {
        var self = this;
        window.addEventListener( 'resize', function() {
            self.resize( window.innerWidth, window.innerHeight );
        }, false );
        document.body.appendChild( canvas );
        this.resize( window.innerWidth, window.innerHeight );
        return this;
    },
    resize: function( width, height ) {
        this.renderManager.resize( width, height );
        var camera = this.camera;
        camera.width = width;
        camera.height = height;
        camera.setPerspective();
        return this;
    },
    capFPS: function( fps ) {
        if ( fps >= 60 ) {
            fps = 60;
            this._nextFrame = window.requestAnimationFrame.bind( window );
        }
        else {
            this._nextFrame = function( renderLoop ) {
                setTimeout( renderLoop, 1000 / fps );
            };
        }
    }
};
