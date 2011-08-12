// extern
var assertIn, UUID;

function Buffer( type, usage ) {
    this.uuid = UUID();
    this.name = this.uuid;

    this.uid = Buffer.uid++;
    this.data = null;
    this.length = 0;
    this.usage = usage || Buffer.STATIC;
    this.type = type || Buffer.DATA_BUFFER;
    this.needsUpdate = true;
}

Buffer.uid = 0;

Buffer.STATIC = 1;
Buffer.DYNAMIC = 2;
Buffer.STREAM = 3;
Buffer.DATA_BUFFER = 4;
Buffer.ELEMENT_BUFFER = 5;


Buffer.prototype = {
    constructor: Buffer,
    setData: function( data ) {
        /*DEBUG*/
            assertIn( data.constructor, Array, Float32Array, Uint16Array, 'Invalid type. data must be an Array, Float32Array or Uint16Array' );
            switch ( this.type ) {
                case Buffer.ELEMENT_BUFFER:
                    assertIn( data.constructor, Array, Uint16Array, 'Invalid type. data must be an Array, Float32Array or Uint16Array' );
                    break;
                case Buffer.DATA_BUFFER:
                    assertIn( data.constructor, Array, Float32Array, 'Invalid type. data must be an Array, Float32Array or Uint16Array' );
                    break;
            }
        /*DEBUG_END*/
        if ( data.constructor == Array ) {
            switch ( this.type ) {
                case Buffer.ELEMENT_BUFFER:
                    if ( this.data && this.data.length == data.length ) {
                        this.data.set( data );
                    }
                    else {
                        data = new Uint16Array( data );

                    }
                    break;
                case Buffer.DATA_BUFFER:
                    if ( this.data && this.data.length == data.length ) {
                        this.data.set( data );
                    }
                    else {
                        data = new Float32Array( data );
                    }
                    break;
            }
        }
        this.needsUpdate = true;
        this.data = data;
        this.length = data.length;
    },
    getExportData: function( exporter ) {
        var ret = {
            name: this.name,
            usage: this.usage,
            type: this.type,
            data: this.data.toArray()
        };
        return ret;
    },
    setImportData: function( importer, data ) {
        this.name = data.name;
        this.usage = data.usage;
        this.type = data.type;
        this.setData( data.data );
    }
};
