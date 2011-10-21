/*global
    Drawable  :  false,
    SceneNode      :  false
*/

/**
 * @class
 *
 * The tree of nodes to be rendered.
 *
 * @constructor
 */
function Scene() {
    SceneNode.call( this );
    this.drawableList = [];
}

Scene.prototype = {
    constructor: Scene,
    /**
     * Returns the nodes in the tree below a given node that are instances of theClass.
     * @param {SceneNode} node
     * @param {Function} theClass
     * @returns Array An array of nodes.
     */
    findClass: function( node, theClass ) {
        var bucket = [], bucketIndex = 0,
            stack = [ node ], stackIndex = 1,
            children, l;
        while ( stackIndex ) {
            node = stack[ --stackIndex ];
            if ( node instanceof theClass ) {
                bucket[ bucketIndex++ ] = node;
            }
            children = node.children;
            l = children.length;
            while ( l-- ) {
                stack[ stackIndex++ ] = children[ l ];
            }
        }
        return bucket;
    },
    /**
     * @override
     */
    onChildAdded: function( nodeAdded ) {
        this.SceneNode_onChildAdded( nodeAdded );
        var drawables = this.findClass( nodeAdded, Drawable );
        this.drawableList.push.apply( this.drawableList, drawables );
    },
    /**
     * @override
     */
    onChildRemoved: function( nodeRemoved ) {
        this.SceneNode_onChildRemoved( nodeRemoved );
        var drawables = this.findClass( nodeRemoved, Drawable );
        var l = drawables.length;
        while ( l-- ) {
            this.drawableList.splice( this.drawableList.indexOf( drawables[ l ] ), 1 );
        }
    }
};

Scene.extend( SceneNode );
