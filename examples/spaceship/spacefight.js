var app = new Application();
app.setTitle( 'SpaceFight 3D' );
app.camera.setPosition( new Vector3( [ 0, 5, 20 ] ) );

var spaceship = new Spaceship( 'spaceship.obj', app.importer, app.input );
app.scene.appendChild( spaceship );

app.update = function( dt ) {
    spaceship.update( dt );
};
