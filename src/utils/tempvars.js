/*global
    Matrix4      :  false,
    Quaternion   :  false,
    Vector3      :  false,
    Matrix3      :  false
*/

/**
 * @constructor
 *
 * TempVars are preinstantiated objects that can be used for temporary results;
 * to avoid the performance costs of instantiating new objects in javascript.
 */
function TempVars() {
}

/**
 * Make sure the tempvars used are not overwritten.
 * Call lock on every method before getting any tempvars.
 */
TempVars.lock = function() {
    TempVars.vector3ReleasePoints.push( TempVars.vector3Counter );
    TempVars.matrix4ReleasePoints.push( TempVars.matrix4Counter );
    TempVars.matrix3ReleasePoints.push( TempVars.matrix3Counter );
    TempVars.quaternionReleasePoints.push( TempVars.quaternionCounter );
};

/**
 * Allow locked tempvars to be overwritten again.
 * Call release after a method is done using its tempvars.
 */
TempVars.release = function() {
    TempVars.vector3Counter = TempVars.vector3ReleasePoints.pop();
    TempVars.matrix4Counter = TempVars.matrix4ReleasePoints.pop();
    TempVars.matrix3Counter = TempVars.matrix3ReleasePoints.pop();
    TempVars.quaternionCounter = TempVars.quaternionReleasePoints.pop();
};

TempVars.vector3ReleasePoints = [];
TempVars.vector3Counter = 0;
TempVars.vector3Stack = [];

/** @public */
TempVars.getVector3 = function() {
    var ret = TempVars.vector3Stack[ TempVars.vector3Counter++ ];
    if ( !ret ) {
        ret = TempVars.vector3Stack[ TempVars.vector3Counter - 1 ] = new Vector3();
    }
    return ret;
};

TempVars.matrix4ReleasePoints = [];
TempVars.matrix4Counter = 0;
TempVars.matrix4Stack = [];

/** @public */
TempVars.getMatrix4 = function() {
    var ret = TempVars.matrix4Stack[ TempVars.matrix4Counter++ ];
    if ( !ret ) {
        ret = TempVars.matrix4Stack[ TempVars.matrix4Counter - 1 ] = new Matrix4();
    }
    return ret;
};

TempVars.matrix3ReleasePoints = [];
TempVars.matrix3Counter = 0;
TempVars.matrix3Stack = [];

/** @public */
TempVars.getMatrix3 = function() {
    var ret = TempVars.matrix3Stack[ TempVars.matrix3Counter++ ];
    if ( !ret ) {
        ret = TempVars.matrix3Stack[ TempVars.matrix3Counter - 1 ] = new Matrix3();
    }
    return ret;
};

TempVars.quaternionReleasePoints = [];
TempVars.quaternionCounter = 0;
TempVars.quaternionStack = [];

/** @public */
TempVars.getQuaternion = function() {
    var ret = TempVars.quaternionStack[ TempVars.quaternionCounter++ ];
    if ( !ret ) {
        ret = TempVars.quaternionStack[ TempVars.quaternionCounter - 1 ] = new Quaternion();
    }
    return ret;
};
