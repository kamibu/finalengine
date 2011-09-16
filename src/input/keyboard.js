/**
 * @class
 * @extends InputDevice
 */
function Keyboard() {
    this.actions = {};
    this.keyData = {};
    this.pressed = {};

    window.addEventListener( 'keydown', this.handleKeyDown.bind( this ) );
    window.addEventListener( 'keyup', this.handleKeyUp.bind( this ) );
    document.addEventListener( 'mouseout', this.handleMouseOut.bind( this ), false );
}
Keyboard.prototype = {
    getKeyData: function( keyCode ) {
        if ( !this.keyData[ keyCode ] ) {
            this.keyData[ keyCode ] = {};
        }
        return this.keyData[ keyCode ];
    },
    setPressed: function( key ) {
        if ( this.pressed[ key ] ) {
            return;
        }
        var keyData;
        for ( var k in this.pressed ) { // clear other keyup intervals
            if ( k == key ) {
                continue;
            }
            keyData = this.getKeyData( k );
            clearInterval( keyData.upInterval );
            keyData.upInterval = 0;
        }
        this.pressed[ key ] = true;
    },
    unsetPressed: function( key ) {
        if ( !this.pressed[ key ] ) {
            return;
        }
        delete this.pressed[ key ];
    },
    handleKeyDown: function( e ) {
        var self = this,
            actions = this.actions[ e.keyCode ],
            keyData;

        if ( !actions || !actions.length ) {
            return;
        }

        keyData = this.getKeyData( e.keyCode );
        keyData.lastPress = Date.now();
        
        if ( this.pressed[ e.keyCode ] ) {
            // we are checking repetition
            return;
        }
        
        var hasEndCallback = false;
        
        // call associated actions
        actions.forEach( function( action ) {
            action.callback( e );

            if ( action.endCallback ) {
                hasEndCallback = true;
            }
        } );

        // no need to do autorepeat checks if no endcallback
        if ( !hasEndCallback ) {
            return;
        }

        // we believe it is an autorepeat until we get a keyup
        this.setPressed( e.keyCode );
        
        // auto-repeat takes half a second to start (on chrome for linux at least..)
        /*
        keyData.upCallback = setTimeout( function() {
            self.checkAutoRepeat( e );
        }, 1000 );
        */
    },
    handleKeyUp: function( e ) {
        var actions = this.actions[ e.keyCode ], keyData = this.getKeyData( e.keyCode );
        if ( !actions ) {
            return;
        }

        // console.log( 'clearing upinterval' );

        if ( keyData.upInterval ) {
            clearInterval( keyData.upInterval );
        }

        actions.forEach( function( action ) {
            if ( action.endCallback ) {
                action.endCallback( e );
            }
        } );

        // clear intervals and set to 0 so that we know we can set them again
        clearInterval( keyData.upInterval );
        keyData.upInterval = 0;

        clearTimeout( keyData.upCallback );
        keyData.upCallback = 0;

        this.unsetPressed( e.keyCode );
    },
    /**
     * @see InputDevice#addAction
     */
    addAction: function ( key, options ) {
        if ( typeof options == "function" ) {
            options = { callback: options };
        }
        var action = {
            callback: options.callback || function() {},
            endCallback: options.endCallback || null
        };
        if ( !this.actions[ key ] ) {
            this.actions[ key ] = [ action ];
        }
        else {
            this.actions[ key ].push( action );
        }
    },
    // for when mouse gets out of window, extra fix
    // (the upInterval does not work when two keys are pressed)
    handleMouseOut: function( e ) {
        var from = e.relatedTarget || e.toElement;
        if ( from && from.nodeName != 'HTML' ) {
            return;
        }
        // console.log( 'left window, clearing all keydowns' );
        for ( var i in this.pressed ) {
            this.handleKeyUp( { keyCode: i } );
        }
    },
    checkAutoRepeat: function( e ) {
        var keyData = this.getKeyData( e.keyCode ),
            self = this;

        if ( !this.pressed[ e.keyCode ] ) {
            // we got a keyup within a second, no keyboard repeat
            return;
        }

        // now check every little time if we get any keydowns from autorepeat
        keyData.upInterval = setInterval( function() {
            if ( Date.now() - keyData.lastPress < self.REPEAT_INTERVAL ) {
                // got a keydown not so long ago, dont send keyup
                return;
            }

            // did not get any keydown, call keyup
            self.handleKeyUp( e );
        }, 100 );
    }
};

Keyboard.extends( InputDevice );

/**#@+
 * @type Array
 */

/**
 * @public
 */
Keyboard.foo = function() {
};
/**
 * @private
 */
Keyboard.baz = function() {
};
/**#@-*/

Keyboard.KEY_UP_ARROW = 38;
Keyboard.KEY_RIGHT_ARROW = 39;
Keyboard.KEY_DOWN_ARROW = 40;
Keyboard.KEY_SPACE = 32;
Keyboard.KEY_ENTER = 13;
Keyboard.KEY_ESCAPE = 27;
Keyboard.KEY_A = 65;
Keyboard.KEY_B = 66;
Keyboard.KEY_C = 67;
Keyboard.KEY_D = 68;
Keyboard.KEY_E = 69;
Keyboard.KEY_F = 70;
Keyboard.KEY_G = 71;
Keyboard.KEY_H = 72;
Keyboard.KEY_I = 73;
Keyboard.KEY_J = 74;
Keyboard.KEY_K = 75;
Keyboard.KEY_L = 76;
Keyboard.KEY_M = 77;
Keyboard.KEY_N = 78;
Keyboard.KEY_O = 79;
Keyboard.KEY_P = 80;
Keyboard.KEY_Q = 81;
Keyboard.KEY_R = 82;
Keyboard.KEY_S = 83;
Keyboard.KEY_T = 84;
Keyboard.KEY_U = 85;
Keyboard.KEY_V = 86;
Keyboard.KEY_W = 87;
Keyboard.KEY_X = 88;
Keyboard.KEY_Y = 89;
Keyboard.KEY_Z = 90;
