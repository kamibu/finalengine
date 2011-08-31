// extern
var Camera, RenderManager, Scene, Importer, Exporter, InputHandler;

function Application() {
    this.renderManager = new RenderManager();
    this.scene = new Scene();
    this.camera = new Camera().setPosition( [ 0, 0, 10 ] );

    this.importer = new Importer( 'resources' );
    this.exporter = new Exporter( 'resources' );

    this.input = new InputHandler();

    this.scene.appendChild( this.camera );

    var canvas = this.renderManager.renderer.canvas;
    this.setupCanvas( canvas );

    var self = this;
    this._nextFrame = null;
    this.capFPS( 60 );

    var t = Date.now();
    function renderLoop() {
        var now = Date.now();
        self.onBeforeRender( t - now );
        t = now;
        self.renderManager.renderScene( self.scene, self.camera );
        // console.log( self._nextFrame );
        self._nextFrame( renderLoop );
    }

    // it is necessary to call this asynchronously because the inheriting
    // developer may override the constructor and will call the parent constructor
    // initially; the rest of the inheriting constructor will initilize some objects
    // which may be required by the renderLoop; therefore run it after the inheriting
    // constructor has finished initializations
    setTimeout( renderLoop, 1 );
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
    onBeforeRender: function ( elapsed ) {
        // overwrite me
    },
    capFPS: function( fps ) {
        if ( fps >= 60 ) {
            this._nextFrame = window.requestAnimationFrame.bind( window );
        }
        else {
            this._nextFrame = function( renderLoop ) {
                setTimeout( renderLoop, 1000 / fps );
            };
        }
    }
};
