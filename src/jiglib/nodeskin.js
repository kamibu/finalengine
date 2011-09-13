/*global jigLib:true, Matrix4:true*/

function NodeSkin( node, useMesh ) {
    this.node = node;
    this.matrix = false;

    if ( useMesh ) {
        this.createBuffers();
    }
}

NodeSkin.prototype = {
    constructor: NodeSkin,
    get_transform: function() {
        return new jigLib.Matrix3D( this.node.getAbsoluteMatrix() );
    },
    set_transform: function( m ) {
        m.transpose();
        this.node.setAbsoluteMatrix( new Matrix4().set( m.glmatrix ) );
    },
    createBuffers: function() {
        var vbuffer = this.node.mesh.vertexAttributes.Position.buffer.data,
            ibuffer = this.node.mesh.indexBuffer.data,
            i;

        this.vertices = [];
        this.indices = [];

        for ( i = 0; i < vbuffer.length; i += 3 ) {
            this.vertices.push( [ vbuffer[ i ], vbuffer[ i + 1 ], vbuffer[ i + 2 ] ] );
        }

        for ( i = 0; i < ibuffer.length; i += 3 ) {
            this.indices.push( [ ibuffer[ i ], ibuffer[ i + 1 ], ibuffer[ i + 2 ] ] );
        }
    }
};
