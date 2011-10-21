/*global
    Matrix3  :  false,
    Vector3  :  false
*/

/**
 * @class
 * A fast implementation of 4x4 transformation matrixes.
 *
 * It has a Float32Array .data property that is an array of length 16 in row-major order.
 *
 * @constructor
 * @param {Array} data A Javascript array with the initializing data (optional)
 */
function Matrix4( data ) {
    /**
     * @public
     * @type Float32Array
     * @default Identity matrix
     */
    this.data = new Float32Array( 16 );
    if ( data ) {
        if ( data.data ) {
            this.data.set( data.data );
        }
        else {
            this.data.set( data );
        }
    }
    else {
        Matrix4.identity( this );
    }
}

Matrix4.prototype = {
    constructor: Matrix4,
    /**
     * Copies the values of an other matrix to this matrix.
     * @param {Matrix4} src A Matrix4 object to copy from.
     * @returns Matrix4 this
     */
    set: function( src ) {
        if ( src instanceof Array ) {
            throw 'error';
        }
        this.data.set( src.data );
        return this;
    },
    /**
     * Copies the values of this matrix to another matrix.
     * @param {Matrix4} dest A Matrix4 object to copy to.
     * @returns Matrix4 dest
     */
    copyTo: function( dest ) {
        if ( dest instanceof Array ) {
            throw 'error';
        }
        dest.data.set( this.data );
        return dest;
    },
    /** Returns the translation vector of this matrix.
     * @returns Vector3
     */
    getTranslation: function( dest ) {
        if ( !dest ) {
            dest = new Vector3();
        }
        var a = this.data,
            b = dest.data;

        b[ 0 ] = a[ 12 ];
        b[ 1 ] = a[ 13 ];
        b[ 2 ] = a[ 14 ];
        return dest;
    },
    /**
     * Returns the rotation matrix corresponding to this matrix.
     * @returns Matrix3
     */
    getRotationMatrix: function( dest ) {
        if ( !dest ) {
            dest = new Matrix4();
        }
        var a = this.data,
            b = dest.data;

        b[ 0 ] = a[ 0 ];
        b[ 1 ] = a[ 1 ];
        b[ 2 ] = a[ 2 ];

        b[ 3 ] = a[ 4 ];
        b[ 4 ] = a[ 5 ];
        b[ 5 ] = a[ 6 ];

        b[ 6 ] = a[ 8 ];
        b[ 7 ] = a[ 9 ];
        b[ 8 ] = a[ 10 ];
        return dest;
    },
    /**
     * Sets this matrix to its transpose.
     * @returns Matrix4
     */
    transpose: function() {
        var a = this.data;

        var a01 = a[ 1 ],
            a02 = a[ 2 ],
            a03 = a[ 3 ],
            a12 = a[ 6 ],
            a13 = a[ 7 ],
            a23 = a[ 11 ];

        a[ 1 ] = a[ 4 ];
        a[ 2 ] = a[ 8 ];
        a[ 3 ] = a[ 12 ];
        a[ 4 ] = a01;
        a[ 6 ] = a[ 9 ];
        a[ 7 ] = a[ 13 ];
        a[ 8 ] = a02;
        a[ 9 ] = a12;
        a[ 11 ] = a[ 14 ];
        a[ 12 ] = a03;
        a[ 13 ] = a13;
        a[ 14 ] = a23;
        return this;
    },
    /**
     * Get the determinant of this matrix.
     */
    getDeterminant: function() {
        var a = this.data;
        // Cache the matrix values (makes for huge speed increases!)
        var a00 = a[ 0 ], a01 = a[ 1 ], a02 = a[ 2 ], a03 = a[ 3 ],
            a10 = a[ 4 ], a11 = a[ 5 ], a12 = a[ 6 ], a13 = a[ 7 ],
            a20 = a[ 8 ], a21 = a[ 9 ], a22 = a[ 10 ], a23 = a[ 11 ],
            a30 = a[ 12 ], a31 = a[ 13 ], a32 = a[ 14 ], a33 = a[ 15 ];

        return  a30*a21*a12*a03 - a20*a31*a12*a03 - a30*a11*a22*a03 + a10*a31*a22*a03 +
                        a20*a11*a32*a03 - a10*a21*a32*a03 - a30*a21*a02*a13 + a20*a31*a02*a13 +
                        a30*a01*a22*a13 - a00*a31*a22*a13 - a20*a01*a32*a13 + a00*a21*a32*a13 +
                        a30*a11*a02*a23 - a10*a31*a02*a23 - a30*a01*a12*a23 + a00*a31*a12*a23 +
                        a10*a01*a32*a23 - a00*a11*a32*a23 - a20*a11*a02*a33 + a10*a21*a02*a33 +
                        a20*a01*a12*a33 - a00*a21*a12*a33 - a10*a01*a22*a33 + a00*a11*a22*a33;
    },
    /**
     * Set this matrix to its inverse.
     * @returns Matrix4
     */
    inverse: function() {
        var a = this.data;
        // Cache the matrix values (makes for huge speed increases!)
        var a00 = a[ 0 ], a01 = a[ 1 ], a02 = a[ 2 ], a03 = a[ 3 ],
            a10 = a[ 4 ], a11 = a[ 5 ], a12 = a[ 6 ], a13 = a[ 7 ],
            a20 = a[ 8 ], a21 = a[ 9 ], a22 = a[ 10 ], a23 = a[ 11 ],
            a30 = a[ 12 ], a31 = a[ 13 ], a32 = a[ 14 ], a33 = a[ 15 ];

        var b00 = a00 * a11 - a01 * a10,
            b01 = a00 * a12 - a02 * a10,
            b02 = a00 * a13 - a03 * a10,
            b03 = a01 * a12 - a02 * a11,
            b04 = a01 * a13 - a03 * a11,
            b05 = a02 * a13 - a03 * a12,
            b06 = a20 * a31 - a21 * a30,
            b07 = a20 * a32 - a22 * a30,
            b08 = a20 * a33 - a23 * a30,
            b09 = a21 * a32 - a22 * a31,
            b10 = a21 * a33 - a23 * a31,
            b11 = a22 * a33 - a23 * a32;

        // Calculate the determinant (inlined to avoid double-caching)
        var invDet = 1 / ( b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06 );

        a[ 0 ] = ( a11 * b11 - a12 * b10 + a13 * b09 ) * invDet;
        a[ 1 ] = ( -a01 * b11 + a02 * b10 - a03 * b09 ) * invDet;
        a[ 2 ] = ( a31 * b05 - a32 * b04 + a33 * b03 ) * invDet;
        a[ 3 ] = ( -a21 * b05 + a22 * b04 - a23 * b03 ) * invDet;
        a[ 4 ] = ( -a10 * b11 + a12 * b08 - a13 * b07 ) * invDet;
        a[ 5 ] = ( a00 * b11 - a02 * b08 + a03 * b07 ) * invDet;
        a[ 6 ] = ( -a30 * b05 + a32 * b02 - a33 * b01 ) * invDet;
        a[ 7 ] = ( a20 * b05 - a22 * b02 + a23 * b01 ) * invDet;
        a[ 8 ] = ( a10 * b10 - a11 * b08 + a13 * b06 ) * invDet;
        a[ 9 ] = ( -a00 * b10 + a01 * b08 - a03 * b06 ) * invDet;
        a[ 10 ] = ( a30 * b04 - a31 * b02 + a33 * b00 ) * invDet;
        a[ 11 ] = ( -a20 * b04 + a21 * b02 - a23 * b00 ) * invDet;
        a[ 12 ] = ( -a10 * b09 + a11 * b07 - a12 * b06 ) * invDet;
        a[ 13 ] = ( a00 * b09 - a01 * b07 + a02 * b06 ) * invDet;
        a[ 14 ] = ( -a30 * b03 + a31 * b01 - a32 * b00 ) * invDet;
        a[ 15 ] = ( a20 * b03 - a21 * b01 + a22 * b00 ) * invDet;
        return this;
    },
    /*
     * Sets this matrix to the product of this matrix with the parameter passed.
     * @param {Matrix4} The matrix to multiply with.
     */
    multiply: function( matrix ) {
        var a = this.data,
            b = matrix.data;

        // Cache the matrix values (makes for huge speed increases!)
        var a00 = a[ 0 ], a01 = a[ 1 ], a02 = a[ 2 ], a03 = a[ 3 ],
            a10 = a[ 4 ], a11 = a[ 5 ], a12 = a[ 6 ], a13 = a[ 7 ],
            a20 = a[ 8 ], a21 = a[ 9 ], a22 = a[ 10 ], a23 = a[ 11 ],
            a30 = a[ 12 ], a31 = a[ 13 ], a32 = a[ 14 ], a33 = a[ 15 ];

        var b00 = b[ 0 ], b01 = b[ 1 ], b02 = b[ 2 ], b03 = b[ 3 ],
            b10 = b[ 4 ], b11 = b[ 5 ], b12 = b[ 6 ], b13 = b[ 7 ],
            b20 = b[ 8 ], b21 = b[ 9 ], b22 = b[ 10 ], b23 = b[ 11 ],
            b30 = b[ 12 ], b31 = b[ 13 ], b32 = b[ 14 ], b33 = b[ 15 ];

        a[ 0 ] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
        a[ 1 ] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
        a[ 2 ] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
        a[ 3 ] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
        a[ 4 ] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
        a[ 5 ] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
        a[ 6 ] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
        a[ 7 ] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
        a[ 8 ] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
        a[ 9 ] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
        a[ 10 ] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
        a[ 11 ] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
        a[ 12 ] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
        a[ 13 ] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
        a[ 14 ] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
        a[ 15 ] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;

        return this;
    },
    /**
     * Multiply with a Vector3 and store the value to the vector.
     * @param {Vector3} vector A vector or array-like object to multiply with.
     * @returns Vector3 The vector.
     */
    multiplyVector3: function( vector ) {
        var a = this.data,
            b = vector.data;

        var x = b[ 0 ], y = b[ 1 ], z = b[ 2 ];

        b[ 0 ] = a[ 0 ] * x + a[ 4 ] * y + a[ 8 ] * z + a[ 12 ];
        b[ 1 ] = a[ 1 ] * x + a[ 5 ] * y + a[ 9 ] * z + a[ 13 ];
        b[ 2 ] = a[ 2 ] * x + a[ 6 ] * y + a[ 10 ] * z + a[ 14 ];
        return vector;
    },
    /**
     * Returns a clone of this matrix.
     * @returns Matrix4
     */
    clone: function() {
        return new Matrix4( this );
    }
};

