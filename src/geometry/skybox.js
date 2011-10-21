/*global CubemapMaterial: false */

// extern
var Buffer, Drawable, Mesh, VertexAttribute;

function Skybox( sources ) {
    Drawable.call( this );

    console.log( sources );
    this.material = new CubemapMaterial( sources );

    var ret = {
        vertices: [
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,

            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0
        ],
        indices: [
            1, 5, 7, 7, 3, 1,
            2, 6, 4, 4, 0, 2,
            0, 4, 5, 5, 1, 0,
            3, 7, 6, 6, 2, 3,
            4, 6, 7, 7, 5, 4,
            0, 1, 3, 3, 2, 0
        ],
        normals: [
            1.0,  1.0,  -1.0,
            -1.0,  1.0,  -1.0,
            -1.0,  -1.0,  -1.0,
            1.0,  -1.0,  -1.0,
            1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  -1.0,  1.0,
            1.0,  -1.0,  1.0,
        ],
        uvcoords: [
            /*
            1.0, 1.0,  -1.0,
            -1.0, 1.0,  -1.0,
            1.0,  -1.0,  -1.0,
            -1.0,  -1.0,  -1.0,
            1.0, 1.0,  1.0,
            -1.0, 1.0,  1.0,
            1.0,  -1.0,  1.0,
            -1.0,  -1.0,  1.0,
            */
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,

            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0
        ]
    };

    var vertices = new Buffer().setData( ret.vertices );
    var uvcoords = new Buffer().setData( ret.uvcoords );
    // var normals = new Buffer().setData( ret.normals );

    vertices = new VertexAttribute( 'Position' ).setBuffer( vertices );
    uvcoords = new VertexAttribute( 'UVCoord' ).setBuffer( uvcoords );
    // normals = new VertexAttribute( 'Normal' ).setBuffer( normals );

    var indices = new Buffer( Buffer.ELEMENT_BUFFER ).setData( ret.indices );

    var m = new Mesh();
    m.setVertexAttribute( vertices );
    // m.setVertexAttribute( normals );
    m.setVertexAttribute( uvcoords );
    m.setIndexBuffer( indices );

    this.mesh = m;
}

Skybox.extend( Drawable );
