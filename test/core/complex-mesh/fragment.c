precision highp float;

varying vec3 N;

uniform vec3 Color;

void main(){
	vec3 normal = normalize( N );
	vec3 L = normalize( vec3( 0, 0, -1 ) );
	float diffuse = max( dot( -normal, L ), 0.0 );
	
	vec3 diffuseResult = diffuse * Color;

    gl_FragColor = vec4( vec3( 0.1, 0.1, 0.1 ) + 0.9 * diffuseResult, 1.0 );
    gl_FragColor = vec4( 0.5 * N + 0.5, 1.0 );
}
