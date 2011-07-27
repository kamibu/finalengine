attribute vec3 Position;
attribute vec3 Normal;
//attribute vec2 UVCoord;

//varying vec4 position;
//varying vec4 projectedPosition;
varying vec3 N;

uniform mat4 WorldViewProjectionMatrix;
//uniform mat4 WorldViewMatrix;

void main() {
//	position = g_WorldViewMatrix * vec4( inPosition, 1.0 );
    N = Normal;
    gl_Position = WorldViewProjectionMatrix * vec4( Position, 1.0 );
//    UVCoord = inUVCoord;
//    
//    mat3 foo = mat3( g_WorldViewMatrix[ 0 ].xyz, g_WorldViewMatrix[ 1 ].xyz, g_WorldViewMatrix[ 2 ].xyz );
//    N = foo * inNormal;
}
