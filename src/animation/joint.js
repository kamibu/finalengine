/*global
    Transform : false,
    SceneNode     : false,
*/

/**
 * @constructor
 */
function Joint() {
    this.jointUid = 0;
    this.inverseBindTransform = new Transform();
    SceneNode.call( this );
}

Joint.prototype = {
    constructor: Joint
};

Joint.extend( SceneNode );
