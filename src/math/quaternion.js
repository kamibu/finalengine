/*jshint sub:true */
function Quaternion( data ) {
    /* Float32Array does not implement call method in chrome.
     * __proto__ hacking to the resque
     */
    if ( Float32Array.call ) {
        Float32Array.call( this, 4 );
        this[ 3 ] = 1;

        if ( data ) {
            this.set( data );
        }
    }
    else {
        var ret = new Float32Array( 4 );
        ret[ 3 ] = 1;

        ret[ '__proto__' ]  = Quaternion.prototype;
        if ( data ) {
            ret.set( data );
        }
        return ret;
    }
}

Quaternion.prototype = {
    constructor: Quaternion,
    set: function( data ) {
        this[ 0 ] = data[ 0 ];
        this[ 1 ] = data[ 1 ];
        this[ 2 ] = data[ 2 ];
        this[ 3 ] = data[ 3 ];
        return this;
    },
    setTo: function( dest ) {
        dest[ 0 ] = this[ 0 ];
        dest[ 1 ] = this[ 1 ];
        dest[ 2 ] = this[ 2 ];
        dest[ 3 ] = this[ 3 ];
        return dest;
    },
    setEuler: function( yaw, pitch, roll ) {
        yaw *= 0.5;
        pitch *= 0.5;
        roll *= 0.5;
        var cos = Math.cos;
        var sin = Math.sin;
        var cosYaw = cos( yaw );
        var sinYaw = sin( yaw );
        var cosPitch = cos( pitch );
        var sinPitch = sin( pitch );
        var cosRoll = cos( roll );
        var sinRoll = sin( roll );
        this[ 0 ] = cosRoll * sinPitch * cosYaw + sinRoll * cosPitch * sinYaw;
        this[ 1 ] = cosRoll * cosPitch * sinYaw - sinRoll * sinPitch * cosYaw;
        this[ 2 ] = sinRoll * cosPitch * cosYaw - cosRoll * sinPitch * sinYaw;
        this[ 3 ] = cosRoll * cosPitch * cosYaw + sinRoll * sinPitch * sinYaw;
        return this;
    },
    setAxisAngle: function( axis, angle ) {
        TempVars.lock();
        var a = TempVars.getVector3();
        a.set( axis ).normalize().scale( Math.sin( angle / 2 ) );
        this[ 0 ] = a[ 0 ];
        this[ 1 ] = a[ 1 ];
        this[ 2 ] = a[ 2 ];
        this[ 3 ] = Math.cos( angle / 2 );
        TempVars.release();
        return this;
    },
    inverse: function() {
        this[ 0 ] = -this[ 0 ];
        this[ 1 ] = -this[ 1 ];
        this[ 2 ] = -this[ 2 ];
        return this;
    },
    multiply: function( quaternion ) {
        var qax = this[ 0 ], qay = this[ 1 ], qaz = this[ 2 ], qaw = this[ 3 ];
        var qbx = quaternion[ 0 ], qby = quaternion[ 1 ], qbz = quaternion[ 2 ], qbw = quaternion[ 3 ];
         
        this[ 0 ] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
        this[ 1 ] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
        this[ 2 ] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
        this[ 3 ] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
        
        return this;
    },
    multiplyVector3: function( vector ) {
        var x = vector[ 0 ], y = vector[ 1 ], z = vector[ 2 ];
        var qx = this[ 0 ], qy = this[ 1 ], qz = this[ 2 ], qw = this[ 3 ];

        // calculate this * vector
        var ix = qw * x + qy * z - qz * y;
        var iy = qw * y + qz * x - qx * z;
        var iz = qw * z + qx * y - qy * x;
        var iw = -qx * x - qy * y - qz * z;
        
        // calculate result * inverse this
        vector[ 0 ] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        vector[ 1 ] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        vector[ 2 ] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
        
        return vector;
    },
    toMatrix4: function( dest ) {
        if ( !dest ) {
            dest = new Matrix4();
        }
        var x = this[ 0 ], y = this[ 1 ], z = this[ 2 ], w = this[ 3 ];

        var x2 = x + x;
        var y2 = y + y;
        var z2 = z + z;

        var xx = x * x2;
        var xy = x * y2;
        var xz = x * z2;

        var yy = y * y2;
        var yz = y * z2;
        var zz = z * z2;

        var wx = w * x2;
        var wy = w * y2;
        var wz = w * z2;

        dest[ 0 ] = 1 - ( yy + zz );
        dest[ 1 ] = xy - wz;
        dest[ 2 ] = xz + wy;
        dest[ 3 ] = 0;

        dest[ 4 ] = xy + wz;
        dest[ 5 ] = 1 - ( xx + zz );
        dest[ 6 ] = yz - wx;
        dest[ 7 ] = 0;

        dest[ 8 ] = xz - wy;
        dest[ 9 ] = yz + wx;
        dest[ 10 ] = 1 - ( xx + yy );
        dest[ 11 ] = 0;

        dest[ 12 ] = 0;
        dest[ 13 ] = 0;
        dest[ 14 ] = 0;
        dest[ 15 ] = 1;

        return dest;
    },
    clone: function() {
        return new this.constructor( this );
    }
};

Quaternion.extend( Float32Array );
