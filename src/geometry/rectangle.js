/*global
    Buffer           :  false,
    Drawable         :  false,
    Mesh             :  false,
    VertexAttribute  :  false
*/

/**
 * @constructor
 * @extends Drawable
 */
function Rectangle( x0, z0, x1, z1 ) {
    Drawable.call( this );
    var vertices = [
        x0, 0, z0,
        x1, 0, z0,
        x0, 0, z1,
        x1, 0, z1
    ];

    var uvcoords = [
        0, 0,
        0, 1,
        1, 0,
        1, 1
    ];
    var normals = [
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0
    ];

    var indices = [ 0, 1, 2, 2, 1, 3 ];

    vertices = new Buffer().setData( vertices );
    uvcoords = new Buffer().setData( uvcoords );
    normals = new Buffer().setData( normals );

    vertices = new VertexAttribute( 'Position' ).setBuffer( vertices );
    uvcoords = new VertexAttribute( 'UVCoord' ).setBuffer( uvcoords ).setSize( 2 );
    normals = new VertexAttribute( 'Normal' ).setBuffer( normals );

    indices = new Buffer( Buffer.ELEMENT_BUFFER ).setData( indices );

    var m = new Mesh();
    m.setVertexAttribute( vertices );
    m.setVertexAttribute( normals );
    m.setVertexAttribute( uvcoords );
    m.setIndexBuffer( indices );

    this.mesh = m;
}

Rectangle.extend( Drawable );

