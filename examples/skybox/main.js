var app = new Application();

var skybox = new Skybox( [ 
    'resources/powerlines/posx.jpg',
    'resources/powerlines/negx.jpg',
    'resources/powerlines/posy.jpg',
    'resources/powerlines/negy.jpg',
    'resources/powerlines/posz.jpg',
    'resources/powerlines/negz.jpg',
] );

app.scene.appendChild( skybox );

var yaw = 0, pitch = 0;

app.input.onKey( 'UP_ARROW', function() {
    pitch += 0.01;
} );

app.input.onKey( 'DOWN_ARROW', function() { 
    pitch -= 0.01;
} );

app.input.onKey( 'RIGHT_ARROW', function() { 
    console.log( 'right' );
    yaw -= 0.01;
} );

app.input.onKey( 'LEFT_ARROW', function() { 
    yaw += 0.01;
} );

app.update = function( dt ) {
    app.camera.rotateToEuler( yaw, pitch, 0 );
};
