var app = new Application();
app.setTitle( 'SpaceFight 3D' );
app.camera.setPosition( new Vector3( [ 0, 5, 20 ] ) );

var spaceship = new Spaceship();
app.scene.appendChild( spaceship );

app.input.onKey( 'RIGHT_ARROW',{
    callback: function() {
        spaceship.targetRoll = -45;
    },
    endCallback: function() {
        spaceship.targetRoll = 0; 
    }
} );

app.input.onKey( 'LEFT_ARROW', {
    callback: function() {
        spaceship.targetRoll = 45;
    },
    endCallback: function() {
        spaceship.targetRoll = 0;
    }
} );

app.input.onKey( 'SPACE', function() {
    spaceship.shoot();
} );

app.importer.load( 'spaceship.obj', function( model ) {
    model.rotate( new Vector3( [ 1, 0, 0 ] ), -Math.PI / 2 ); // fix orientation
    spaceship.appendChild( model );
} );

app.update = function( dt ) {
    spaceship.update( dt );
};
