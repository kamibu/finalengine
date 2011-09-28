/*jshint sub: true */
/*global Vector3Base:true */

/** @class
 *
 * A 3-element vector.
 *
 * Uses Float32Array internally, if possible.
 * Most methods alter the object whose method were called for performance reasons.
 */
function Vector3( data ) {
    return Vector3Base.call( this, data );
}

Vector3.prototype = {
    constructor: Vector3,
    /**
     * @public
     */
    clone: function() {
        return new this.constructor( this );
    },
    /**
     * Set the elements according to another vector.
     * @param {Vector3} data Array to copy from.
     * @returns {Vector3} this
     */
    set: function( data ) {
        this[ 0 ] = data[ 0 ];
        this[ 1 ] = data[ 1 ];
        this[ 2 ] = data[ 2 ];
        return this;
    },
    /**
     * Adds the values of a vector to this object.
     * @param {Array} vector Array-like object to add.
     * @returns {Vector3} this
     */
    add: function( vector ) {
        this[ 0 ] += vector[ 0 ];
        this[ 1 ] += vector[ 1 ];
        this[ 2 ] += vector[ 2 ];
        return this;
    },
    /**
     * Subtracts the values of a vector from this object.
     * @param {Array} vector Array-like object to subtract.
     * @returns {Vector3} this
     */
    subtract: function( vector ) {
        this[ 0 ] -= vector[ 0 ];
        this[ 1 ] -= vector[ 1 ];
        this[ 2 ] -= vector[ 2 ];
        return this;
    },
    /**
     * Negates every element of the vector.
     * @returns {Vector3} this
     */
    negate: function() {
        this[ 0 ] = -this[ 0 ];
        this[ 1 ] = -this[ 1 ];
        this[ 2 ] = -this[ 2 ];
        return this;
    },
    /**
     * Scales this vector uniformly.
     * @param {Number} factor
     * @returns {Vector3} this
     */
    scale: function( factor ) {
        this[ 0 ] *= factor;
        this[ 1 ] *= factor;
        this[ 2 ] *= factor;
        return this;
    },
    /**
     * @returns {Vector3} this
     */
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
    /**
     * Computes the cross product of this vector with another.
     * The value is stored in this object.
     *
     * @param {Array} vector
     * @returns {Vector3} this
     */
    cross: function( vector ) {
        var x = this[ 0 ], y = this[ 1 ], z = this[ 2 ];
        var x2 = vector[ 0 ], y2 = vector[ 1 ], z2 = vector[ 2 ];

        this[ 0 ] = y * z2 - z * y2;
        this[ 1 ] = z * x2 - x * z2;
        this[ 2 ] = x * y2 - y * x2;
        return this;
    },
    /**
     * Returns the length (norm) of this vector.
     * @returns {Number}
     */
    length: function() {
        var x = this[ 0 ], y = this[ 1 ], z = this[ 2 ];
        return Math.sqrt( x * x + y * y + z * z);
    },
    /**
     * Returns the length of this vector squared.
     */
    length2: function() {
        var x = this[ 0 ], y = this[ 1 ], z = this[ 2 ];
        return x * x + y * y + z * z;
    },
    /**
     * Returns the dot product of this vector with another.
     * @returns {Number}
     */
    dot: function( vector ) {
        return this[ 0 ] * vector[ 0 ] + this[ 1 ] * vector[ 1 ] + this[ 2 ] * vector[ 2 ];
    }
};

// Vector3.extend( Vector3Base );
