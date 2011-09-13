// extern
var Matrix4, Renderer, Drawable, Framebuffer, Mesh, Buffer, VertexAttribute, Light, Texture;

function RenderManager() {
    this.renderer = new Renderer();
    this.forcedMaterial = null;

    this.postProcess = false;

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
        InverseProjectionMatrix: new Matrix4(),
        ViewMatrix: new Matrix4(),
        WorldMatrix: new Matrix4(),
        ViewProjectionMatrix: new Matrix4(),
        WorldViewMatrix: new Matrix4(),
        WorldViewProjectionMatrix: new Matrix4()
    };
}


RenderManager.prototype = {
    constructor: RenderManager,
    addPostProcessEffect: function( material ) {
        this.postProcess = true;
        this.postProcessEffects.push( material );
        return this;
    },
    applyPostProcessEffects: function() {
        var i, l, effect,
            effects = this.postProcessEffects,
            quad = this.quad,
            renderer = this.renderer,
            colorTexture = this.framebuffer.colorTexture;

        l = effects.length;

        var g = this.globalUniformCache;
        renderer.bindFramebuffer( null );
        renderer.clear();
        for ( i = 0; i < l; ++i ) {
            effect = effects[ i ];
            for ( var engineParameter in effect.engineParameters ) {
                effect.setParameter( engineParameter, g[ engineParameter ] );
            }
            effect.setParameter( 'ColorTexture', colorTexture );
            effect.setParameter( 'FramebufferWidth', this.framebuffer.width );
            effect.setParameter( 'FramebufferHeight', this.framebuffer.height );
            renderer.useShader( effect.getShader() );
            renderer.render( quad );
        }
        return this;
    },
    resize: function( width, height ) {
        this.renderer.setSize( width, height );
        this.framebuffer.setDimentions( width, height );
        return this;
    },
    renderScene: function( scene, camera ) {
        if ( this.postProcess ) {
            this.renderer.bindFramebuffer( this.framebuffer );
        }

        this.renderer.clear();
        var g = this.globalUniformCache;
        camera.projectionMatrix.setTo( g.ProjectionMatrix );
        camera.getAbsoluteInverseMatrix( g.ViewMatrix );
        g.ViewProjectionMatrix.set( g.ProjectionMatrix ).multiply( g.ViewMatrix );
        g.InverseProjectionMatrix.set( g.ProjectionMatrix ).inverse();

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
