/*global assert:true, assertIn: true, Buffer: true, UUID: true, VertexAttribute: true, TempVars: true*/

/**
 * @class
 *
 * The 3D representation of a {@link Drawable}.
 *
 * <p>This is the representation object that the lower-level {@link Renderer} class can use to render 3D objects.</p>
 */
function Mesh() {
    /* @public */
    this.uuid = UUID.generate();

    /* @public */
    this.name = this.uuid;

    /* @public */
    this.mode = Mesh.TRIANGLES;

    /* @public */
    this.vertexAttributes = {};

	this.indexBuffer = null;
    this.isInterleaved = false;
}

Mesh.prototype = {
    constructor: Mesh,
    /**
     * @param {Buffer} vertexBuffer
     */
    setVertexAttribute: function( vertexBuffer ) {
        this.vertexAttributes[ vertexBuffer.semantic ] = vertexBuffer;
    },
    /**
     * @param {Buffer} buffer
     */
    setIndexBuffer: function( buffer ) {
        this.indexBuffer = buffer;
    },
    interleave: function() {
        /*DEBUG*/
            assert( !this.isInterleaved, 'Tried to interleave an already interleaved Mesh' );
        /*DEBUG_END*/
        var interleavedBuffer, data, stride, attribute, buffer, attr, i, j;

        interleavedBuffer = new Buffer( Buffer.DATA_BUFFER, Buffer.STATIC );

        stride = 0;
        for ( attribute in this.vertexAttributes ) {
            attr = this.vertexAttributes[ attribute ] = this.vertexAttributes[ attribute ].clone();
            attr.offset = stride;
            stride += 4 * attr.size;
        }

        data = [];
        for ( attribute in this.vertexAttributes ) {
            attr = this.vertexAttributes[ attribute ];
            attr.stride = stride;
            buffer = attr.buffer;

            i = buffer.length / attr.size;
            while ( i-- ) {
                for ( j = 0; j < attr.size; j++ ) {
                    data[ attr.offset / 4 + i * stride / 4 + j ] = buffer.data[ attr.size * i + j ];
                }
            }
        }

        interleavedBuffer.setData( data );
        for ( attribute in this.vertexAttributes ) {
            this.vertexAttributes[ attribute ].setBuffer( interleavedBuffer );
        }
        this.isInterleaved = true;
    },
    /**
     * @param mode
     */
    setMode: function( mode ) {
        /*DEBUG*/
            assertIn( mode, Mesh.POINTS, Mesh.LINES, Mesh.LINE_LOOP, Mesh.LINE_STRIP, Mesh.TRIANGLES, Mesh.TRIANGLE_STRIP, Mesh.TRIANGLE_FAN, 'Illegal value.' );
        /*DEBUG_END*/
        this.mode = mode;
    },
    /**
     * Calculates normals and sets the normal buffer vertex attribute.
     */
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

/**#@+
 * @const
 */
/** @public */
Mesh.POINTS = 1;
/** @public */
Mesh.LINES = 2;
/** @public */
Mesh.LINE_LOOP = 3;
/** @public */
Mesh.LINE_STRIP = 4;
/** @public */
Mesh.TRIANGLES = 5;
/** @public */
Mesh.TRIANGLE_STRIP = 6;
/** @public */
Mesh.TRIANGLE_FAN = 7;
