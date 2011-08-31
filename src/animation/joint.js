// extern
var Node, Transform;

function Joint() {
    this.jointUid = 0;
    this.inverseBindTransform = new Transform();
    Node.call( this );
}

Joint.prototype = {
    constructor: Joint
};

Joint.extend( Node );
