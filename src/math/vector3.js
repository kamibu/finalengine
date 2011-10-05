/** @class
 *
 * A 3-element vector.
 *
 * It's elements are accessed via a .data property that is a Float32Array
 * or with .x .y .z getters (which are slow and not recommended).
 *
 * Most methods alter the object whose method was called for performance reasons.
 */
function Vector3( data ) {
    this.data = new Float32Array( 3 );
    if ( data ) {
        if ( data.data ) {
            this.data.set( data.data );
        }
        else {
            this.data.set( data );
        }
    }
}

Vector3.prototype = {
    constructor: Vector3,
    /**
     * Set the elements according to another vector.
     * @param {Vector3} src Vector to copy from.
     * @returns {Vector3} this
     */
    set: function( src ) {
        if ( src instanceof Array ) {
            throw 'error';
        }
        this.data.set( src.data );
        return this;
    },
    /**
     * Copies the values of this vector to another vector.
     * @param {Vector3} dest A Vector3 object to copy to.
     * @returns {Vector3} dest
     */
    copyTo: function( dest ) {
        if ( dest instanceof Array ) {
            throw 'error';
        }
        dest.data.set( this.data );
        return dest;
    },
    /**
     * Adds the values of a vector to this object.
     * @param {Array} vector Array-like object to add.
     * @returns {Vector3} this
     */
    add: function( vector ) {
        var a = this.data,
            b = vector.data;
        a[ 0 ] += b[ 0 ];
        a[ 1 ] += b[ 1 ];
        a[ 2 ] += b[ 2 ];
        return this;
    },
    /**
     * Subtracts the values of a vector from this object.
     * @param {Array} vector Array-like object to subtract.
     * @returns {Vector3} this
     */
    subtract: function( vector ) {
        var a = this.data,
            b = vector.data;
        a[ 0 ] -= b[ 0 ];
        a[ 1 ] -= b[ 1 ];
        a[ 2 ] -= b[ 2 ];
        return this;
    },
    /**
     * Negates every element of the vector.
     * @returns {Vector3} this
     */
    negate: function() {
        var a = this.data;
        a[ 0 ] = -a[ 0 ];
        a[ 1 ] = -a[ 1 ];
        a[ 2 ] = -a[ 2 ];
        return this;
    },
    /**
     * Scales this vector uniformly.
     * @param {Number} factor
     * @returns {Vector3} this
     */
    scale: function( factor ) {
        var a = this.data;
        a[ 0 ] *= factor;
        a[ 1 ] *= factor;
        a[ 2 ] *= factor;
        return this;
    },
    /**
     * @returns {Vector3} this
     */
    normalize: function() {
        var a = this.data;
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
    /**
     * Computes the cross product of this vector with another.
     * The value is stored in this object.
     *
     * @param {Array} vector
     * @returns {Vector3} this
     */
    cross: function( vector ) {
        var a = this.data,
            b = vector.data;
        var x = a[ 0 ], y = a[ 1 ], z = a[ 2 ];
        var x2 = b[ 0 ], y2 = b[ 1 ], z2 = b[ 2 ];

        a[ 0 ] = y * z2 - z * y2;
        a[ 1 ] = z * x2 - x * z2;
        a[ 2 ] = x * y2 - y * x2;
        return this;
    },
    /**
     * Returns the length (norm) of this vector.
     * @returns {Number}
     */
    length: function() {
        var a = this.data;
        var x = a[ 0 ], y = a[ 1 ], z = a[ 2 ];
        return Math.sqrt( x * x + y * y + z * z );
    },
    /**
     * Returns the length of this vector squared.
     */
    length2: function() {
        var a = this.data;
        var x = a[ 0 ], y = a[ 1 ], z = a[ 2 ];
        return x * x + y * y + z * z;
    },
    /**
     * Returns the dot product of this vector with another.
     * @returns {Number}
     */
    dot: function( vector ) {
        var a = this.data,
            b = vector.data;
        return a[ 0 ] * b[ 0 ] + a[ 1 ] * b[ 1 ] + a[ 2 ] * b[ 2 ];
    },
    /**
     * @returns {Vector3} this
     */
    absolute: function() {
        var a = this.data;
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
    },
    get x () {
        return this.data[ 0 ];
    },
    set x ( value ) {
        this.data[ 0 ] = value;
    },
    get y () {
        return this.data[ 1 ];
    },
    set y ( value ) {
        this.data[ 1 ] = value;
    },
    get z () {
        return this.data[ 2 ];
    },
    set z ( value ) {
        this.data[ 2 ] = value;
    },
    toString: function() {
        return '[' + [ this.data[ 0 ], this.data[ 1 ], this.data[ 2 ] ] + ']';
    }
};
