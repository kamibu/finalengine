function Scene() {
    this.root = new Node();
}

Scene.prototype = {
    constructor: Scene,
    add: function( node ) {
        this.root.appendChild( node );
    }
};
