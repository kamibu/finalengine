function RenderManager() {
    this.renderer = new Renderer();
    this.textureManager = new TextureManager();
    this.shaderManager = new ShaderManager();
    
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
    getParameter: function( name ) {
        var g = this.globalUniformCache;
        switch ( name ) {
            case 'Time':
                if ( g.Time ) {
                    return g.Time;
                }
                return g.Time = Date.now();
            case 'ProjectionMatrix':
                return g.ProjectionMatrix;
            case 'ViewMatrix':
                return g.ViewMatrix;
            case 'WorldMatrix':
                return g.WorldMatrix;
            case 'ViewProjectionMatrix':
                if ( g.ViewProjectionMatrix ) {
                    return g.ViewProjectionMatrix;
                }
                return g.ViewProjectionMatrix.set( camera.projectionMatrix ).multiply( g.ViewMatrix );
            case 'WorldViewMatrix':
                if ( g.WorldViewMatrix ) {
                    return g.WorldViewMatrix );
                }
                return g.WorldViewMatrix.set( g.ViewMatrix ).multiply( g.WorldMatrix );
            case 'WorldViewProjectionMatrix':
                if ( g.WorldViewProjectionMatrix ) {
                    return g.WorldViewProjectionmatrix;
                }
                return g.WorldViewProjectionMatrix.set( g.ProjectionMatrix ).multiply( g.ViewMatrix ).multiply( g.WorldMatrix );
        }
    },
    renderScene: function( scene, camera ) {
        var g = this.globalUniformCache;
        g.ProjectionMatrix.set( camera.projectionMatrix );
        camera.getInverseMatrix( g.ViewMatrix );

        function fillDrawBucket( node ) {
            if ( node.mesh ) {
                bucket.push( node );
            }
            var l = node.children.length;
            while ( l-- ) {
                fillDrawBucket( node.children[ l ] );
            }
        }
        var bucket = [];
        fillDrawBucket( scene.root );

        var l = bucket.length;
        while ( l-- ) {
            var currentDrawable = bucket[ l ];
            currentDrawable.onBeforeRender( camera );
            currentDrawable.getMatrix( g.WorldMatrix );
            
            var material = currentDrawable.material;
            for ( engineParameter in material.engineParameters ) {
                material.set( engineParameter, this.getParameter( engineParameter ) );
            }

            this.renderer.useShader( material.getShader() );
            this.renderer.render( currentDrawable.mesh );
        }
    }
};
