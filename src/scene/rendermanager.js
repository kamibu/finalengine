/*global Matrix4:true, Renderer:true, Drawable:true, Framebuffer:true, Mesh:true, Buffer:true, VertexAttribute:true, Light:true, Texture:true, Skybox: true */

/**
 * @class
 * Renders a Scene object.
 *
 * @constructor
 */
function RenderManager() {
    /**
     * The Renderer used for rendering.
     * @type Renderer
     */
    this.renderer = new Renderer();

    this.forcedMaterial = null;

    this.postProcess = false;

    /**
     * @type FrameBuffer
     * The framebuffer used for post process effects.
     */
    this.framebuffer = new Framebuffer( this.renderer.width, this.renderer.height );

    if ( this.renderer.getParameter( Renderer.FLOAT_TEXTURE ) ) {
        this.framebuffer.colorTexture.setDataType( Texture.FLOAT );
    }

    this.postProcessEffects = [];

    this.quad = new Mesh();
    this.quad.setVertexAttribute( new VertexAttribute( 'UVCoord' ).setBuffer( new Buffer().setData( [ -1, -1, 1, 1, -1, 1, 1, -1 ] ) ).setSize( 2 ) );
    this.quad.setIndexBuffer( new Buffer( Buffer.ELEMENT_BUFFER ).setData( [ 0, 1, 2, 0, 3, 1 ] ) );

    this.globalUniformCache = {
        Time: Date.now(),
        ProjectionMatrix: new Matrix4(),
        ViewMatrix: new Matrix4(),
        WorldMatrix: new Matrix4(),
        ViewProjectionMatrix: new Matrix4(),
        WorldViewMatrix: new Matrix4(),
        WorldViewProjectionMatrix: new Matrix4()
    };
}

RenderManager.prototype = {
    constructor: RenderManager,
    /**
     * @public
     * @param {Material} material
     */
    addPostProcessEffect: function( material ) {
        this.postProcess = true;
        this.postProcessEffects.push( material );
        return this;
    },
    /**
     * @public
     */
    applyPostProcessEffects: function() {
        var i, l, effect,
            effects = this.postProcessEffects,
            quad = this.quad,
            renderer = this.renderer,
            colorTexture = this.framebuffer.colorTexture;

        l = effects.length;

        renderer.bindFramebuffer( null );
        renderer.clear();
        for ( i = 0; i < l; ++i ) {
            effect = effects[ i ];
            effect.setParameter( 'ColorTexture', colorTexture );
            effect.setParameter( 'FramebufferWidth', this.framebuffer.width );
            effect.setParameter( 'FramebufferHeight', this.framebuffer.height );
            renderer.useShader( effect.getShader() );
            renderer.render( quad );
        }
        return this;
    },
    /**
     * @public
     */
    resize: function( width, height ) {
        this.renderer.setSize( width, height );
        this.framebuffer.setDimensions( width, height );
        return this;
    },
    /**
     * @public
     */
    renderScene: function( scene, camera ) {
        if ( this.postProcess ) {
            this.renderer.bindFramebuffer( this.framebuffer );
        }

        this.renderer.clear();
        var g = this.globalUniformCache;
        camera.projectionMatrix.copyTo( g.ProjectionMatrix );
        camera.getAbsoluteInverseMatrix( g.ViewMatrix );
        g.ViewProjectionMatrix.set( g.ProjectionMatrix ).multiply( g.ViewMatrix );

        // TODO: Draw non-transparent materials first, then transparent materials
        //Sort drawables by material

        var drawableList = scene.drawableList;

        drawableList.sort( function( a, b ) {
            return a.material.uid - b.material.uid;
        } );

        var currentMaterial = -1;
        var l = drawableList.length;
        while ( l-- ) {
            var currentDrawable = drawableList[ l ];
            currentDrawable.onBeforeRender( camera );
            currentDrawable.getAbsoluteMatrix( g.WorldMatrix );

            g.WorldViewMatrix.set( g.ViewMatrix ).multiply( g.WorldMatrix );
            g.WorldViewProjectionMatrix.set( g.ViewProjectionMatrix ).multiply( g.WorldMatrix );

            var material = currentDrawable.material;
            for ( var engineParameter in material.engineParameters ) {
                material.setParameter( engineParameter, g[ engineParameter ] );
            }

            this.renderer.useShader( material.getShader() );
            this.renderer.render( currentDrawable.mesh );
        }

        if ( this.postProcess ) {
            this.applyPostProcessEffects();
        }
    }
};
