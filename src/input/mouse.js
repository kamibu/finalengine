/**
 * @implements InputDevice
 * @constructor
 */
function Mouse() {
    this.down = {};

    this.prevX = 0;
    this.prevY = 0;

    this.actions = {};

    window.addEventListener( 'mousedown', Mouse.prototype.handleMouseDown.bind( this ), false );
    window.addEventListener( 'mouseup', Mouse.prototype.handleMouseUp.bind( this ), false );
    window.addEventListener( 'mousemove', Mouse.prototype.handleMouseMove.bind( this ), false );
    window.addEventListener( 'mousewheel', Mouse.prototype.handleMouseWheel.bind( this ), false );

    // firefox:
    window.addEventListener( 'DOMMouseScroll', Mouse.prototype.handleMouseWheel.bind( this ), false );
}

Mouse.prototype = {
    constructor: Mouse,
    handleMouseDown: function( e ) {
        var i, action, actions = this.actions[ e.button ], l;

        this.down[ e.button ] = true;

        if ( !actions ) {
            return;
        }

        this.addCustomEventData( e );
        l = actions.length;
        for ( i = 0; i < l; ++i ) {
            actions[ i ].callback( e );
        }
    },
    handleMouseUp: function( e ) {
        var i, action, actions = this.actions[ e.button ], l;

        this.down[ e.button ] = false;

        if ( !actions ) {
            return;
        }

        this.addCustomEventData( e );
        l = actions.length;
        for ( i = 0; i < l; ++i ) {
            actions[ i ].endCallback( e );
        }
    },
    handleMouseMove: function( e ) {
        var i, action, actions = this.actions[ Mouse.MOUSE_MOVE ], l;

        this.addCustomEventData( e );

        this.prevX = e.screenX;
        this.prevY = e.screenY;

        if ( !actions ) {
            return;
        }

        l = actions.length;
        for ( i = 0; i < l; ++i ) {
            actions[ i ].callback( e );
        }
    },
    handleMouseWheel: function( e ) {
        var i, action, actions = this.actions[ Mouse.MOUSE_WHEEL ], l;

        if ( !actions ) {
            return;
        }

        if ( e.detail ) { // firefox
            e.wheelDelta = -e.detail / 3;
        }

        this.addCustomEventData( e );

        l = actions.length;
        for ( i = 0; i < l; ++i ) {
            actions[ i ].callback( e );
        }
    },
    /**
     * @see InputDevice#addAction
     */
    addAction: function( eventId, action ) {
        if ( typeof action == 'function' ) {
            action = { callback: action };
        }
        if ( !this.actions[ eventId ] ) {
            this.actions[ eventId ] = [ action ];
        }
        else {
            this.actions[ eventId ].push( action );
        }
    },
    addCustomEventData: function( e ) {
        e.leftButton = !!this.down[ Mouse.BUTTON_LEFT ];
        e.middleButton = !!this.down[ Mouse.BUTTON_MIDDLE ];
        e.rightButton = !!this.down[ Mouse.BUTTON_RIGHT ];
        e.xDelta = e.screenX - this.prevX;
        e.yDelta = e.screenY - this.prevY;
    }
};

/** @static */
Mouse.BUTTON_LEFT = 0;
/** @static */
Mouse.BUTTON_MIDDLE = 1;
/** @static */
Mouse.BUTTON_RIGHT = 2;
/** @static */
Mouse.MOUSE_WHEEL = 3;
/** @static */
Mouse.MOUSE_MOVE = 4;
