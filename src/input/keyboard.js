function Keyboard( name ) {
    this.name = name || "keyboard";
    this.actions = {};
    this.keyData = {};
    this.REPEAT_INTERVAL = 200;
    this.pressed = {};

    window.addEventListener( 'keydown', this.handleKeyDown.bind( this ) );
    window.addEventListener( 'keyup', this.handleKeyUp.bind( this ) );
    document.addEventListener( 'mouseout', this.handleMouseOut.bind( this ), false );
}

Keyboard.prototype = {
    getName: function() {
        return this.name;
    },
    getEventIds: function() {
        return this.keys;
    },
    getKeyData: function( keyCode ) {
        if ( !this.keyData[ keyCode ] ) {
            this.keyData[ keyCode ] = {};
        }
        return this.keyData[ keyCode ];
    },
    keys: {
        'KEY_LEFT_ARROW': 37,
        'KEY_UP_ARROW': 38,
        'KEY_RIGHT_ARROW': 39,
        'KEY_DOWN_ARROW': 40,
        'KEY_SPACE': 32,
        'KEY_ENTER': 13,
        'KEY_ESCAPE': 27
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
        keyData.upCallback = setTimeout( function() {
            self.checkAutoRepeat( e );
        }, 1000 );
    },
    handleKeyUp: function( e ) {
        var actions = this.actions[ e.keyCode ], keyData = this.getKeyData( e.keyCode );
        if ( !actions || !keyData.upCallback ) {
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
        for ( var i in this.keyPressed ) {
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

( function() {
    for ( var i = 65; i < 91; i++ ) {
        var c = String.fromCharCode( i );
        Keyboard.prototype.keys[ 'KEY_' + c ] = i;
    }
}() );
