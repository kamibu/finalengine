// extern
var assert, assertIn, Buffer, UUID, VertexAttribute, Buffer, TempVars;

function Mesh() {
    this.uuid = UUID();
    this.name = this.uuid;

    this.mode = Mesh.TRIANGLES;
    this.vertexAttributes = {};
	this.indexBuffer = null;
}


Mesh.POINTS = 1;
Mesh.LINES = 2;
Mesh.LINE_LOOP = 3;
Mesh.LINE_STRIP = 4;
Mesh.TRIANGLES = 5;
Mesh.TRIANGLE_STRIP = 6;
Mesh.TRIANGLE_FAN = 7;

Mesh.prototype = {
    constructor: Mesh,
    setVertexAttribute: function( attribute ) {
        this.vertexAttributes[ attribute.semantic ] = attribute;
        return this;
    },
    setIndexBuffer: function( buffer ) {
        this.indexBuffer = buffer;
        return this;
    },
    interleave: function() {
        var interleavedBuffer, data, stride, attribute, attr, i, length, start;
        /*DEBUG*/
            var l = 0;
            for ( attribute in this.vertexAttributes ) {
                attr = this.vertexAttributes[ attribute ];
                if ( !l ) {
                    l = attr.length;
                }
                assert( attr.length == l, 'The vertex attributes in this mesh are of unequal lengths' );
            }
        /*DEBUG_END*/

        interleavedBuffer = new Buffer();

        stride = 0;
        for ( attribute in this.vertexAttributes ) {
            stride += attr.size;
            length = attr.length;
        }

        data = new Float32Array( length * stride );

        var offset = 0;
        for ( attribute in this.vertexAttributes ) {
            attr = this.vertexAttributes[ attribute ];

            i = length;
            while ( i-- ) {
                start = stride * i + offset;
                attr.getElement( i, data.subarray( start, start + attr.size ) );
            }

            attr.stride = stride;
            attr.offset = offset;
            offset += attr.size;
            attr.setBuffer( interleavedBuffer );
        }

        interleavedBuffer.setData( data );

        return this;
    },
    setMode: function( mode ) {
        /*DEBUG*/
            assertIn( mode, Mesh.POINTS, Mesh.LINES, Mesh.LINE_LOOP, Mesh.LINE_STRIP, Mesh.TRIANGLES, Mesh.TRIANGLE_STRIP, Mesh.TRIANGLE_FAN, 'Illegal value.' );
        /*DEBUG_END*/
        this.mode = mode;
        return this;
    },
    calculateNormals: function() {
        var points = this.vertexAttributes.Position;
        var indices = this.indexBuffer.data;

        var a, b, c,
            ax, ay, az,
            bx, by, bz,
            cx, cy, cz,
            AB, BC, N,
            i, j,
            normals = [];

        // default normal
        for ( i = 0; i < points.length; ++i ) {
            normals[ i ] = [];
        }
        TempVars.lock();
        var ta = TempVars.getVector3();
        var tb = TempVars.getVector3();
        var tc = TempVars.getVector3();
        for ( var triangle = 0; triangle < indices.length / 3; ++triangle ) {
            a = indices[ triangle * 3 + 0 ];
            b = indices[ triangle * 3 + 1 ];
            c = indices[ triangle * 3 + 2 ];


            points.getElement( a, ta );
            points.getElement( b, tb );
            points.getElement( c, tc );

            tb.subtract( ta );

            N = tc.subtract( ta ).cross( tb ).normalize().clone();

            normals[ a ].push( N );
            normals[ b ].push( N );
            normals[ c ].push( N );
        }
        TempVars.release();
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
                normals[ i ][ 0 ].add( normals[ i ][ j ] );
            }
            normals[ i ][ 0 ].normalize();
            fNormals.push( normals[ i ][ 0 ][ 0 ], normals[ i ][ 0 ][ 1 ], normals[ i ][ 0 ][ 2 ] );
        }

        normals = new Buffer().setData( fNormals );
        normals = new VertexAttribute( 'Normal' ).setBuffer( normals );
        this.setVertexAttribute( normals );
        return this;
    },
    getExportData: function( exporter ) {
        var ret = {
            mode: this.mode,
            indexBuffer: this.indexBuffer.getExportData( exporter ),
            vertexAttributes: {}
        };
        for ( var vertexAttributeName in this.vertexAttributes ) {
            ret.vertexAttributes[ vertexAttributeName ] = this.vertexAttributes[ vertexAttributeName ].getExportData( exporter );
        }
        return ret;
    },
    setImportData: function( importer, data ) {
        this.mode = data.mode;
        this.indexBuffer = new Buffer().setImportData( importer, data.indexBuffer );
        for ( var name in data.vertexAttributes ) {
            this.vertexAttributes[ name ] = new VertexAttribute().setImportData( importer, data.vertexAttributes[ name ] );
        }
        return this;
    }
};
