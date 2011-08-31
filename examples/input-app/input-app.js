var KeyboardDevice;

function InputApp() {
    Application.call( this );
    var self = this;

    var walkInterval;

    window.move_forward = function() {
        if ( walkInterval ) {
            return;
        }
        walkInterval = setInterval( function() {
            character.move( [ 0, 0, -0.1 ] );
        }, 17 );
    };

    window.stop_moving = function() {
        clearInterval( walkInterval );
        walkInterval = 0;
    };

    new OBJLoader().loadOBJ( 'woman/Woman_Low.obj', function( node ) {
        console.log( 'Loaded' );
        window.character = node;
        self.scene.add( character.setScale( 0.2 ) );
        character.setOrientation( [ 0, 1, 0, 0 ] );
        character.name = 'woman_Low';

        // group input actions with inputhandler
        var userInput = new InputHandler();
        userInput.onKey( 'W', move_forward );
        userInput.onKeyUp( [ 'W', 'A', 'S', 'D' ], stop_moving );

        // you can also use self.input directly
        self.input.onKey( 'ESCAPE', function() { 
            console.log( 'escaping' ); 
            userInput.isEnabled() ? userInput.disable() : userInput.enable();
         } );
    } );

    this.camera.setPosition( [ 0, 2, 4 ] );
}
InputApp.extend( Application );

var inputApp = new InputApp();
