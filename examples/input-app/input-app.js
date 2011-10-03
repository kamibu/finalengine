var KeyboardDevice;

function InputApp() {
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
            character.rotate( new Vector3( [ 0, 1, 0 ] ), -0.1 );
        }, 30 );
    };

    new OBJLoader().loadOBJ( 'woman/Woman_Low.obj', function( node ) {
        console.log( 'Loaded' );
        window.character = node;
        self.scene.appendChild( character.setScale( 0.2 ) );
        // character.setOrientation( new Quaternion( [ 0, 1, 0, 0 ] ) );
        character.name = 'woman_Low';

        /*
        var keyboard = self.input.devices.keyboard;
        window.keyboard = keyboard;
        keyboard.addAction( keyboard.keys.KEY_W, { callback: move_forward, endCallback: function() { console.log( 'end callback!' ); clearInterval( wInterval ); } } );
        keyboard.addAction( keyboard.keys.KEY_A, { callback: rotateLeft, endCallback: function() { clearInterval( rInterval ); } } );
        keyboard.addAction( keyboard.keys.KEY_D, { callback: rotateRight, endCallback: function() { clearInterval( rInterval ); } } );
    
        // you can also use self.input directly
        keyboard.addAction( keyboard.keys.KEY_ESCAPE, function() {
            console.log( 'escaping' ); 
        } );
        */

        //var handler = new FirstPersonHandler( character );
    } );

    this.camera.setPosition( new Vector3( [ 0, 2, 4 ] ) );
}
InputApp.extend( Application );

var inputApp = new InputApp();
