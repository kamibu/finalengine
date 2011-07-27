var Scene = function() {
    this.root = new Node();
}

Scene.prototype = {
    add: function( node ) {
        this.root.appendChild( node );
    }
}
