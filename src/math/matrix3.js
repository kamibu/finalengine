/*jshint sub: true */
/*global Matrix4: true, Quaternaion: true*/

/** @class
 * A fast mplementation of 3x3 rotation matrixes.
 */
var Matrix3 = (
    /** @constructor
     */
    function () {
    // check to see if we can modify the instance of a Float32Array
    var testSubject = new Float32Array();
    var a = {};
    testSubject[ '__proto__' ] = a;
    if ( testSubject[ '__proto__' ] === a ) {
        // instance __proto__ is configurable
        // chrome
        return function Matrix3( data ) {
            var ret = new Float32Array( 9 );
            ret[ '__proto__' ] = this.constructor.prototype;
            ret.data = ret;
            if ( data ) {
                ret.set( data );
            }
            return ret;
        };
    }
    // instance __proto__ is not configurable
    // we'll have to hack it
    return function Matrix3( data ) {
        var ret = new Array( 9 );
        ret[ '__proto__' ] = this.constructor.prototype;
        ret.data = ret;
        ret.identity();
        if ( data ) {
            ret.set( data );
        }
        return ret;
    };
}() );

Matrix3.prototype = {
    constructor: Matrix3,
    /**
     * Returns a clone of this matrix.
     * @param {Matrix3} [dest] A matrix3 or any other array-like object to copy to.
     * @returns {Matrix3}
     */
    clone: function( dest ) {
        if ( !dest ) {
            dest = new Matrix4();
        }
        dest[ 0 ] = this[ 0 ];
        dest[ 1 ] = this[ 1 ];
        dest[ 2 ] = this[ 2 ];
        dest[ 3 ] = this[ 3 ];
        dest[ 4 ] = this[ 4 ];
        dest[ 5 ] = this[ 5 ];
        dest[ 6 ] = this[ 6 ];
        dest[ 7 ] = this[ 7 ];
        dest[ 8 ] = this[ 8 ];
        return dest;
    },
    /**
     * Copies the values of an array into this matrix.
     * @param {Array} src An array-like object to copy from.
     */
    fromArray: function( data ) {
        this[ 0 ] = data[ 0 ];
        this[ 1 ] = data[ 1 ];
        this[ 2 ] = data[ 2 ];
        this[ 3 ] = data[ 3 ];
        this[ 4 ] = data[ 4 ];
        this[ 5 ] = data[ 5 ];
        this[ 6 ] = data[ 6 ];
        this[ 7 ] = data[ 7 ];
        this[ 8 ] = data[ 8 ];
        return this;
    }
//    toQuaternion: function() {
//        var ret = new Quaternion();
//        if ( this[ 0 ] > this[ 4 ] && this[ 0 ] > this[ 8 ] ) {
//            var r =
//
//        }
//        else if ( this[ 4 ] > this[ 0 ] && this[ 4 ] > this[ 8 ] ) {
//
//        }
//        else {
//
//        }
//    },
};

/**
 * Generates an identity matrix.
 * @param {Matrix3} [dest] A matrix to reset to the identity matrix.
 * @returns {Matrix3} dest if specified, a new Matrix3 otherwise
 */
Matrix3.identity = function( dest ) {
    if ( !dest ) {
        dest = new Matrix3();
    }

    dest[ 0 ] = 1;
    dest[ 1 ] = 0;
    dest[ 2 ] = 0;

    dest[ 3 ] = 0;
    dest[ 4 ] = 1;
    dest[ 5 ] = 0;

    dest[ 6 ] = 0;
    dest[ 7 ] = 0;
    dest[ 8 ] = 1;

    return dest;
};

( function () {
    // check to see if we can modify the instance of a Float32Array
    var testSubject = new Float32Array();
    var a = {};
    testSubject[ '__proto__' ] = a;
    if ( testSubject[ '__proto__' ] === a ) {
        // instance __proto__ is configurable
        // chrome
        Matrix3.extend( Float32Array );
    }
    else {
        Matrix3.prototype.toString = function() {
            return this.join( ',' );
        };
        Matrix3.prototype.subarray = Array.prototype.slice;
        Matrix3.extend( Array );
    }
}() );
