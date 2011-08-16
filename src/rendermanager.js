// extern
var Matrix4, Renderer, Drawable;

function RenderManager() {
    this.renderer = new Renderer();
    this.forcedMaterial = null;

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
    renderScene: function( scene, camera ) {
        this.renderer.clear();
        var g = this.globalUniformCache;
        camera.projectionMatrix.setTo( g.ProjectionMatrix );
        camera.getInverseMatrix( g.ViewMatrix );
        g.ViewProjectionMatrix.set( g.ProjectionMatrix ).multiply( g.ViewMatrix );

        var bucket = [];
        function fillDrawBucket( node ) {
            if ( Drawable.prototype.isPrototypeOf( node ) ) {
                bucket.push( node );
            }
            var children = node.children;
            var l = children.length;
            while ( l-- ) {
                fillDrawBucket( children[ l ] );
            }
            //I have a dream. Where array.forEach is faster than looping
            //node.children.forEach( fillDrawBucket );
        }
        fillDrawBucket( scene.root );

        // TODO: Draw non-transparent materials first, then transparent materials
        //Sort drawables by material
        bucket.sort( function( a, b ) {
            return a.material.uid - b.material.uid;
        } );
        var currentMaterial = -1;
        var l = bucket.length;
        while ( l-- ) {
            var currentDrawable = bucket[ l ];
            currentDrawable.onBeforeRender( camera );
            currentDrawable.getMatrix( g.WorldMatrix );
            g.WorldViewMatrix.set( g.ViewMatrix ).multiply( g.WorldMatrix );
            g.WorldViewProjectionMatrix.set( g.ViewProjectionMatrix ).multiply( g.WorldMatrix );

            var material = currentDrawable.material;
            for ( var engineParameter in material.engineParameters ) {
                material.setParameter( engineParameter, g[ engineParameter ] );
            }

            this.renderer.useShader( material.getShader() );
            this.renderer.render( currentDrawable.mesh );
        }
    }
};
