/*global InputDevice:true */

/**
 * @implements InputDevice
 *
 * @constructor
 */
function Keyboard() {
    this.actions = {};
    this.keyData = {};
    this.pressed = {};

    window.addEventListener( 'keydown', Keyboard.prototype.handleKeyDown.bind( this ), false );
    window.addEventListener( 'keyup', Keyboard.prototype.handleKeyUp.bind( this ), false );
    document.addEventListener( 'mouseout', Keyboard.prototype.handleMouseOut.bind( this ), false );
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
            console.log( 'calling action' );
            action.callback( e );

            if ( action.endCallback ) {
                hasEndCallback = true;
            }

            if ( action.repeat ) {
                console.log( 'setting repeat interval' );
                action.repeatInterval = setInterval( action.callback, action.speed );
                console.log( action.repeatInterval );
            }
        } );

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
        console.log( 'key up ' + e.keyCode );
        var actions = this.actions[ e.keyCode ], keyData = this.getKeyData( e.keyCode );
        if ( !actions ) {
            console.log( 'no actions' );
            return;
        }

        // console.log( 'clearing upinterval' );

        if ( keyData.upInterval ) {
            clearInterval( keyData.upInterval );
        }

        actions.forEach( function( action ) {
            if ( action.endCallback ) {
                console.log( 'calling end callback' );
                action.endCallback( e );
            }
            if ( action.repeatInterval ) {
                console.log( 'clearing interval' );
                clearInterval( action.repeatInterval );
                action.repeatInterval = false;
            }
        } );

        // clear intervals and set to 0 so that we know we can set them again
        clearInterval( keyData.upInterval );
        keyData.upInterval = 0;

        clearTimeout( keyData.upCallback );
        keyData.upCallback = 0;

        console.log( 'unsetting' );
        this.unsetPressed( e.keyCode );
    },
    /**
     * @see InputDevice#addAction
     */
    addAction: function ( key, options ) {
        if ( typeof options == "function" ) {
            options = { callback: options };
        }
        if ( typeof options.repeat == "undefined" ) {
            options.repeat = true;
        }
        var action = {
            callback: options.callback || function() {},
            endCallback: options.endCallback || null,
            repeat: options.repeat,
            speed: options.speed || 10
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

Keyboard.extend( InputDevice );

/** @static */
Keyboard.KEY_LEFT_ARROW = 37;
/** @static */
Keyboard.KEY_UP_ARROW = 38;
/** @static */
Keyboard.KEY_RIGHT_ARROW = 39;
/** @static */
Keyboard.KEY_DOWN_ARROW = 40;
/** @static */
Keyboard.KEY_SPACE = 32;
/** @static */
Keyboard.KEY_ENTER = 13;
/** @static */
Keyboard.KEY_ESCAPE = 27;
/** @static */
Keyboard.KEY_A = 65;
/** @static */
Keyboard.KEY_B = 66;
/** @static */
Keyboard.KEY_C = 67;
/** @static */
Keyboard.KEY_D = 68;
/** @static */
Keyboard.KEY_E = 69;
/** @static */
Keyboard.KEY_F = 70;
/** @static */
Keyboard.KEY_G = 71;
/** @static */
Keyboard.KEY_H = 72;
/** @static */
Keyboard.KEY_I = 73;
/** @static */
Keyboard.KEY_J = 74;
/** @static */
Keyboard.KEY_K = 75;
/** @static */
Keyboard.KEY_L = 76;
/** @static */
Keyboard.KEY_M = 77;
/** @static */
Keyboard.KEY_N = 78;
/** @static */
Keyboard.KEY_O = 79;
/** @static */
Keyboard.KEY_P = 80;
/** @static */
Keyboard.KEY_Q = 81;
/** @static */
Keyboard.KEY_R = 82;
/** @static */
Keyboard.KEY_S = 83;
/** @static */
Keyboard.KEY_T = 84;
/** @static */
Keyboard.KEY_U = 85;
/** @static */
Keyboard.KEY_V = 86;
/** @static */
Keyboard.KEY_W = 87;
/** @static */
Keyboard.KEY_X = 88;
/** @static */
Keyboard.KEY_Y = 89;
/** @static */
Keyboard.KEY_Z = 90;
