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
            dest[ i ] = d[ offset + n * stride + i ];
        }
        return dest;
    },
    setBuffer: function ( buffer ) {
		/*DEBUG*/
			assert( buffer instanceof Buffer, 'Ivalid type. buffer must be an instance of Buffer' );
		/*DEBUG_END*/
		this.buffer = buffer;
        this.length = this.buffer.length / this.stride;
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
            buffer: this.buffer.name
        };
        exporter.alsoSave( this.buffer );
        return ret;
    },
    setImportData: function( importer, data ) {
        this.stride = data.stride;
        this.size = data.size;
        this.offset = data.offset;
        importer.alsoLoad( data.buffer, this.setBuffer.bind( this ) );
    }
};
