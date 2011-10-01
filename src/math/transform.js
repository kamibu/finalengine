/*global
    Matrix4     :  false,
    Node        :  false,
    Quaternion  :  false,
    TempVars    :  false,
    Vector3     :  false
*/

/** @class
 * Represents a transformation in 3D space (position, orientation, scale).
 */
function Transform() {
    this.position = new Vector3();
    this.orientation = new Quaternion();
    this.scale = 1;
    this.invalidate();
    this.matrix = new Matrix4();
}

Transform.prototype = {
    constructor: Transform,
    set: function( transform ) {
        this.position.set( transform.position );
        this.orientation.set( transform.orientation );
        this.scale = transform.scale;
        return this.invalidate();
    },
    /**
     * @param {Vector3} position The new position as a vector.
     * @returns {Transform} this
     */
    setPosition: function( position ) {
        this.position.set( position );
        return this.invalidate();
    },
    /**
     * @param {Vector3} orientation The new orientation as a quaternion.
     * @returns {Transform} this
     */
    setOrientation: function( orientation ) {
        this.orientation.set( orientation );
        return this.invalidate();
    },
    /**
     * Scales the object uniformly.
     * @param {Number} scale The new scale as a scalar.
     * @returns {Transform} this
     */
    setScale: function( scale ) {
        this.scale = scale;
        return this.invalidate();
    },
    /**
     * Returns a copy of the position vector.
     * @param {Vector3} [dest] Alter this variable instead of generating a new Vector3.
     * @returns {Vector3} dest if specified, a new Vector3 otherwise.
     */
    getPosition: function( dest ) {
        if ( !dest ) {
            dest = new Vector3();
        }
        return dest.set( this.position );
    },
    /**
     * Returns a copy of the orientation quaternion.
     * @param {Quaternion} [dest] Alter this variable instead of generating a new quaternion.
     * @returns {Quaternion} dest if specified, a new quaternion otherwise.
     */
    getOrientation: function( dest ) {
        if ( !dest ) {
            dest = new Quaternion();
        }
        return dest.set( this.orientation );
    },
    /**
     * @returns {Number}
     */
    getScale: function() {
        return this.scale;
    },
    /**
     * Resets transform to default values.
     * @returns {Transform} this
     */
    setIdentity: function() {
        this.position.data.set( [ 0, 0, 0 ] );
        this.orientation.data.set( [ 0, 0, 0, 1 ] );
        this.scale = 1;
        return this.invalidate();
    },
    /**
     * Combines this transform with another and stores the result to this transform.
     * @returns {Transform} this
     */
    // TODO: further documenting
    combineWith: function( transform ) {
        TempVars.lock();
        this.scale *= transform.scale;
        transform.orientation.multiplyVector3( this.position ).scale( transform.scale ).add( transform.position );
        this.orientation.preMultiply( transform.orientation );
        TempVars.release();

        return this.invalidate();
    },
    /**
     * Returns a transformation matrix.
     * @param {Matrix4} [dest] Alter dest object instead of creating a new matrix.
     * @returns {Matrix4} dest if specified, a new matrix otherwise.
     */
    getMatrix: function( dest ) {
        if ( !dest ) {
            dest = new Matrix4();
        }
        if ( this.needsUpdate ) {
            this.update();
        }
        return dest.set( this.matrix );
    },
    /**
     * Sets position, orientation and scale to match a transformation matrix.
     * @param {Matrix4} matrix
     * @returns {Transform} this
     */
    setMatrix: function( matrix ) {
        var a = matrix.data;

        var m00 = a[ 0 ], m01 = a[ 1 ], m02 = a[ 2 ];
        this.scale = Math.sqrt( m00 * m00 + m01 * m01 + m02 * m02 );
        
        var pos = this.position.data;
        pos[ 0 ] = a[ 12 ];
        pos[ 1 ] = a[ 13 ];
        pos[ 2 ] = a[ 14 ];

        TempVars.lock();
        var mat = TempVars.getMatrix4().set( a );
        this.orientation.fromMatrix3( mat.toMatrix3( TempVars.getMatrix3() ) );
        TempVars.release();

        return this.invalidate();
    },
    /**
     * @param {Matrix4} [dest] Alter dest instead of creating a new Matrix4
     * @returns {Matrix4} dest if specified, a new matrix otherwise.
     */
    getInverseMatrix: function( dest ) {
        if ( !dest ) {
            dest = new Matrix4();
        }
        if ( this.needsUpdate  ) {
            this.update();
        }
        this.orientation.toMatrix4( dest ).transpose();
        //Translation part rotated by the transposed 3x3 matrix
        var pos = this.position.data,
            a = dest.data;

        var x = -pos[ 0 ],
            y = -pos[ 1 ],
            z = -pos[ 2 ];
        a[ 12 ] = x * a[ 0 ] + y * a[ 4 ] + z * a[ 8 ];
        a[ 13 ] = x * a[ 1 ] + y * a[ 5 ] + z * a[ 9 ];
        a[ 14 ] = x * a[ 2 ] + y * a[ 6 ] + z * a[ 10 ];
        return dest;
    },
    update: function() {
        var mat = this.matrix,
            a = mat.data;
        this.orientation.toMatrix4( mat );
        if ( this.scale != 1 ) {
            var s = this.scale;
            a[ 0 ] *= s;
            a[ 1 ] *= s;
            a[ 2 ] *= s;
            a[ 4 ] *= s;
            a[ 5 ] *= s;
            a[ 6 ] *= s;
            a[ 8 ] *= s;
            a[ 9 ] *= s;
            a[ 10 ] *= s;
        }
        var pos = this.position.data;
        a[ 12 ] = pos[ 0 ];
        a[ 13 ] = pos[ 1 ];
        a[ 14 ] = pos[ 2 ];
        this.needsUpdate = false;
        return this;
    },
    invalidate: function() {
        this.needsUpdate = true;
        return this;
    }
};
