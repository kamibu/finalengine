// extern
var assert, Buffer, UUID;

function VertexBuffer( semantic ) {
    this.uuid = UUID();
    this.name = this.uuid;

	this.semantic = semantic || '';
	this.stride = 0;
	this.size = 3;
	this.offset = 0;
    this.length = 0;
	this.buffer = null;
}

VertexBuffer.prototype = {
    constructor: VertexBuffer,
    getElement: function( n, dest ) {
        var s = this.size;
        if ( !dest ) {
            dest = new Float32Array( s );
        }
        var d = this.buffer.data;
        var stride = this.stride || this.size;
        for ( var i = 0; i < s; i++ ) {
            dest[ i ] = d[ this.offset + n * stride + i ];
        }
        return dest;
    },
    setSize: function( size ) {
        this.size = size | 0;
        return this.updateLength();
    },
    setOffset: function( offset ) {
        this.offset = offset | 0;
        return this.updateLength();
    },
    setStride: function( stride ) {
        this.stride = stride | 0;
        return this.updateLength();
    },
    setBuffer: function ( buffer ) {
		/*DEBUG*/
			assert( buffer instanceof Buffer, 'Invalid type. buffer must be an instance of Buffer' );
		/*DEBUG_END*/
		this.buffer = buffer;
        return this.updateLength();
	},
    updateLength: function() {
        if ( this.stride === 0 ) {
            this.length = ( this.buffer.length - this.offset ) / this.size;
        }
        else {
            this.length = ( this.buffer.length - this.offset ) / this.stride;
        }
        return this;
    },
    clone: function() {
        var ret = new VertexBuffer( this.semantic );
        ret.stride = this.stride;
        ret.size = this.size;
        ret.offset = this.offset;
        ret.buffer = this.buffer;
        return ret;
    },
    getExportData: function( exporter ) {
        var ret = {
            stride: this.stride,
            size: this.size,
            offset: this.offset,
            semantic: this.semantic,
            name: this.name,
            buffer: this.buffer.getExportData( exporter )
        };
        return ret;
    },
    setImportData: function( importer, data ) {
        this.name = data.name;
        this.semantic = data.semantic;
        this.stride = data.stride;
        this.size = data.size;
        this.offset = data.offset;
        this.setBuffer( new Buffer().setImportData( importer, data.buffer ) );
        return this;
    }
};
