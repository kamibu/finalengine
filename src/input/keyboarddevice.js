function KeyboardDevice( name ) {
    this.name = name || "keyboard";
    this.keyPressed = [];
    this.actions = {};
    this.keyPressCount = 0;
    this.keyPress = {};

    var self = this;
    window.addEventListener( 'keydown', function( e ) {
        var actions = self.actions[ e.keyCode ], i, l, action, keypress;

        if ( !actions ) {
            return;
        }
        
        l = actions.length;
        if ( !l ) {
            return;
        }

        if ( !self.keyPress[ e.keyCode ] ) {
            keypress = self.keyPress[ e.keyCode ] = {};
        }
        else {
            keypress = self.keyPress[ e.keyCode ];
        }
        if ( self.keyPressed[ e.keyCode ] ) {
            return;
        }
        keypress.lastPress = Date.now();

        
        for ( i = 0; i < l; ++i ) {
            action = actions[ i ];

            action.perform( e );

            if ( !action.getEndCallback() ) {
                continue;
            }

            action.callInterval = setInterval( action.getCallback(), action.getSpeed() );
        }

        self.setPressed( e.keyCode );

        // auto-repeat takes half a second to start (on chrome for linux at least..)
        keypress.upCallback = setTimeout( function() {
            // check if no keyup was sent within a second
            if ( !self.keyPressed[ e.keyCode ] ) {
                return;
            }

            // now check every little time if we got more keydowns from autorepeat
            keypress.upInterval = setInterval( function() {
                for ( var i = 0; i < l; ++i ) {
                    action = actions[ i ];
                    if ( Date.now() - keypress.lastPress < action.getSpeed() ) {
                        // got a keydown not so long ago, dont send keyup
                        continue;
                    }

                    // did not get any keydown, call keyup
                    action.performEnd( e );
                }
            }, 100 );
        }, 500 );
    } );

    window.addEventListener( 'keyup', this.handleKeyUp.bind( this ) );

    // for when mouse gets out of window, extra fix
    // (the upInterval does not work when two keys are pressed)
    document.addEventListener( 'mouseout', function( e ) {
        var from = e.relatedTarget || e.toElement;
        if ( from && from.nodeName != 'HTML' ) {
            return;
        }
        // console.log( 'left window, clearing all keydowns' );
        for ( var i in self.keyPressed ) {
            self.handleKeyUp( { keyCode: i } );
        }
    }, false );
}

KeyboardDevice.prototype = {
    getName: function() {
        return this.name;
    },
    getEventIds: function() {
        return this.keys;
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
        if ( this.keyPressed[ key ] ) {
            return;
        }
        ++this.keyPressCount;
        for ( var k in this.keyPressed ) { // clear other keyup intervals
            if ( k == key ) {
                continue;
            }
            clearInterval( this.keyPress[ k ].upInterval );
            this.keyPress[ k ].upInterval = 0;
        }
        this.keyPressed[ key ] = true;
    },
    unsetPressed: function( key ) {
        if ( !this.keyPressed[ key ] ) {
            return;
        }
        --this.keyPressCount;
        delete this.keyPressed[ key ];
    },
    handleKeyUp: function( e ) {
        var actions = this.actions[ e.keyCode ], l, i, action;
        if ( !actions ) {
            return;
        }

        if ( !( this.keyPress[ e.keyCode ] && this.keyPress[ e.keyCode ].upCallback ) ) {
            return;
        }

        if ( this.keyPress[ e.keyCode ].upInterval ) {
            clearInterval( this.keyPress[ e.keyCode ].upInterval );
        }

        l = actions.length;
        for ( i = 0; i < l; ++i ) {
            action = actions[ i ];
            if ( action.callInterval ) {
                clearInterval( action.callInterval );
            }
            action.performEnd();
        }

        // clear intervals and set to 0 so that we know we can set them again

        this.unsetPressed( e.keyCode );
    },
    addAction: function ( key, action ) {
        if ( !this.actions[ key ] ) {
            this.actions[ key ] = [ action ];
        }
        else {
            this.actions[ key ].push( action );
        }
    },
    /*
    onKeyUp: function( key, upCallback ) {
        if ( Array.isArray( key ) ) {
            for ( var i in key ) {
                this.onKeyUp( key[ i ], upCallback );
            }
            return;
        }
        if ( !this.actions[ key ] ) {
            console.log( 'no callback for' + key );
            this.actions[ key ] = { callback: function() {}, upCallback: upCallback, speed: 100, key: key };
        }
        else {
            console.log( 'updating action ' + key );
            this.actions[ key ].upCallback = upCallback;
        }
    },
    */
    remove: function( key ) {
        delete handlers[ key ];
    }
};

( function() {
    for ( var i = 65; i < 91; i++ ) {
        var c = String.fromCharCode( i );
        KeyboardDevice.prototype.keys[ 'KEY_' + c ] = i;
    }
}() );
