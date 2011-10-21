/*global
    assertIn : false,
    UUID     : false
*/

/**
 * @class
 *
 * A buffer class used for storing vertex attribute data.
 *
 * @constructor
 * @param {Number} type
 * @param {Number} usage
 */
function Buffer( type, usage ) {
    /**
     * @public
     * A UUID generated for this Buffer.
     * @type String
     */
    this.uuid = UUID.generateCanonicalForm();

    this.name = this.uuid;
    this.uid = Buffer.uid++;

    /**
     * The data array. Initially null.
     * @type Array
     */
    this.data = null;

    /**
     * The length of data.
     * @type Number
     */
    this.length = 0;

    /**
     * Buffer.STATIC, Buffer.DYNAMIC, or Buffer.STREAM
     * @type Number
     */
    this.usage = usage || Buffer.STATIC;

    /**
     * Buffer.DATA_BUFFER or Buffer.ELEMENT_BUFFER
     * @type Number
     */
    this.type = type || Buffer.DATA_BUFFER;
    this.needsUpdate = true;
}

Buffer.uid = 0;

/**
 * @const
 * @type Number
 * @static
 */
Buffer.STATIC = 1;
/**
 * @const
 * @type Number
 * @static
 */
Buffer.DYNAMIC = 2;
/**
 * @const
 * @type Number
 * @static
 */
Buffer.STREAM = 3;
/**
 * @const
 * @type Number
 * @static
 */
Buffer.DATA_BUFFER = 4;
/**
 * @const
 * @type Number
 * @static
 */
Buffer.ELEMENT_BUFFER = 5;


Buffer.prototype = {
    constructor: Buffer,

    /**
     * Sets the buffer data and returns the Buffer instance.
     *
     * This alters {@link data} and {@link length} properties.
     *
     * @param {Array} data
     * @returns Buffer
     */
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
        return this;
    },
    Uint16toUTF8: function( array ) {
        var l = array.length,
            s = '', i;
        for ( i = 0; i < l; ++i ) {
            //Shift all code points by 0x20 to avoid json escaping for small values
            var codePoint = ( array[ i ] + 0x20 ) % 0x10000;
            //0x20 is our escaping character to escape surrogate pairs. If we need to encode 0x20 we actually write 0x20, 0x20
            if ( codePoint == 0x20 ) {
                s += String.fromCharCode( 0x20, 0x20 );
            }
            //Handle surrogate pairs by escaping them with 0x20
            else if ( ( codePoint & 0xF800 ) == 0xD800 ) {
                s += String.fromCharCode( 0x20, codePoint - 0xD7D7 );
            }
            //Valid code point
            else {
                s += String.fromCharCode( codePoint );
            }
        }
        return s;
    },
    UTF8toUint16: function( string ) {
        var l = string.length, array = [], i, temp = new Uint16Array( [ 0 ] );
        for ( i = 0; i < l; ++i ) {
            var codePoint = string.charCodeAt( i );
            //Unescape if needed
            if ( codePoint == 0x20 ) {
                var codePoint2 = string.charCodeAt( ++i );
                if ( codePoint2 > 0x20 ) {
                    codePoint = codePoint2 + 0xD7D7;
                }
            }
            //Use the temporary Uint16 buffer to map values back to 65536 when result is negative
            temp[ 0 ] = codePoint - 0x20;
            array.push( temp[ 0 ] );
        }
        return new Uint16Array( array );
    },
    getExportData: function( exporter ) {
        var ret = {
            name: this.name,
            usage: this.usage,
            type: this.type,
            data: this.Uint16toUTF8( new Uint16Array( this.data.buffer ) )
        };
        return ret;
    },
    setImportData: function( importer, data ) {
        this.name = data.name;
        this.usage = data.usage;
        this.type = data.type;
        switch ( this.type ) {
            case Buffer.DATA_BUFFER:
                this.setData( new Float32Array( this.UTF8toUint16( data.data ).buffer ) );
                break;
            case Buffer.ELEMENT_BUFFER:
                this.setData( this.UTF8toUint16( data.data ) );
                break;
        }
        return this;
    }
};
