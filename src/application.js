function Application() {
    this.renderManager = new RenderManager();
    this.scene = new Scene();
    this.camera = new Camera().setPosition( [ 0, 0, 10 ] );

    this.scene.root.appendChild( this.camera );
}

Application.prototype = {
    start: function() {
        var self = this;
        (function renderLoop() {
            self.renderManager.renderScene( self.scene, self.camera );
            window.requestAnimationFrame( renderLoop );
        } )();
        return this;
    }
};
