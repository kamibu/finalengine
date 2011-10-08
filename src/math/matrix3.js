/*global
    Matrix4      :  false,
    Quaternaion  :  false
*/

/** @constructor
 * A fast mplementation of 3x3 rotation matrixes.
 * @param {Array|Matrix3=} data A Javascript array with the initializing data (optional)
 */
function Matrix3( data ) {
    /**
     * @public
     * @type Float32Array
     * @default Identity matrix
     */
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
     * @returns {Matrix3}
     */
    clone: function() {
        return new Matrix3( this );
    }
};