/**
 * Generates an identity matrix.
 * @param {Matrix4} [dest] A matrix to reset to the identity matrix.
 * @returns Matrix4 dest if specified, a new Matrix4 otherwise
 */
Matrix4.identity = function( dest ) {
    if ( !dest ) {
        dest = new Matrix4();
    }
    var a = dest.data;

    a[ 0 ] = 1;
    a[ 1 ] = 0;
    a[ 2 ] = 0;
    a[ 3 ] = 0;

    a[ 4 ] = 0;
    a[ 5 ] = 1;
    a[ 6 ] = 0;
    a[ 7 ] = 0;

    a[ 8 ] = 0;
    a[ 9 ] = 0;
    a[ 10 ] = 1;
    a[ 11 ] = 0;

    a[ 12 ] = 0;
    a[ 13 ] = 0;
    a[ 14 ] = 0;
    a[ 15 ] = 1;
    return dest;
};

/**
 * Generates a frustrum matrix with the given bounds.
 * @returns Matrix4 dest if specified, a new Matrix4 otherwise
 */
Matrix4.frustrum = function( left, right, bottom, top, near, far, dest ) {
    if ( !dest ) {
        dest = new Matrix4();
    }

    var a = dest.data;

    var rl = ( right - left );
    var tb = ( top - bottom );
    var fn = ( far - near );
    a[ 0 ] = ( near * 2 ) / rl;
    a[ 1 ] = 0;
    a[ 2 ] = 0;
    a[ 3 ] = 0;
    a[ 4 ] = 0;
    a[ 5 ] = ( near * 2 ) / tb;
    a[ 6 ] = 0;
    a[ 7 ] = 0;
    a[ 8 ] = ( right + left ) / rl;
    a[ 9 ] = ( top + bottom ) / tb;
    a[ 10 ] = -( far + near ) / fn;
    a[ 11 ] = -1;
    a[ 12 ] = 0;
    a[ 13 ] = 0;
    a[ 14 ] = -( far * near * 2 ) / fn;
    a[ 15 ] = 0;
    return dest;
};

