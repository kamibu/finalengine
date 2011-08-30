// extern
var Camera, RenderManager, Scene, Importer, Exporter;

function Application() {
    var t = new Date() - 0;

    this.renderManager = new RenderManager();
    this.scene = new Scene();
    this.camera = new Camera().setPosition( [ 0, 0, 10 ] );

    this.importer = new Importer( 'resources' );
    this.exporter = new Exporter( 'resources' );

    this.scene.root.appendChild( this.camera );

    var canvas = this.renderManager.renderer.canvas;
    this.setupCanvas( canvas );

    this.resize( window.innerWidth, window.innerHeight );

    var self = this;
    
    this._nextFrame = null;
    this.capFPS( 60 );

    function renderLoop() {
        var dt = ( new Date() - 0 ) - t;
        self.onBeforeRender( dt );
        self.renderManager.renderScene( self.scene, self.camera );
        // console.log( self._nextFrame );
        self._nextFrame( renderLoop );
        t = ( new Date() - 0 );
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
