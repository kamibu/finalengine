/*global jigLib:true, Matrix4:true*/

function NodeSkin( node ) {
    this.node = node;
    this.matrix = false;
}

NodeSkin.prototype = {
    constructor: NodeSkin,
    get_transform: function() {
        return new jigLib.Matrix3D( this.node.getAbsoluteMatrix() );
    },
    set_transform: function( m ) {
        m.transpose();
        this.node.setAbsoluteMatrix( new Matrix4().set( m.glmatrix ) );
    }
};
