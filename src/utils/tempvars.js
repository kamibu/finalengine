/*Allocate some typed arrays in order to be used
  for temporary results. Creating new typed arrays
  in Javascript is slow but using them is faster
  than native arrays.
*/
var TempVars = {
    mat4a: Matrix4(),
    mat4b: Matrix4(),
    mat4c: Matrix4(),
    mat4d: Matrix4(),

//    mat3a: Matrix3(),
//    mat3b: Matrix3(),
//    mat3c: Matrix3(),

    vec3a: Vector3(),
    vec3b: Vector3(),
    vec3c: Vector3(),

    quat4a: Quaternion(),
    quat4b: Quaternion(),
    quat4c: Quaternion()
};
