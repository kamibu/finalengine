function VertexBuffer( semantic ) {
	this.semantic = semantic || '';
	this.stride = 0;
	this.size = 3;
	this.offset = 0;
    this.length = 0;
	this.buffer = null;
};

VertexBuffer.prototype = {
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
    }
};
