// extern
var Camera, RenderManager, Scene, Importer, Exporter;

function Application() {
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
    
    ( function renderLoop() {
        self.renderManager.renderScene( self.scene, self.camera );
        window.requestAnimationFrame( renderLoop );
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
        return this;
    },
    resize: function( width, height ) {
        this.renderManager.resize( width, height );
        var camera = this.camera;
        camera.width = width;
        camera.height = height;
        camera.setPerspective();
        return this;
    }
};
