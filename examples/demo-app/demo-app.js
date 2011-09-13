function DemoApp() {
    Application.call( this );
    var s = new Sphere( 1 );
    s.mesh.calculateNormals();
    s.material = new Material();
    s.material.vertexShader = 'uniform mat4 WorldViewProjectionMatrix; uniform mat4 WorldViewMatrix; attribute vec3 Position; attribute vec3 Normal; varying vec3 fragNormal; void main() { fragNormal = ( WorldViewMatrix * vec4( Normal, 0.0 ) ).xyz; gl_Position = WorldViewProjectionMatrix * vec4( Position, 1.0 ); }';
    s.material.fragmentShader = 'precision highp float; varying vec3 fragNormal; void main() { gl_FragColor = vec4( normalize( fragNormal ) * 0.5 + 0.5, 1.0 ); }';
    s.material.engineParameters = { WorldViewProjectionMatrix: true, WorldViewMatrix: true };
    this.scene.appendChild( s );
    setInterval( function() {
        s.rotate( [ 0, 1, 0 ], 0.01 );
    }, 17 );

}
DemoApp.extend( Application );

var demoApp = new DemoApp();
