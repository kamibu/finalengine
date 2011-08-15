// extern
var Camera, RenderManager, Scene, Importer, Exporter;

function Application() {
    this.renderManager = new RenderManager();
    this.scene = new Scene();
    this.camera = new Camera().setPosition( [ 0, 0, 10 ] );

    this.importer = new Importer( 'resources' );
    this.exporter = new Exporter( 'resources' );

    this.scene.root.appendChild( this.camera );

    this.setupCanvas( this.renderManager.renderer.canvas );

    this.handleResize();
    window.addEventListener( 'resize', this.handleResize.bind( this ), false );
    
    var self = this;
    ( function renderLoop() {
        self.renderManager.renderScene( self.scene, self.camera );
        window.requestAnimationFrame( renderLoop );
    }() );
}

Application.prototype = {
    constructor: Application,
    setupCanvas: function( canvas ) {
        document.body.appendChild( canvas );
        return this;
    },
    handleResize: function() {
        var w = window.innerWidth;
        var h = window.innerHeight;
        this.renderManager.renderer.setSize( w, h );

        var camera = this.camera;
        camera.width = w;
        camera.height = h;
        camera.setPerspective();
        return this;
    }
};
