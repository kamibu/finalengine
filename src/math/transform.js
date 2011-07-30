function Transform() {
    this.position = Vector3();
    this.orientation = Quaternion();
    this.scale = 1;
    this.invalidate();
    this.matrix = Matrix4();
}

Transform.prototype = {
    set: function( transform ) {
        this.position.set( transform.position );
        this.orientation.set( transform.orientation );
        this.scale = transform.scale;
        this.invalidate();
        return this;
    },
    setPosition: function( position ) {
        this.position.set( position );
        this.invalidate();
        return this;
    },
    setOrientation: function( orientation ) {
        this.orientation.set( orientation );
        this.invalidate();
        return this;
    },
    setScale: function( scale ) {
        this.scale = scale;
        this.invalidate();
        return this;
    },
    getPosition: function( dest ) {
        if ( !dest ) {
            dest = Vector3();
        }
        return dest.set( this.position );
    },
    getOrientation: function( dest ) {
        if ( !dest ) {
            dest = Quaternion();
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
        this.invalidate();
        return this;
    },
    combineWith: function( transform ) {
        TempVars.lock();
        this.scale *= transform.scale;

        var p = this.orientation.multiplyVec3( transform.getPosition( TempVars.getVector3() ) );
        p.scale( this.scale );
        this.position.add( p );
        this.orientation.multiply( transform.orientation );
        this.invalidate();
        
        TempVars.release();
        return this;
    },
    getMatrix: function( dest ) {
        if ( !dest ) {
            dest = Matrix4();
        }
        if ( this.needsUpdate  ) {
            this.update();
        }
        return dest.set( this.matrix );
    },
    getInverseMatrix: function( dest ) {
        if ( !dest ) {
            dest = Matrix4();
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
    },
    invalidate: function() {
        this.needsUpdate = true;
    }
};
