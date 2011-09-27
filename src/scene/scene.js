// extern
var Node, Drawable;

/**
 * @class
 *
 * The tree of nodes to be rendered.
 *
 * @extends Node
 */
function Scene() {
    Node.call( this );
    this.drawableList = [];
}

Scene.prototype = {
    constructor: Scene,
    /**
     * Returns the nodes in the tree below a given node that are instances of {@link Drawable}.
     * @param {Node} node
     * @returns {Array} An array of nodes.
     */
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
    onChildAdded: function( node ) {
        this.Node_onChildAdded( node );
        var drawables = this.findDrawables( node );
        this.drawableList.push.apply( this.drawableList, drawables );
    },
    onChildRemoved: function( node, parentNode ) {
        var drawables = this.findDrawables( node );
        var l = drawables.length;
        while ( l-- ) {
            this.drawableList.splice( this.drawableList.indexOf( drawables[ l ] ), 1 );
        }
    }
};

Scene.extend( Node );
