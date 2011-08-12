function Cube() {
    Drawable.call( this );
    var vertices = new Buffer( Buffer.DATA_BUFFER, Buffer.STATIC );
    vertices.setData( [
        // front
        0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5,
        -0.5, -0.5, 0.5,

        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,

        // back
        -0.5, -0.5, -0.5,
        -0.5, 0.5, -0.5,
        0.5, 0.5, -0.5,

        0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,
        -0.5, -0.5, -0.5,

        // left
        -0.5, 0.5, 0.5,
        -0.5, 0.5, -0.5,
        -0.5, -0.5, -0.5,

        -0.5, -0.5, -0.5,
        -0.5, -0.5, 0.5,
        -0.5, 0.5, 0.5,

        // right
        0.5, -0.5, -0.5,
        0.5, 0.5, -0.5,
        0.5, 0.5, 0.5,

        0.5, 0.5, 0.5,
        0.5, -0.5, 0.5,
        0.5, -0.5, -0.5,

        // top
        0.5, 0.5, -0.5,
        -0.5, 0.5, -0.5,
        -0.5, 0.5, 0.5,

        -0.5, 0.5, 0.5,
        0.5, 0.5, 0.5,
        0.5, 0.5, -0.5,

        // bottom
        -0.5, -0.5, 0.5,
        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,

        0.5, -0.5, -0.5,
        0.5, -0.5, 0.5,
        -0.5, -0.5, 0.5
    ] );

    var uvcoords = new Buffer( Buffer.DATA_BUFFER, Buffer.STATIC );
    uvcoords.setData( [
        // front
        1, 1,
        0, 1,
        0, 0,

        0, 0,
        1, 0,
        1, 1,

        // back
        0, 0,
        0, 1,
        1, 1,

        1, 1,
        1, 0,
        0, 0,

        // left
        1, 1,
        0, 1,
        0, 0,

        0, 0,
        1, 0,
        1, 1,

        // right
        1, 0,
        1, 1,
        0, 1,

        0, 1,
        0, 0,
        1, 0,

        // top
        1, 1,
        0, 1,
        0, 0,

        0, 0,
        1, 0,
        1, 1,

        // bottom
        0, 0,
        0, 1,
        1, 1,

        1, 1,
        1, 0,
        0, 0
    ] );


    var verticesVB = new VertexBuffer( 'Position' );
    verticesVB.setBuffer( vertices );

    var uvcoordsVB = new VertexBuffer( 'UVCoord' );
    uvcoordsVB.setBuffer( uvcoords );

    var indices = new Buffer( Buffer.ELEMENT_BUFFER, Buffer.STATIC );
    var indicesArray = [];
    for ( var i = 0; i < vertices.length / 3; ++i ) {
        indicesArray.push( i );
    }
    indices.setData( indicesArray );

    var m = new Mesh();
    m.setVertexAttribute( verticesVB );
    m.setVertexAttribute( uvcoordsVB );
    m.setIndexBuffer( indices );

    this.mesh = m;
}

Cube.extend( Drawable );
