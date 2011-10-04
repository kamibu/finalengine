var app = new Application();

app.camera.setPosition( new Vector3( [ 0, 5, 20 ] ) );

var spaceship = new Node();
window.spaceship = spaceship;
app.scene.appendChild( spaceship );

var orientation = spaceship.getOrientation(),
    base = new Quaternion( [ 0, 0, 0, 1 ] ),
    left = new Quaternion( [ 0, 0, 0.707, 0.707 ] ),
    right = new Quaternion( [ 0, 0, -0.707, 0.707 ] ),
    targetOrientation = base;

var yAngle = 0;

app.input.onKey( 'D', {
    callback: function() {
        targetOrientation = right;
        yAngle -= 0.01;
    },
    endCallback: function() {
        targetOrientation = base;
    },
    repeat: true
} );

app.input.onKey( 'A', {
    callback: function() {
        targetOrientation = left;
        yAngle += 0.01;
    },
    endCallback: function() {
        targetOrientation = base;
    },
    repeat: true
} );

var bullets = [];

app.input.onKey( 'SPACE', function() {
    var bl = new Sphere();
    bl.setPosition( new Vector3( [ 3, 0, 0 ] ) );
    bl.setScale( 0.5 );
    bl.combineWith( spaceship );
    bl.material.setParameter( 'Diffuse', new Vector3( [ 1, 1, 0 ] ) );
    bl.yAngle = yAngle;
    app.scene.appendChild( bl );

    var br = new Sphere();
    br.setPosition( new Vector3( [ -3, 0, 0 ] ) );
    br.setScale( 0.5 );
    br.combineWith( spaceship );
    br.material.setParameter( 'Diffuse', new Vector3( [ 1, 1, 0 ] ) );
    br.yAngle = yAngle;
    app.scene.appendChild( br );

    bullets.push( bl );
    bullets.push( br );
} );

app.update = function( dt ) {
    var turnSpeed = targetOrientation == base ? 1 : 1;
    var velocity = 0.5;
    var angle = orientation.getAxisAngle().data[ 2 ];
    yAngle = yAngle % 360;

    spaceship.setOrientation( orientation.slerp( targetOrientation, turnSpeed * dt / 1000 ) );
    spaceship.rotate( new Vector3( [ 0, 1, 0 ] ), yAngle );
    spaceship.move( new Vector3( [ -velocity * Math.sin( yAngle ), 0, -velocity * Math.cos( yAngle ) ] ) );

    for ( var i = 0; i < bullets.length; ++i ) {
        bullets[ i ].move( new Vector3( [ -1 * Math.sin( bullets[ i ].yAngle ), 0, -1 * Math.cos( bullets[ i ].yAngle ) ] ) );
    }
    // spaceship.move( new Vector3( [ velocity * Math.sin( angle ), 0, velocity ] ) );
};

function onModelLoad( spaceshipModel ) {
    spaceshipModel.rotate( new Vector3( [ 1, 0, 0 ] ), -Math.PI / 2 );
    spaceship.appendChild( spaceshipModel );
}

app.importer.load( 'spaceship.obj', onModelLoad );

// -----------------------------------------

/*
var app = new Application();
app.scene.appendChild( new Cube() );
*/

// ----------------------------------------

/*
new Application().importer.load( 'spaceship.obj' );
*/
