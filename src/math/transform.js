// extern
var Matrix4, Quaternion, TempVars, Vector3;

/*
 * Represents a transformation in 3d space (position, orientation, scale)
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
    setPosition: function( position ) {
        this.position.set( position );
        return this.invalidate();
    },
    setOrientation: function( orientation ) {
        this.orientation.set( orientation );
        return this.invalidate();
    },
    setScale: function( scale ) {
        this.scale = scale;
        return this.invalidate();
    },
    getPosition: function( dest ) {
        if ( !dest ) {
            dest = new Vector3();
        }
        return dest.set( this.position );
    },
    getOrientation: function( dest ) {
        if ( !dest ) {
            dest = new Quaternion();
        }
        return dest.set( this.orientation );
    },
    getScale: function() {
        return this.scale;
    },
    setIdentity: function() {
        this.position.set( [ 0, 0, 0 ] );
        this.orientation.set( [ 0, 0, 0, 1 ] );
        this.scale = 1;
        return this.invalidate();
    },
    combineWith: function( transform ) {
        TempVars.lock();
        this.scale *= transform.scale;
        transform.orientation.multiplyVector3( this.position ).scale( transform.scale ).add( transform.position );
        this.orientation.preMultiply( transform.orientation );
        TempVars.release();

        return this.invalidate();
    },
    getMatrix: function( dest ) {
        if ( !dest ) {
            dest = new Matrix4();
        }
        if ( this.needsUpdate ) {
            this.update();
        }
        return dest.set( this.matrix );
    },
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
