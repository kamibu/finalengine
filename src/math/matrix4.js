// extern
var Matrix3, Vector3;

function Matrix4( data ) {
    /* Float32Array does not implement call method in chrome.
     * prototype hacking to the resque
     */
    if ( Float32Array.call ) {
        Float32Array.call( this, 16 );
        if ( data ) {
            this.set( data );
        }
    }
    else {
        var old = Float32Array.prototype;
        Float32Array.prototype = Matrix4.prototype;
        var ret = new Float32Array( 16 );
        Float32Array.prototype = old;

        if ( data ) {
            ret.set( data );
        }
        return ret;
    }
}

Matrix4.prototype = {
    constructor: Matrix4,
    set: function( data ) {
        this[ 0 ] = data[ 0 ];
        this[ 1 ] = data[ 1 ];
        this[ 2 ] = data[ 2 ];
        this[ 3 ] = data[ 3 ];
        this[ 4 ] = data[ 4 ];
        this[ 5 ] = data[ 5 ];
        this[ 6 ] = data[ 6 ];
        this[ 7 ] = data[ 7 ];
        this[ 8 ] = data[ 8 ];
        this[ 9 ] = data[ 9 ];
        this[ 10 ] = data[ 10 ];
        this[ 11 ] = data[ 11 ];
        this[ 12 ] = data[ 12 ];
        this[ 13 ] = data[ 13 ];
        this[ 14 ] = data[ 14 ];
        this[ 15 ] = data[ 15 ];
        return this;
    },
    setTo: function( dest ) {
        dest[ 0 ] = this[ 0 ];
        dest[ 1 ] = this[ 1 ];
        dest[ 2 ] = this[ 2 ];
        dest[ 3 ] = this[ 3 ];
        dest[ 4 ] = this[ 4 ];
        dest[ 5 ] = this[ 5 ];
        dest[ 6 ] = this[ 6 ];
        dest[ 7 ] = this[ 7 ];
        dest[ 8 ] = this[ 8 ];
        dest[ 9 ] = this[ 9 ];
        dest[ 10 ] = this[ 10 ];
        dest[ 11 ] = this[ 11 ];
        dest[ 12 ] = this[ 12 ];
        dest[ 13 ] = this[ 13 ];
        dest[ 14 ] = this[ 14 ];
        dest[ 15 ] = this[ 15 ];
        return dest;
    },
    identity: function() {
        this[ 0 ] = 1;
        this[ 1 ] = 0;
        this[ 2 ] = 0;
        this[ 3 ] = 0;

        this[ 4 ] = 0;
        this[ 5 ] = 1;
        this[ 6 ] = 0;
        this[ 7 ] = 0;

        this[ 8 ] = 0;
        this[ 9 ] = 0;
        this[ 10 ] = 1;
        this[ 11 ] = 0;

        this[ 12 ] = 0;
        this[ 13 ] = 0;
        this[ 14 ] = 0;
        this[ 15 ] = 1;
        return this;
    },
    getTranslation: function( dest ) {
        if ( !dest ) {
            dest = new Vector3();
        }
        dest[ 0 ] = this[ 12 ];
        dest[ 1 ] = this[ 13 ];
        dest[ 2 ] = this[ 14 ];
        return dest;
    },
    getRotationMatrix: function( dest ) {
        if ( !dest ) {
            dest = new Matrix3();
        }
        dest[ 0 ] = this[ 0 ];
        dest[ 1 ] = this[ 1 ];
        dest[ 2 ] = this[ 2 ];

        dest[ 3 ] = this[ 4 ];
        dest[ 4 ] = this[ 5 ];
        dest[ 5 ] = this[ 6 ];

        dest[ 6 ] = this[ 8 ];
        dest[ 7 ] = this[ 9 ];
        dest[ 8 ] = this[ 10 ];
        return dest;
    },
    transpose: function(){
        var a01 = this[ 1 ],
            a02 = this[ 2 ],
            a03 = this[ 3 ],
            a12 = this[ 6 ],
            a13 = this[ 7 ],
            a23 = this[ 11 ];

        this[ 1 ] = this[ 4 ];
        this[ 2 ] = this[ 8 ];
        this[ 3 ] = this[ 12 ];
        this[ 4 ] = a01;
        this[ 6 ] = this[ 9 ];
        this[ 7 ] = this[ 13 ];
        this[ 8 ] = a02;
        this[ 9 ] = a12;
        this[ 11 ] = this[ 14 ];
        this[ 12 ] = a03;
        this[ 13 ] = a13;
        this[ 14 ] = a23;
        return this;
    },
    determinant: function() {
        // Cache the matrix values (makes for huge speed increases!)
        var a00 = this[ 0 ], a01 = this[ 1 ], a02 = this[ 2 ], a03 = this[ 3 ],
            a10 = this[ 4 ], a11 = this[ 5 ], a12 = this[ 6 ], a13 = this[ 7 ],
            a20 = this[ 8 ], a21 = this[ 9 ], a22 = this[ 10 ], a23 = this[ 11 ],
            a30 = this[ 12 ], a31 = this[ 13 ], a32 = this[ 14 ], a33 = this[ 15 ];

        return  a30*a21*a12*a03 - a20*a31*a12*a03 - a30*a11*a22*a03 + a10*a31*a22*a03 +
                        a20*a11*a32*a03 - a10*a21*a32*a03 - a30*a21*a02*a13 + a20*a31*a02*a13 +
                        a30*a01*a22*a13 - a00*a31*a22*a13 - a20*a01*a32*a13 + a00*a21*a32*a13 +
                        a30*a11*a02*a23 - a10*a31*a02*a23 - a30*a01*a12*a23 + a00*a31*a12*a23 +
                        a10*a01*a32*a23 - a00*a11*a32*a23 - a20*a11*a02*a33 + a10*a21*a02*a33 +
                        a20*a01*a12*a33 - a00*a21*a12*a33 - a10*a01*a22*a33 + a00*a11*a22*a33;
    },
    inverse: function() {
        // Cache the matrix values (makes for huge speed increases!)
        var a00 = this[ 0 ], a01 = this[ 1 ], a02 = this[ 2 ], a03 = this[ 3 ];
        var a10 = this[ 4 ], a11 = this[ 5 ], a12 = this[ 6 ], a13 = this[ 7 ];
        var a20 = this[ 8 ], a21 = this[ 9 ], a22 = this[ 10 ], a23 = this[ 11 ];
        var a30 = this[ 12 ], a31 = this[ 13 ], a32 = this[ 14 ], a33 = this[ 15 ];

        var b00 = a00 * a11 - a01 * a10;
        var b01 = a00 * a12 - a02 * a10;
        var b02 = a00 * a13 - a03 * a10;
        var b03 = a01 * a12 - a02 * a11;
        var b04 = a01 * a13 - a03 * a11;
        var b05 = a02 * a13 - a03 * a12;
        var b06 = a20 * a31 - a21 * a30;
        var b07 = a20 * a32 - a22 * a30;
        var b08 = a20 * a33 - a23 * a30;
        var b09 = a21 * a32 - a22 * a31;
        var b10 = a21 * a33 - a23 * a31;
        var b11 = a22 * a33 - a23 * a32;

        // Calculate the determinant (inlined to avoid double-caching)
        var invDet = 1 / ( b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06 );

        this[ 0 ] = ( a11 * b11 - a12 * b10 + a13 * b09 ) * invDet;
        this[ 1 ] = ( -a01 * b11 + a02 * b10 - a03 * b09 ) * invDet;
        this[ 2 ] = ( a31 * b05 - a32 * b04 + a33 * b03 ) * invDet;
        this[ 3 ] = ( -a21 * b05 + a22 * b04 - a23 * b03 ) * invDet;
        this[ 4 ] = ( -a10 * b11 + a12 * b08 - a13 * b07 ) * invDet;
        this[ 5 ] = ( a00 * b11 - a02 * b08 + a03 * b07 ) * invDet;
        this[ 6 ] = ( -a30 * b05 + a32 * b02 - a33 * b01 ) * invDet;
        this[ 7 ] = ( a20 * b05 - a22 * b02 + a23 * b01 ) * invDet;
        this[ 8 ] = ( a10 * b10 - a11 * b08 + a13 * b06 ) * invDet;
        this[ 9 ] = ( -a00 * b10 + a01 * b08 - a03 * b06 ) * invDet;
        this[ 10 ] = ( a30 * b04 - a31 * b02 + a33 * b00 ) * invDet;
        this[ 11 ] = ( -a20 * b04 + a21 * b02 - a23 * b00 ) * invDet;
        this[ 12 ] = ( -a10 * b09 + a11 * b07 - a12 * b06 ) * invDet;
        this[ 13 ] = ( a00 * b09 - a01 * b07 + a02 * b06 ) * invDet;
        this[ 14 ] = ( -a30 * b03 + a31 * b01 - a32 * b00 ) * invDet;
        this[ 15 ] = ( a20 * b03 - a21 * b01 + a22 * b00 ) * invDet;
        return this;
    },
    multiply: function( matrix ) {
        // Cache the matrix values (makes for huge speed increases!)
        var a00 = this[ 0 ], a01 = this[ 1 ], a02 = this[ 2 ], a03 = this[ 3 ];
        var a10 = this[ 4 ], a11 = this[ 5 ], a12 = this[ 6 ], a13 = this[ 7 ];
        var a20 = this[ 8 ], a21 = this[ 9 ], a22 = this[ 10 ], a23 = this[ 11 ];
        var a30 = this[ 12 ], a31 = this[ 13 ], a32 = this[ 14 ], a33 = this[ 15 ];

        var b00 = matrix[ 0 ], b01 = matrix[ 1 ], b02 = matrix[ 2 ], b03 = matrix[ 3 ];
        var b10 = matrix[ 4 ], b11 = matrix[ 5 ], b12 = matrix[ 6 ], b13 = matrix[ 7 ];
        var b20 = matrix[ 8 ], b21 = matrix[ 9 ], b22 = matrix[ 10 ], b23 = matrix[ 11 ];
        var b30 = matrix[ 12 ], b31 = matrix[ 13 ], b32 = matrix[ 14 ], b33 = matrix[ 15 ];

        this[ 0 ] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
        this[ 1 ] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
        this[ 2 ] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
        this[ 3 ] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
        this[ 4 ] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
        this[ 5 ] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
        this[ 6 ] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
        this[ 7 ] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
        this[ 8 ] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
        this[ 9 ] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
        this[ 10 ] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
        this[ 11 ] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
        this[ 12 ] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
        this[ 13 ] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
        this[ 14 ] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
        this[ 15 ] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;

        return this;
    },
    multiplyVector3: function( vector ) {
        var x = vector[ 0 ], y = vector[ 1 ], z = vector[ 2 ];

        vector[ 0 ] = this[ 0 ] * x + this[ 4 ] * y + this[ 8 ] * z + this[ 12 ];
        vector[ 1 ] = this[ 1 ] * x + this[ 5 ] * y + this[ 9 ] * z + this[ 13 ];
        vector[ 2 ] = this[ 2 ] * x + this[ 6 ] * y + this[ 10 ] * z + this[ 14 ];
        return vector;
    },
    multiplyVector4: function( vector ) {
        var x = vector[ 0 ], y = vector[ 1 ], z = vector[ 2 ], w = vector[ 3 ];

        vector[ 0 ] = this[ 0 ] * x + this[ 4 ] * y + this[ 8 ] * z + this[ 12 ] * w;
        vector[ 1 ] = this[ 1 ] * x + this[ 5 ] * y + this[ 9 ] * z + this[ 13 ] * w;
        vector[ 2 ] = this[ 2 ] * x + this[ 6 ] * y + this[ 10 ] * z + this[ 14 ] * w;
        vector[ 3 ] = this[ 3 ] * x + this[ 7 ] * y + this[ 11 ] * z + this[ 15 ] * w;

        return vector;
    },
    frustrum: function( left, right, bottom, top, near, far ) {
        var rl = ( right - left );
        var tb = ( top - bottom );
        var fn = ( far - near );
        this[ 0 ] = ( near * 2 ) / rl;
        this[ 1 ] = 0;
        this[ 2 ] = 0;
        this[ 3 ] = 0;
        this[ 4 ] = 0;
        this[ 5 ] = ( near * 2 ) / tb;
        this[ 6 ] = 0;
        this[ 7 ] = 0;
        this[ 8 ] = ( right + left ) / rl;
        this[ 9 ] = ( top + bottom ) / tb;
        this[ 10 ] = -( far + near ) / fn;
        this[ 11 ] = -1;
        this[ 12 ] = 0;
        this[ 13 ] = 0;
        this[ 14 ] = -( far * near * 2 ) / fn;
        this[ 15 ] = 0;
        return this;
    },
    perspective: function( fovy, aspect, near, far ) {
        var top = near * Math.tan( fovy * Math.PI / 360.0 );
        var right = top * aspect;
        return this.frustum( -right, right, -top, top, near, far );
    },
    ortho: function( left, right, bottom, top, near, far ) {
        var rl = ( right - left );
        var tb = ( top - bottom );
        var fn = ( far - near );
        this[ 0 ] = 2 / rl;
        this[ 1 ] = 0;
        this[ 2 ] = 0;
        this[ 3 ] = 0;
        this[ 4 ] = 0;
        this[ 5 ] = 2 / tb;
        this[ 6 ] = 0;
        this[ 7 ] = 0;
        this[ 8 ] = 0;
        this[ 9 ] = 0;
        this[ 10 ] = -2 / fn;
        this[ 11 ] = 0;
        this[ 12 ] = -( left + right ) / rl;
        this[ 13 ] = -( top + bottom ) / tb;
        this[ 14 ] = -( far + near ) / fn;
        this[ 15 ] = 1;
    },
    clone: function() {
        return new this.constructor( this );
    }
};

Matrix4.extend( Float32Array );
