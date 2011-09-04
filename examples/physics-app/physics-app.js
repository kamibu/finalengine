var KeyboardDevice;

function PhysicsApp() {
    Application.call( this );
    var self = this;

    var getAngle = function( node ) {
        var a, c = node.orientation[ 3 ];
        if ( c < -1 ) {
            a = 2 * Math.PI;
        }
        else if ( c > 1 ) {
            a = 0;
        }
        else {
            a = Math.acos( c ) * 2;
        }
        if ( Math.abs( node.orientation[ 1 ] - 1 ) > 1 ) {
            a = 2 * Math.PI - a;
        }
        if ( isNaN( a ) ) {
            throw "NaN firstpersonhandler angle";
        }
        return a;
    };

    var wInterval, rInterval;
    window.move_forward = function() {
        console.log( 'move forward' );
        wInterval = setInterval( function() {
            var angle = getAngle( character );
            character.move( [ 0.1 * Math.sin( angle ), 0, 0.1 * Math.cos( angle ) ] );
        }, 30 );
    };

    window.rotateLeft = function() {
        console.log( 'rotate left called' );
        rInterval = setInterval( function() {
            character.rotate( [ 0, 1, 0 ], 0.1 );
        }, 30 );
    };

    window.rotateRight = function() {
        console.log( 'rotate right called' );
        rInterval = setInterval( function() {
            character.rotate( [ 0, 1, 0 ], -0.1 );
        }, 30 );
    };

    new Importer( 'resources' ).load( 'streets_Asphalt', function( material ) {
        var cube = new Cube();
        self.cube = cube;
        var img = new Image();
        img.src = 'resources/asphalt.png';
        material.setParameter( 'texture', new Texture().setImage( img ) );
        cube.setMaterial( material );
        self.scene.appendChild( cube );
        cube.setPosition( [ 0, 4, 0 ] );
    } );

    var system = new jigLib.PhysicsSystem.getInstance();
    system.setGravity( [ 0, -9.8, 0, 0 ] );
    system.setSolverType( 'ACCUMULATED' );

    var ground = new jigLib.JPlane( null, [ 0, 1, 0, 0 ] );
    ground.set_friction( 10 );
    system.addBody( ground );
    ground.moveTo( [ 0, -0, 0, 0 ] );

    var box = new jigLib.JBox( null, 1, 1, 1 );
    window.box = box;
    box.set_mass( 1 );
    box.set_friction( 10 );
    box.moveTo( [ 0, 4, 0, 0 ] );
    system.addBody( box );

    window.system = system;

    // var handler = new FirstPersonHandler( character );

    this.camera.setPosition( [ 0, 2, 15 ] );
}

PhysicsApp.prototype.onBeforeRender = function( elapsed ) {
    //console.log( elapsed );
    if ( this.cube ) {
        system.integrate( -elapsed / 75 / 10 );

        TempVars.lock();
        this.cube.setPosition( box.get_currentState().position );
        var m4 = TempVars.getMatrix4();
        m4.set( box.get_currentState().get_orientation().glmatrix );
        var q = TempVars.getQuaternion();
        q.fromMatrix3( m4.toMatrix3() );
        this.cube.setOrientation( q );
        TempVars.release();
    }
};

PhysicsApp.extend( Application );

var physicsApp = new PhysicsApp();
