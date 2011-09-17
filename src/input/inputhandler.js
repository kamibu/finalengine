var InputAction, Keyboard, Mouse;

function InputHandler() {
    this.enabled = true;
    this.actions = [];
    this.devices = [];

    this.addDevice( new Keyboard() );
    this.addDevice( new Mouse() );
}

InputHandler.prototype.enable = function() {
    var i, l = this.actions.length;
    for ( i = 0; i < l; ++i ) {
        this.actions[ i ].enable();
    }

    this.enabled = true;
};

InputHandler.prototype.disable = function() {
    var i, l = this.actions.length;
    for ( i = 0; i < l; ++i ) {
        this.actions[ i ].disable();
    }

    this.enabled = false;
};

InputHandler.prototype.isEnabled = function() {
    return this.enabled;
};

InputHandler.prototype.addAction = function( device, eventId, action ) {
    var self = this;
    
    // keep callback reference
    var cbk = action.callback || function() {};
    action.callback = function( e ) {
        if ( self.enabled ) {
            cbk( e );
        }
    };

    this.actions.push( action );
    device.addAction( eventId, action );
    return action;
};

/* sugar functions */

InputHandler.prototype.onKey = function( key, action ) {
    if ( typeof action != "object" ) {
        action = { callback: action };
    }
    if ( Array.isArray( key ) ) {
        for ( var i in key ) {
            // create copies of objects to avoid multiple references
            this.onKey( key[ i ], { callback: action.callback } );
        }
        return;
    }
    return this.addAction( this.keyboard, Keyboard[ 'KEY_' + key ], action );
};

InputHandler.prototype.onKeyUp = function( key, action ) {
    if ( typeof action != "object" ) {
        action = { callback: function() {}, endCallback: action };
    }
    if ( Array.isArray( key ) ) {
        for ( var i in key ) {
            this.onKeyUp( key[ i ], { endCallback: action.endCallback } );
        }
        return;
    }

    var keyboardDevice = this.keyboard;
    return this.addAction( keyboardDevice, Keyboard[ 'KEY_' + key ], action );
};

InputHandler.prototype.onMouseMove = function( action ) {
    this.addAction( this.mouse, Mouse.MOUSE_MOVE, action );
};

InputHandler.prototype.onMouseWheel = function( action ) {
    this.addAction( this.mouse, Mouse.MOUSE_WHEEL, action );
};

InputHandler.prototype.addDevice = function( device ) {
    if ( this[ device.getName() ] ) {
        throw "Device name already in use";
    }

    this[ device.getName() ] = device;

    return this;
};

InputHandler.prototype.removeDevice = function( device ) {
    delete this[ device.getName() ];
    return this;
};
