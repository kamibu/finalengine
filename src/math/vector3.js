function Vector3( data ) {
    /* Float32Array does not implement call method in chrome.
     * prototype hacking to the resque
     */
    if ( Float32Array.call ) {
        Float32Array.call( this, 3 );
        if ( data ) {
            this.set( data );
        }
    }
    else {
        var old = Float32Array.prototype;
        Float32Array.prototype = Vector3.prototype;
        var ret = new Float32Array( 3 );
        Float32Array.prototype = old;

        if ( data ) {
            ret.set( data );
        }
        return ret;
    }
}

Vector3.prototype = {
    constructor: Vector3,
    set: function( data ) {
        this[ 0 ] = data[ 0 ];
        this[ 1 ] = data[ 1 ];
        this[ 2 ] = data[ 2 ];
        return this;
    },
    setTo: function( dest ) {
        dest[ 0 ] = this[ 0 ];
        dest[ 1 ] = this[ 1 ];
        dest[ 2 ] = this[ 2 ];
        return dest;
    },
    add: function( vector ) {
        this[ 0 ] += vector[ 0 ];
        this[ 1 ] += vector[ 1 ];
        this[ 2 ] += vector[ 2 ];
        return this;
    },
    subtract: function( vector ) {
        this[ 0 ] -= vector[ 0 ];
        this[ 1 ] -= vector[ 1 ];
        this[ 2 ] -= vector[ 2 ];
        return this;
    },
    negate: function() {
        this[ 0 ] = -this[ 0 ];
        this[ 1 ] = -this[ 1 ];
        this[ 2 ] = -this[ 2 ];
        return this;
    },
    scale: function( factor ) {
        this[ 0 ] *= factor;
        this[ 1 ] *= factor;
        this[ 2 ] *= factor;
        return this;
    },
    normalize: function() {
        var x = this[ 0 ], y = this[ 1 ], z = this[ 2 ];
        var len = Math.sqrt( x * x + y * y + z * z);

        if ( !len ) {
            this[ 0 ] = 0;
            this[ 1 ] = 0;
            this[ 2 ] = 0;
            return this;
        }

        len = 1 / len;
        this[ 0 ] = x * len;
        this[ 1 ] = y * len;
        this[ 2 ] = z * len;
        return this;
    },
    cross: function( vector ) {
        var x = this[ 0 ], y = this[ 1 ], z = this[ 2 ];
        var x2 = vector[ 0 ], y2 = vector[ 1 ], z2 = vector[ 2 ];

        this[ 0 ] = y * z2 - z * y2;
        this[ 1 ] = z * x2 - x * z2;
        this[ 2 ] = x * y2 - y * x2;
        return this;
    },
    length: function() {
        var x = this[ 0 ], y = this[ 1 ], z = this[ 2 ];
        return Math.sqrt( x * x + y * y + z * z);
    },
    length2: function() {
        var x = this[ 0 ], y = this[ 1 ], z = this[ 2 ];
        return x * x + y * y + z * z;
    },
    dot: function( vector ) {
        return this[ 0 ] * vector[ 0 ] + this[ 1 ] * vector[ 1 ] + this[ 2 ] * vector[ 2 ];
    },
    clone: function() {
        return new this.constructor( this );
    }
};

Vector3.extend( Float32Array );
