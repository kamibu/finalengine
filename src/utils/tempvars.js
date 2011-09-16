/*global Matrix4: true, Quaternion; true, Vector3: true, Matrix3: true */

/** @class
 *
 * TempVars are preinstantiated objects that can be used for temporary results,
 * to avoid the performance costs of instantiating new objects in javascript.
 */
var TempVars = {
    /** 
     * Make sure the tempvars used are not overwritten.
     * Call lock on every method before getting any tempvars.
     */
    lock: function() {
        this.vector3ReleasePoints.push( this.vector3Counter );
        this.matrix4ReleasePoints.push( this.matrix4Counter );
        this.matrix3ReleasePoints.push( this.matrix3Counter );
        this.quaternionReleasePoints.push( this.quaternionCounter );
    },
    /** 
     * Allow locked tempvars to be overwritten again. 
     * Call release after a method is done using its tempvars.
     */
    release: function() {
        this.vector3Counter = this.vector3ReleasePoints.pop();
        this.matrix4Counter = this.matrix4ReleasePoints.pop();
        this.matrix3Counter = this.matrix3ReleasePoints.pop();
        this.quaternionCounter = this.quaternionReleasePoints.pop();
    },
    vector3ReleasePoints: [],
    vector3Counter: 0,
    vector3Stack: [],
    /** @public */
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
    /** @public */
    getMatrix4: function() {
        var ret = this.matrix4Stack[ this.matrix4Counter++ ];
        if ( !ret ) {
            ret = this.matrix4Stack[ this.matrix4Counter - 1 ] = new Matrix4();
        }
        return ret;
    },

    matrix3ReleasePoints: [],
    matrix3Counter: 0,
    matrix3Stack: [],
    /** @public */
    getMatrix3: function() {
        var ret = this.matrix3Stack[ this.matrix3Counter++ ];
        if ( !ret ) {
            ret = this.matrix3Stack[ this.matrix3Counter - 1 ] = new Matrix3();
        }
        return ret;
    },

    quaternionReleasePoints: [],
    quaternionCounter: 0,
    quaternionStack: [],
    /** @public */
    getQuaternion: function() {
        var ret = this.quaternionStack[ this.quaternionCounter++ ];
        if ( !ret ) {
            ret = this.quaternionStack[ this.quaternionCounter - 1 ] = new Quaternion();
        }
        return ret;
    }
};
