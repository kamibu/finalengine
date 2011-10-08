/*global
    Camera          : false,
    Exporter        : false,
    Importer        : false,
    RenderManager   : false,
    Scene           : false,
    Vector3         : false,
    InputHandler    : false,
    UIComponent     : false
*/

/**
 * @constructor
 *
 * The main object of a game. Initializes basic modules and starts the main loop.
 *
 */
function Application() {
    var self = this;

    /**
     * The render manager used for rendering the scene.
     * Its {@link RenderManager#renderScene} method is called in a loop.
     * @type {RenderManager}
     */
    this.renderManager = new RenderManager();

    /**
     * The scene to be rendered. Change this property if you need to render some other scene object.
     * @type {Scene}
     */
    this.scene = new Scene();

    /**
     * The default camera.
     *
     * Its original position is at (0, 0, 10). To change the camera used for rendering, change the scene, not this property.
     * @type {Camera}
     */
    this.camera = new Camera().setPosition( new Vector3( [ 0, 0, 10 ] ) );

    /**
     * The default importer.
     *
     * Imports from "resources" folder. If no callback is passed, the default callback adds the loaded node to the application's scene.
     * @type {Importer}
     */
    this.importer = new Importer( 'resources', function( node ) {
        self.scene.appendChild( node );
    } );

    /**
     * The default exporter. Exports to "resources" folder.
     * @type {Exporter}
     */
    this.exporter = new Exporter( 'resources' );

    /**
     * @type {InputHandler}
     */
    this.input = new InputHandler();

    /**
     * @type {UIComponent}
     */
    this.ui = new UIComponent();

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
     * @param {number} width
     * @param {number} height
     * @returns this
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
     * @param {string} title
     * @returns this
     */
    setTitle: function( title ) {
        document.title = title;
        return this;
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
     * @param dt milliseconds since the previous update
     */
    update: function ( dt ) {
        // override me
    },
    /**
     * Limit rendering frames per second.
     * @param {number} fps
     */
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
