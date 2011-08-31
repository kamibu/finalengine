// extern
var Node, Drawable;

function Scene() {
    Node.call( this );
    this.drawableList = [];
}

Scene.prototype = {
    constructor: Scene,
    findDrawables: function( node ) {
        var bucket = [];
        function fillBucket( node ) {
            if ( node instanceof Drawable ) {
                bucket.push( node );
            }
            var children = node.children;
            var l = children.length;
            while ( l-- ) {
                fillBucket( children[ l ] );
            }
        }
        fillBucket( node );
        return bucket;
    },
    onChildAdded: function( node, nodeAdded ) {
        this.Node_onChildAdded( node, nodeAdded );
        var drawables = this.findDrawables( nodeAdded );
        this.drawableList.push.apply( this.drawableList, drawables );
    },
    onChildRemoved: function( node, nodeRemoved ) {
        var drawables = this.findDrawables( nodeRemoved );
        var l = drawables.length;
        while ( l-- ) {
            this.drawableList.splice( this.drawableList.indexOf( drawables[ l ] ), 1 );
        }
    }
};

Scene.extend( Node );
