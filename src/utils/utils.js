define( function( require, exports, module ) {
    var	dian3 = require( 'libs/math' ).dian3;
    return  {
        makeSphere : function( R ) {
            var p, m;
            if ( arguments.length === 2 ) {
                p = m = 1 / arguments[ 1 ];
            }
            else if ( arguments.length == 3 ) {
                p = arguments[ 1 ];
                m = arguments[ 2 ];
            }

            //p parallhloi, p > 1
            //m meshmbrinoi

            if ( p < 2 ) {
                return false;
            }

            var model = {
                vertices: [],
                //normals: [],
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
                cnt2 += 3;
            }
            return model;
        },
        makeParallelepiped: function ( x1, y1, z1, x2, y2, z2 ) {
            var vertices = [
                x1, y1, z1,
                x1, y1, z2,
                x1, y2, z1,

                x1, y1, z2,
                x1, y2, z2,
                x1, y2, z1,

                x2, y2, z1,
                x2, y1, z2,
                x2, y1, z1,

                x2, y2, z1,
                x2, y2, z2,
                x2, y1, z2,

                x1, y1, z1,
                x2, y1, z2,
                x1, y1, z2,

                x1, y1, z1,
                x2, y1, z1,
                x2, y1, z2,

                x1, y2, z1,
                x1, y2, z2,
                x2, y2, z2,

                x1, y2, z1,
                x2, y2, z2,
                x2, y2, z1,

                x1, y2, z1,
                x2, y1, z1,
                x1, y1, z1,

                x1, y2, z1,
                x2, y2, z1,
                x2, y1, z1,

                x1, y1, z2,
                x2, y1, z2,
                x2, y2, z2,

                x1, y2, z2,
                x1, y1, z2,
                x2, y2, z2
            ];
            var indices = [];

            for ( var i = 0; i < vertices.length / 3; ++i ) {
                indices.push( i );
            }
            return {
                vertices: vertices,
                indices:  indices
            };
        },
        genNormals: function( points, indices ) {
            var a, b, c,
                ax, ay, az,
                bx, by, bz,
                cx, cy, cz,
                AB, BC, N,
                i, j,
                normals = [];

            // default normal
            for ( i = 0; i < points.length / 3; ++i ) {
                normals[ i ] = [];
            }

            for ( var triangle = 0; triangle < indices.length / 3; ++triangle ) {
                a = indices[ triangle * 3 + 0 ];
                b = indices[ triangle * 3 + 1 ];
                c = indices[ triangle * 3 + 2 ];
                ax = points[ a * 3 + 0 ];
                ay = points[ a * 3 + 1 ];
                az = points[ a * 3 + 2 ];
                bx = points[ b * 3 + 0 ];
                by = points[ b * 3 + 1 ];
                bz = points[ b * 3 + 2 ];
                cx = points[ c * 3 + 0 ];
                cy = points[ c * 3 + 1 ];
                cz = points[ c * 3 + 2 ];

                AB = vec3.create( [ bx - ax, by - ay, bz - az ] );
                BC = vec3.create( [ cx - bx, cy - by, cz - bz ] );
                N = vec3.normalize( vec3.cross( AB, BC ) );

                normals[ a ].push( N );
                normals[ b ].push( N );
                normals[ c ].push( N );
            }

            var fNormals = [];
            for ( j, i = 0; i < normals.length; ++i ) {
                if ( normals[ i ].length === 0 ) {
                    fNormals.push( 0, 0, 1 );
                    continue;
                }
                if ( normals[ i ].length == 1 ) {
                    fNormals.push( normals[ i ][ 0 ][ 0 ], normals[ i ][ 0 ][ 1 ], normals[ i ][ 0 ][ 2 ] );
                    continue;
                }
                for ( j = 1; j < normals[ i ].length; ++j ) {
                    vec3.add( normals[ i ][ 0 ], normals[ i ][ j ] );
                }
                vec3.normalize( normals[ i ][ 0 ] );
                fNormals.push( normals[ i ][ 0 ][ 0 ], normals[ i ][ 0 ][ 1 ], normals[ i ][ 0 ][ 2 ] );
            }

            return fNormals;
        },
        makeSquare: function ( x1, y1, x2, y2 ) {
            /*   ____________B (x2, y2)
                | \          |
                |   \        |
                |      \     |
                |         \  |
                |___________\|
               A (x1, y1)
            */
            return {
                vertices: [
                    x1, y1, 0,
                    x2, y1, 0,
                    x1, y2, 0,
                    x2, y2, 0
                ],
                indices: [
                    0, 1, 2,
                    3, 2, 1
                ],
                normals: [
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1
                ],
                uvcoords: [
                    0, 0,
                    1, 0,
                    0, 1,
                    1, 1
                ]
            };
        },
        makeUnitCube: function () {
            var vertices = [
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
            ];
            var uvcoords = [
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
            ];
            var indices = [];

            for ( var i = 0; i < vertices.length / 3; ++i ) {
                indices.push( i );
            }

            return {
                vertices: vertices,
                indices:  indices,
                uvcoords: uvcoords
            };
        },
        makeTextTexture: function ( text ) {
            var c = document.createElement( 'canvas' );
            c.width = 100;
            c.height = 100;

            var s = c.getContext( '2d' );

            s.fillStyle = 'white';
            s.fillRect( 0, 0, 100, 100 );
            s.strokeStyle = "black";
            s.strokeText( text, 0, 0 );

            return c;
        },
        genSphericalUVCoords: function( vertices ) {
            var center = [ 0, 0, 0 ];
            var vertexCount = vertices.length / 3;
            for( var i = 0; i < vertexCount; ++i ) {
                center[ 0 ] += vertices[ i * 3 ];
                center[ 1 ] += vertices[ i * 3 + 1 ];
                center[ 2 ] += vertices[ i * 3 + 2 ];
            }
            center[ 0 ] /= vertexCount;
            center[ 1 ] /= vertexCount;
            center[ 2 ] /= vertexCount;

            var temp = [ 0, 0, 0 ];
            var uvcoords = [];
            for( i = 0; i < vertexCount; ++i ) {
                temp[ 0 ] = vertices[ i * 3 ] - center[ 0 ];
                temp[ 1 ] = vertices[ i * 3 + 1 ] - center[ 1 ];
                temp[ 2 ] = vertices[ i * 3 + 2 ] - center[ 2 ];
                vec3.normalize( temp );
                uvcoords.push( 0.5 + 0.5 * Math.atan( temp[ 0 ], temp[ 2 ] ) / Math.PI );
                uvcoords.push( 0.5 - 0.5 * temp[ 1 ] );
            }
            return uvcoords;
        }
    };
} );
