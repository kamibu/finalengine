function Application() {
    this.renderManager = new RenderManager();
    this.scene = new Scene();
    this.camera = new Camera();

    this.scene.root.appendChild( this.camera );
    //this.camera.move( 0, 0, 10 );
}

Application.prototype = {
    start: function() {
        setTimeout( function() {
            this.renderManager.renderScene( this.scene, this.camera );
        }.bind( this ), 3000 );
        return this;
    }
};
