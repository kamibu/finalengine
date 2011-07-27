var Mesh = function() {
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
    setVertexAttribute: function( vertexBuffer ) {
        this.vertexAttributes[ vertexBuffer.semantic ] = vertexBuffer;
    },
    setIndexBuffer: function( buffer ) {
        this.indexBuffer = buffer;
    },
    interleave: function() {
        /*DEBUG*/
            assert( !this.isInterleaved, 'Tried to interleave an already interleaved Mesh' );
        /*DEBUG*/
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
    },
    setMode: function( mode ) {
        /*DEBUG*/
            assertIn( mode, Mesh.POINTS, Mesh.LINES, Mesh.LINE_LOOP, Mesh.LINE_STRIP, Mesh.TRIANGLES, Mesh.TRIANGLE_STRIP, Mesh.TRIANGLE_FAN, 'Illegal value.' );
        /*DEBUG_END*/
        this.mode = mode;
    }
}
