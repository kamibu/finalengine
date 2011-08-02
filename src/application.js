function Application() {
    this.renderManager = new RenderManager();
    this.scene = new Scene();
    this.camera = new Camera().setPosition( [ 0, 0, 10 ] );

    this.scene.root.appendChild( this.camera );
}

Application.prototype = {
    start: function() {
        var self = this;

        document.body.appendChild( this.renderManager.renderer.canvas );

        function snapToWindow() {
            self.renderManager.renderer.setSize( window.innerWidth, window.innerHeight );
        }
        snapToWindow();
        window.addEventListener( 'resize', snapToWindow, false );

        (function renderLoop() {
            self.renderManager.renderScene( self.scene, self.camera );
            window.requestAnimationFrame( renderLoop );
        } )();
        return this;
    }
};
