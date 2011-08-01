function RenderManager() {
    this.renderer = new Renderer();
    this.forcedMaterial = null;
    
    this.globalUniformCache = {
        Time: Date.now(),
        ProjectionMatrix: Matrix4(),
        ViewMatrix: Matrix4(),
        WorldMatrix: Matrix4(),
        ViewProjectionMatrix: Matrix4(),
        WorldViewMatrix: Matrix4(),
        WorldViewProjectionMatrix: Matrix4()
    };
}


RenderManager.prototype = {
    constructor: RenderManager,
    getParameter: function( name ) {
        var g = this.globalUniformCache;
        switch ( name ) {
            case 'Time':
                if ( !g.Time ) {
                    g.Time = Date.now();
                }
                return g.Time;
            case 'ProjectionMatrix':
                return g.ProjectionMatrix;
            case 'ViewMatrix':
                return g.ViewMatrix;
            case 'WorldMatrix':
                return g.WorldMatrix;
            case 'ViewProjectionMatrix':
                if ( !g.ViewProjectionMatrix ) {
                    g.ViewProjectionMatrix.set( camera.projectionMatrix ).multiply( g.ViewMatrix );
                }
                return g.ViewProjectionMatrix;
            case 'WorldViewMatrix':
                if ( !g.WorldViewMatrix ) {
                    g.WorldViewMatrix.set( g.ViewMatrix ).multiply( g.WorldMatrix );
                }
                return g.WorldViewMatrix;
            case 'WorldViewProjectionMatrix':
                if ( !g.WorldViewProjectionMatrix ) {
                    g.WorldViewProjectionMatrix.set( g.ProjectionMatrix ).multiply( g.ViewMatrix ).multiply( g.WorldMatrix );
                }
                return g.WorldViewProjectionmatrix;
        }
    },
    renderScene: function( scene, camera ) {
        var g = this.globalUniformCache;
        g.ProjectionMatrix.set( camera.projectionMatrix );
        camera.getInverseMatrix( g.ViewMatrix );

        var bucket = [];
        function fillDrawBucket( node ) {
            if ( node.mesh ) {
                bucket.push( node );
            }
            var l = node.children.length;
            while ( l-- ) {
                fillDrawBucket( node.children[ l ] );
            }
        }
        fillDrawBucket( scene.root );

        //Sort drawables by material
        bucket.sort( function( a, b ) {
            return a.material.uid - b.material.uid;    
        } );

        var l = bucket.length;
        while ( l-- ) {
            var currentDrawable = bucket[ l ];
            currentDrawable.onBeforeRender( camera );
            currentDrawable.getMatrix( g.WorldMatrix );
            
            var material = currentDrawable.material;
            for ( var engineParameter in material.engineParameters ) {
                material.set( engineParameter, this.getParameter( engineParameter ) );
            }

            this.renderer.useShader( material.getShader() );
            this.renderer.render( currentDrawable.mesh );
        }
    }
};
