var InputAction, Keyboard;

function InputHandler() {
    this.enabled = true;
    this.actions = [];
    this.devices = [];

    this.addDevice( new Keyboard() );
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
    console.log( 'adding action', action );
    
    // keep callback reference
    var cbk = action.callback || function() {};
    action.callback = function( e ) {
        console.log( 'got callback' );
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
    return this.addAction( this.devices.keyboard, this[ 'KEY_' + key ], action );
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

    var keyboardDevice = this.devices.keyboard;
    return this.addAction( keyboardDevice, this[ 'KEY_' + key ], action );
};

InputHandler.prototype.addDevice = function( device ) {
    var eventIds = device.getEventIds();

    this.devices[ device.getName() ] = device;

    for ( var i in eventIds ) {
        this[ i ] = eventIds[ i ];
    }

    return this;
};

InputHandler.prototype.removeDevice = function( device ) {
    var eventIds = device.getEventIds();

    for ( var i in eventIds ) {
        delete this[ i ];
    }

    delete this.devices[ device.getName() ];

    return this;
};
