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
        return this;
    },
    FloatToUtf8: function( a ) {
        var u = new Uint16Array( a.buffer ),
            s = "",
            l = u.length;
        for ( var i = 0; i < l; ++i ) {
            s += String.fromCharCode( u[ i ] );
        }
        return s;
    },
    Uint16ToUtf8: function( u ) {
        var s = "",
            l = u.length;
        for ( var i = 0; i < l; ++i ) {
            var a = u[ i ];
            if ( a < 32 ) {
                s += String.fromCharCode( 65535 - a );
            }
            else if ( a == 34 ) {
                // 65535 - 32
                s += String.fromCharCode( 65503 );
            }
            else if ( a == 92 ) {
                // 65535 - 33
                s += String.fromCharCode( 65502 );
            }
            else if ( a < 65502 ) {
                s += String.fromCharCode( a );
            }
            else if ( a == 65502 ) {
                s += String.fromCharCode( 92 );
            }
            else if ( a == 65503 ) {
                s += String.fromCharCode( 34 );
            }
            else {
                s += String.fromCharCode( 65535 - a );
            }
        }
        return s;
    },
    Utf8ToFloat: function( s ) {
        var u = new Uint16Array( s.length ),
            l = s.length;
        for ( var i = 0; i < l; ++i ) {
            u[ i ] = s.charCodeAt( i );
        }
        return new Float32Array( u.buffer );
    },
    Utf8ToUint16: function( s ) {
        var u = new Uint16Array( s.length ),
            l = s.length;
        for ( var i = 0; i < l; ++i ) {
            var a = s.charCodeAt( i );
            if ( a > 65503 ) {
                u[ i ] = 65535 - a;
            }
            else if ( a == 65503 ) {
                u[ i ] = 34;
            }
            else if ( a == 65502 ) {
                u[ i ] = 92;
            }
            else if ( a == 92 ) {
                u[ i ] = 65502;
            }
            else if ( a == 34 ) {
                u[ i ] = 65503;
            }
            else if ( a < 32 ) {
                u[ i ] = 65535 - a;
            }
            else {
                u[ i ] = a;
            }
        }
        return u;
    },
    getExportData: function( exporter ) {
        var ret = {
            name: this.name,
            usage: this.usage,
            type: this.type
        };
        ret.data = ( this.type == Buffer.DATA_BUFFER ? this.FloatToUtf8( this.data ) : this.Uint16ToUtf8( this.data ) );
        return ret;
    },
    setImportData: function( importer, data ) {
        this.name = data.name;
        this.usage = data.usage;
        this.type = data.type;
        this.setData( this.type == Buffer.DATA_BUFFER ? this.Utf8ToFloat( data.data ) : this.Utf8ToUint16( data.data ) );
        return this;
    }
};
