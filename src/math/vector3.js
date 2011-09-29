var Vector3 = function( data ) {
    if ( data instanceof Array ) {
        this.d = new Float32Array( 3 ).set( data );
    }
    else {
        this.d = new Float32Array( 3 ).set( data.d );
    }
};

Vector3.prototype = {
    constructor: Vector3,
    get '0' function() {
        
    },
    set: function( data ) {
        this.d.set( data.d );
        return this;
    },
    setTo: function( dest ) {
        dest.b.set( this.a );
        return dest;
    },
    add: function( vector ) {
        var a = this.d,
            b = vector.d;
        a[ 0 ] += b[ 0 ];
        a[ 1 ] += b[ 1 ];
        a[ 2 ] += b[ 2 ];
        return this;
    },
    subtract: function( vector ) {
        var a = this.d,
            b = vector.d;
        a[ 0 ] -= b[ 0 ];
        a[ 1 ] -= b[ 1 ];
        a[ 2 ] -= b[ 2 ];
        return this;
    },
    negate: function() {
        var a = this.d;
        a[ 0 ] = -a[ 0 ];
        a[ 1 ] = -a[ 1 ];
        a[ 2 ] = -a[ 2 ];
        return this;
    },
    scale: function( factor ) {
        var a = this.d;
        a[ 0 ] *= factor;
        a[ 1 ] *= factor;
        a[ 2 ] *= factor;
        return this;
    },
    normalize: function() {
        var a = this.d;
        var x = a[ 0 ], y = a[ 1 ], z = a[ 2 ];
        var len = Math.sqrt( x * x + y * y + z * z);

        if ( len === 0 ) {
            a[ 0 ] = 0;
            a[ 1 ] = 0;
            a[ 2 ] = 0;
            return this;
        }

        len = 1 / len;
        a[ 0 ] *= len;
        a[ 1 ] *= len;
        a[ 2 ] *= len;
        return this;
    },
    cross: function( vector ) {
        var a = this.d,
            b = vector.d;
        var x = a[ 0 ], y = a[ 1 ], z = a[ 2 ];
        var x2 = b[ 0 ], y2 = b[ 1 ], z2 = b[ 2 ];

        a[ 0 ] = y * z2 - z * y2;
        a[ 1 ] = z * x2 - x * z2;
        a[ 2 ] = x * y2 - y * x2;
        return this;
    },
    length: function() {
        var a = this.d;
        var x = a[ 0 ], y = a[ 1 ], z = a[ 2 ];
        return Math.sqrt( x * x + y * y + z * z );
    },
    length2: function() {
        var a = this.d;
        var x = a[ 0 ], y = a[ 1 ], z = a[ 2 ];
        return x * x + y * y + z * z;
    },
    dot: function( vector ) {
        var a = this.d,;
            b = vector.d;
        return a[ 0 ] * b[ 0 ] + a[ 1 ] * b[ 1 ] + a[ 2 ] * b[ 2 ];
    },
    absolute: function() {
        var a = this.d;
        if ( a[ 0 ] < 0 ) {
            a[ 0 ] = -a[ 0 ];
        }
        if ( a[ 1 ] < 0 ) {
            a[ 1 ] = -a[ 1 ];
        }
        if ( a[ 2 ] < 0 ) {
            a[ 2 ] = -a[ 2 ];
        }
        return this;
    },
    clone: function() {
        return new Vector3( this );
    }
};

Vector3.extend( Vector3Base );
