/*global Keyboard: true, Mouse: true*/

/**
 * @class
 * Handling of input devices and grouping of input actions.
 *
 * <p>It has a keyboard and a mouse device attached by default for convenience.</p>
 * @constructor
 */
function InputHandler() {
    /**
     * Whether actions should be triggered or not
     * @default true
     * @type Boolean
     */
    this.enabled = true;

    this.actions = [];
    this.devices = [];

    this.keyboard = new Keyboard();
    this.addDevice( this.keyboard );

    this.mouse = new Mouse();
    this.addDevice( this.mouse );
}

/**
 * @public
 * Enable handling of input events. This way, input handlers can be used for enabling groups of input events.
 */
InputHandler.prototype.enable = function() {
    var i, l = this.actions.length;
    for ( i = 0; i < l; ++i ) {
        this.actions[ i ].enable();
    }

    this.enabled = true;
};

/**
 * @public
 * Disable handling of input events. This way, input handlers can be used for disabling groups of input events.
 */
InputHandler.prototype.disable = function() {
    var i, l = this.actions.length;
    for ( i = 0; i < l; ++i ) {
        this.actions[ i ].disable();
    }

    this.enabled = false;
};

/**
 * @public
 * Returns a boolean indicating if this input handler is enabled.
 * @returns boolean
 */
InputHandler.prototype.isEnabled = function() {
    return this.enabled;
};

/**
 * @param {InputDevice} device
 * @param {number} eventId
 * @param {Object} action An object describing the action to be called.
 * @see InputDevice#addAction
 */
InputHandler.prototype.addAction = function( device, eventId, action ) {
    var self = this;

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

/**
 * Register a keypress.
 * @param {String} key The key name e.g. 'A' or 'ESCAPE'.
 * @param {Object} action
 * @see Keyboard
 */
InputHandler.prototype.onKey = function( key, action ) {
    if ( typeof action != "object" ) {
        action = { callback: action };
    }
    if ( Array.isArray( key ) ) {
        for ( var i in key ) {
            // create copies of objects to avoid multiple references
            var act = {};
            for ( var j in action ) {
                act[ j ] = action[ j ];
            }
            this.onKey( key[ i ], act );
        }
        return;
    }
    return this.addAction( this.keyboard, Keyboard[ 'KEY_' + key ], action );
};

/**
 * Register a keyup.
 * @param {String} key The key name e.g. 'A' or 'ESCAPE'.
 * @param {Object} action
 * @see Keyboard
 */
InputHandler.prototype.onKeyUp = function( key, action ) {
    if ( typeof action != "object" ) {
        action = { callback: function() {}, endCallback: action };
    }
    if ( Array.isArray( key ) ) {
        for ( var i in key ) {
            var act = {};
            for ( var j in action ) {
                act[ j ] = action[ j ];
            }
            this.onKeyUp( key[ i ], act );
        }
        return;
    }

    return this.addAction( this.keyboard, Keyboard[ 'KEY_' + key ], action );
};

/**
 * Register mousemove
 * @see Mouse
 */
InputHandler.prototype.onMouseMove = function( action ) {
    this.addAction( this.mouse, Mouse.MOUSE_MOVE, action );
};

/**
 * Register mousewheel movement
 * @see Mouse
 */
InputHandler.prototype.onMouseWheel = function( action ) {
    this.addAction( this.mouse, Mouse.MOUSE_WHEEL, action );
};

/**
 * Add device.
 */
InputHandler.prototype.addDevice = function( device ) {
    if ( this.devices.indexOf( device ) != -1 ) {
        throw "Device name already in use";
    }

    this.devices.push( device );

    return this;
};

/**
 * Remove devices.
 */
InputHandler.prototype.removeDevice = function( device ) {
    this.devices.splice( this.devices.indexOf( device ), 1 );
    return this;
};
