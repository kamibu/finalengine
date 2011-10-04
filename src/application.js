/*global
    Camera         : false,
    Exporter       : false,
    Importer       : false,
    RenderManager  : false,
    Scene          : false,
    Vector3        : false,
    InputHandler    : false
*/

/**
 * @class
 *
 * Abstract application class that initializes basic modules and starts the main loop.
 *
 * Extend this class to write your own initialization code on the constructor of a
 * child class.
 */
function Application() {
    var self = this;

    /**
     * The render manager used for rendering the scene.
     * Its {@link RenderManager#renderScene} method is called in a loop.
     * @type RenderManager
     */
    this.renderManager = new RenderManager();

    /**
     * The scene to be rendered. Change this property if you need to render some other scene object.
     * @type Scene
     */
    this.scene = new Scene();

    /**
     * The default camera.
     *
     * Its original position is at (0, 0, 10). Setting this property to another camera does not affect the rendering.
     * @type Camera
     */
    this.camera = new Camera().setPosition( new Vector3( [ 0, 0, 10 ] ) );

    /**
     * The default importer.
     *
     * Imports from "resources" folder. If no callback is passed, the default callback adds the loaded node to the application's scene.
     * @type Importer
     */
    this.importer = new Importer( 'resources', function( node ) {
        self.scene.appendChild( node );
    } );

    /**
     * The default exporter. Exports to "resources" folder.
     * @type Exporter
     */
    this.exporter = new Exporter( 'resources' );

    /**
     * @type InputHandler
     */
    this.input = new InputHandler();

    /**
     * The default input handler.
     * @type InputHandler
     */
//    this.input = new InputHandler();

    this.scene.appendChild( this.camera );

    var canvas = this.renderManager.renderer.canvas;
    this.setupCanvas( canvas );

    this._nextFrame = null;
    this.capFPS( 60 );

    var t = Date.now();
    function renderLoop() {
        var now = Date.now();
        self.onBeforeRender( now - t );
        t = now;
        self.renderManager.renderScene( self.scene, self.camera );
        // console.log( self._nextFrame );
        self._nextFrame( renderLoop );
    }

    var tUpdate = Date.now();
    setInterval( function() {
        var now = Date.now();
        self.update( now - tUpdate );
        tUpdate = now;
    }, 1000 / 60 );

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
    /**
     * Resize canvas.
     */
    resize: function( width, height ) {
        this.renderManager.resize( width, height );
        var camera = this.camera;
        camera.width = width;
        camera.height = height;
        camera.setPerspective();
        return this;
    },
    /**
     * Set the application title (alters the <title> tag).
     */
    setTitle: function( title ) {
        document.title = title;
    },
    /**
     * Override this method to update your application before rendering.
     * The render loop uses requestAnimationFrame.
     * @param dt milliseconds since the previous onBeforeRender.
     */
    onBeforeRender: function( dt ) {
    },
    /**
     * Override this method to update your application on every iteration of the main loop.
     * The main loop is an interval called around 60 times per second.
     * @param dt milliseconds since the previous update */
    update: function ( dt ) {
        // override me
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