/**
 * Generates a perspective projection matrix with the given bounds.
 * @returns Matrix4 dest if specified, a new Matrix4 otherwise
 */
Matrix4.perspective = function( fovy, aspect, near, far, dest ) {
    var top = near * Math.tan( fovy * Math.PI / 360.0 );
    var right = top * aspect;
    return Matrix4.frustrum( -right, right, -top, top, near, far, dest );
};

/**
 * Generates an orthogonal projection matrix with the given bounds
 * @returns Matrix4 dest if specified, a new Matrix4 otherwise
 */
Matrix4.ortho = function( left, right, bottom, top, near, far, dest ) {
    if ( !dest ) {
        dest = new Matrix4();
    }

    var a = dest.data;

    var rl = ( right - left );
    var tb = ( top - bottom );
    var fn = ( far - near );
    a[ 0 ] = 2 / rl;
    a[ 1 ] = 0;
    a[ 2 ] = 0;
    a[ 3 ] = 0;
    a[ 4 ] = 0;
    a[ 5 ] = 2 / tb;
    a[ 6 ] = 0;
    a[ 7 ] = 0;
    a[ 8 ] = 0;
    a[ 9 ] = 0;
    a[ 10 ] = -2 / fn;
    a[ 11 ] = 0;
    a[ 12 ] = -( left + right ) / rl;
    a[ 13 ] = -( top + bottom ) / tb;
    a[ 14 ] = -( far + near ) / fn;
    a[ 15 ] = 1;
    return dest;
};
