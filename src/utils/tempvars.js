/*Allocate some typed arrays in order to be used
  for temporary results. Creating new typed arrays
  in Javascript is slow but using them is faster
  than native arrays.
*/
var TempVars = {
    lock: function() {
        this.vector3ReleasePoints.push( this.vector3Counter );
        this.matrix4ReleasePoints.push( this.matrix4Counter );
        this.quaternionReleasePoints.push( this.quaternionCounter );
    },
    release: function() {
        this.vector3Counter = this.vector3ReleasePoints.pop();
        this.matrix4Counter = this.matrix4ReleasePoints.pop();
        this.quaternionCounter = this.quaternionReleasePoints.pop();
    },

    vector3ReleasePoints: [],
    vector3Counter: 0,
    vector3Stack: [],
    getVector3: function() {
        var ret = this.vector3Stack[ this.vector3Counter++ ];
        if ( !ret ) {
            ret = this.vector3Stack[ this.vector3Counter - 1 ] = new Vector3();
        }
        return ret;
    },

    matrix4ReleasePoints: [],
    matrix4Counter: 0,
    matrix4Stack: [],
    getMatrix4: function() {
        var ret = this.matrix4Stack[ this.matrix4Counter++ ];
        if ( !ret ) {
            ret = this.matrix4Stack[ this.matrix4Counter - 1 ] = new Matrix4();
        }
        return ret;
    },

    quaternionReleasePoints: [],
    quaternionCounter: 0,
    quaternionStack: [],
    getQuaternion: function() {
        var ret = this.quaternionStack[ this.quaternionCounter++ ];
        if ( !ret ) {
            ret = this.quaternionStack[ this.quaternionCounter - 1 ] = new Quaternion();
        }
        return ret;
    }
};
