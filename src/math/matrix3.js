/*global
    Matrix4      :  false,
    Quaternaion  :  false
*/

/** @class
 * A fast mplementation of 3x3 rotation matrixes.
 */
function Matrix3( data ) {
    this.data = new Float32Array( 9 );
    if ( data ) {
        if ( data.data ) {
            this.data.set( data.data );
        }
        else {
            this.data.set( data );
        }
    }
    else {
        this.setIdentity();
    }
}

Matrix3.prototype = {
    constructor: Matrix3,
    /**
     * Returns a clone of this matrix.
     * @returns {Matrix3}
     */
    /**
     * Copies the values of an array into this matrix.
     * @param {Matrix3} src A Matrix3 object to copy from.
     */
    set: function( src ) {
        if ( src instanceof Array ) {
            throw 'error';
        }
        this.data.set( src.data );
        return this;
    },
    /**
     * Reset matrix to identity matrix.
     * @returns {Matrix3} this
     */
    setIdentity: function() {
        var a = this.data;
        a[ 0 ] = 1;
        a[ 1 ] = 0;
        a[ 2 ] = 0;

        a[ 3 ] = 0;
        a[ 4 ] = 1;
        a[ 5 ] = 0;

        a[ 6 ] = 0;
        a[ 7 ] = 0;
        a[ 8 ] = 1;

        return this;
    },
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
    /**
     * Returns a clone of this matrix.
     * @returns {Matrix4}
     */
    clone: function() {
        return new Matrix3( this );
    },
    get 0 () {
        throw 'Do not fucking use it';
    },
    set 0 ( value ) {
        throw 'Do not fucking use it';
    },
    get 1 () {
        throw 'Do not fucking use it';
    },
    set 1 ( value ) {
        throw 'Do not fucking use it';
    },
    get 2 () {
        throw 'Do not fucking use it';
    },
    set 2 ( value ) {
        throw 'Do not fucking use it';
    },
    get 3 () {
        throw 'Do not fucking use it';
    },
    set 3 ( value ) {
        throw 'Do not fucking use it';
    },
    get 4 () {
        throw 'Do not fucking use it';
    },
    set 4 ( value ) {
        throw 'Do not fucking use it';
    },
    get 5 () {
        throw 'Do not fucking use it';
    },
    set 5 ( value ) {
        throw 'Do not fucking use it';
    },
    get 6 () {
        throw 'Do not fucking use it';
    },
    set 6 ( value ) {
        throw 'Do not fucking use it';
    },
    get 7 () {
        throw 'Do not fucking use it';
    },
    set 7 ( value ) {
        throw 'Do not fucking use it';
    },
    get 8 () {
        throw 'Do not fucking use it';
    },
    set 8 ( value ) {
        throw 'Do not fucking use it';
    },
    get 9 () {
        throw 'Do not fucking use it';
    },
    set 9 ( value ) {
        throw 'Do not fucking use it';
    },
};
