var InputAction, KeyboardDevice;

function InputHandler() {
    this.enabled = true;
    this.actions = [];
    this.devices = [];

    this.addDevice( new KeyboardDevice() );
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
    this.actions.push( action );
    device.addAction( eventId, action );
    return action;
};

/* sugar functions */

InputHandler.prototype.on = function( device, eventId, callback, speed ) {
    return this.addAction( device, eventId, new InputAction( callback, speed ) );
};

InputHandler.prototype.onKey = function( key, callback, speed ) {
    speed = speed || 100;
    if ( Array.isArray( key ) ) {
        for ( var i in key ) {
            this.onKey( key[ i ], callback, speed );
        }
        return;
    }

    var keyboardDevice = this.devices.keyboard;
    return this.on( keyboardDevice, this[ 'KEY_' + key ], callback, speed );
};

InputHandler.prototype.onKeyUp = function( key, callback, speed ) {
    if ( Array.isArray( key ) ) {
        for ( var i in key ) {
            this.onKeyUp( key[ i ], callback, speed );
        }
        return;
    }

    var keyboardDevice = this.devices.keyboard,
        eventId = this[ 'KEY_' + key ],
        action = new InputAction( function() {}, speed );

    action.setEndCallback( callback );
    return this.addAction( keyboardDevice, eventId, action );
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
