/*global
    Buffer           :  false,
    Drawable         :  false,
    Mesh             :  false,
    VertexAttribute  :  false
*/

/**
 * @class
 * A sphere.
 * @extends Drawable
 * @constructor
 * @param {Number} radius
 * @param {Number} segmentsY
 * @param {Number} segmentsX
 */
function Sphere( radius, segmentsY, segmentsX ) {
    Drawable.call( this );
    radius = radius || 1;

    segmentsY = segmentsY || 10;
    segmentsX = segmentsX || segmentsY;

    var R = radius;
    var p = segmentsY;
    var m = segmentsX;

    var model = {
        vertices: [],
        indices: []
    };

    var prev = function( x, m ) {
        if ( x === 0 ) {
            return ( m - 1 );
        }
        else {
            return ( x -1 );
        }
    };

    var y, x, z, r,cnt = 0, cnt2 = 0;
    for ( var i = 1; i < p-1; i++ ) { // end points are missing
        y = R*Math.sin( -Math.PI/2 + i*Math.PI/( p - 1 ) );
        r = R*Math.cos( -Math.PI/2 + i*Math.PI/( p - 1 ) );
        //console.log( "y , r " ,y, r );
        for ( var k = 0; k < m; k++ ) {
            x = r*Math.cos( 2*Math.PI*k/ m );
            z = r*Math.sin( 2*Math.PI*k/ m );
            //console.log( x, z );
            model.vertices[ cnt ] = x;
            model.vertices[ cnt+1 ] = y;
            model.vertices[ cnt+2 ] = z;
            cnt = cnt+3;
        }
        //make the triangle


        if ( i > 1 ) {
            var st = ( i - 2 )*m;
            for ( x = 0; x < m; x++ ) {
                model.indices[ cnt2 ] = st + x;
                model.indices[ cnt2+1 ] = st + prev( x, m ) + m;
                model.indices[ cnt2+2 ] = st + x + m;
                cnt2  += 3;

                model.indices[ cnt2 ] = st + x;
                model.indices[ cnt2+1 ] = st + prev( x, m );
                model.indices[ cnt2+2 ] = st + prev( x, m ) + m;
                cnt2 += 3;
            }
        }
    }

    model.vertices[ cnt ] = 0;
    model.vertices[ cnt+1 ] = -R;
    model.vertices[ cnt+2 ] = 0;
    var down = cnt/3;
    cnt += 3;
    model.vertices[ cnt ] = 0;
    model.vertices[ cnt+1 ] = R;
    model.vertices[ cnt+2 ] = 0;
    cnt += 3;

    var top = down + 1;
    for ( x = 0; x < m; x++ ) {
        model.indices[ cnt2 ] = down;
        model.indices[ cnt2+1 ] = prev( x, m );
        model.indices[ cnt2+2 ] = x;
        cnt2 += 3;

        model.indices[ cnt2 ] = down - m + x;
        model.indices[ cnt2+1 ] = down - m + prev( x, m );
        model.indices[ cnt2+2 ] = top;
        cnt2 +=3;
    }



    var vertices = new Buffer().setData( model.vertices );
//    uvcoords = new Buffer().setData( ret.uvcoords );
//    normals = new Buffer().setData( ret.normals );

    vertices = new VertexAttribute( 'Position' ).setBuffer( vertices );
//    uvcoords = new VertexAttribute( 'UVCoord' ).setBuffer( uvcoords ).setSize( 2 );
//    normals = new VertexAttribute( 'Normal' ).setBuffer( normals );

    var indices = new Buffer( Buffer.ELEMENT_BUFFER ).setData( model.indices );

    m = new Mesh();
    m.setVertexAttribute( vertices );
//    m.setVertexAttribute( normals );
//    m.setVertexAttribute( uvcoords );
    m.setIndexBuffer( indices );

    this.mesh = m;
}

Sphere.extend( Drawable );
