/*global Matrix4: true, Quaternion: true, TempVars: true, Vector3: true */

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
     * @param {Array} position The new position as a vector.
     * @returns {Transform} this
     */
    setPosition: function( position ) {
        this.position.set( position );
        return this.invalidate();
    },
    /**
     * @param {Array} orientation The new orientation as a quaternion.
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
        this.position.set( [ 0, 0, 0 ] );
        this.orientation.set( [ 0, 0, 0, 1 ] );
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
        var m00 = matrix[ 0 ], m01 = matrix[ 1 ], m02 = matrix[ 2 ];
        this.scale = Math.sqrt( m00 * m00 + m01 * m01 + m02 * m02 );

        this.position[ 0 ] = matrix[ 12 ];
        this.position[ 1 ] = matrix[ 13 ];
        this.position[ 2 ] = matrix[ 14 ];

        TempVars.lock();
        var mat = TempVars.getMatrix4().set( matrix );
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
        var x = -this.position[ 0 ];
        var y = -this.position[ 1 ];
        var z = -this.position[ 2 ];
        dest[ 12 ] = x * dest[ 0 ] + y * dest[ 4 ] + z * dest[ 8 ];
        dest[ 13 ] = x * dest[ 1 ] + y * dest[ 5 ] + z * dest[ 9 ];
        dest[ 14 ] = x * dest[ 2 ] + y * dest[ 6 ] + z * dest[ 10 ];
        return dest;
    },
    update: function() {
        var mat = this.matrix;
        this.orientation.toMatrix4( mat );
        if ( this.scale != 1 ) {
            var s = this.scale;
            mat[ 0 ] *= s;
            mat[ 1 ] *= s;
            mat[ 2 ] *= s;
            mat[ 4 ] *= s;
            mat[ 5 ] *= s;
            mat[ 6 ] *= s;
            mat[ 8 ] *= s;
            mat[ 9 ] *= s;
            mat[ 10 ] *= s;
        }
        var pos = this.position;
        mat[ 12 ] = pos[ 0 ];
        mat[ 13 ] = pos[ 1 ];
        mat[ 14 ] = pos[ 2 ];
        this.needsUpdate = false;
        return this;
    },
    invalidate: function() {
        this.needsUpdate = true;
        return this;
    }
};
