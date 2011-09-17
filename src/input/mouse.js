function Mouse() {
    this.down = {};

    this.prevX = 0;
    this.prevY = 0;

    this.actions = {};

    window.addEventListener( 'mousedown', this.handleMouseDown.bind( this ) );
    window.addEventListener( 'mouseup', this.handleMouseUp.bind( this ) );
    window.addEventListener( 'mousemove', this.handleMouseMove.bind( this ) );
    window.addEventListener( 'mousewheel', this.handleMouseWheel.bind( this ) );

    // firefox:
    window.addEventListener( 'DOMMouseScroll', this.handleMouseWheel.bind( this ) );
}

Mouse.prototype = {
    constructor: Mouse,
    getName: function() {
        return "mouse";
    },
    handleMouseDown: function( e ) {
        console.log( 'got mouse down' );
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
        console.log( 'got mouse up' );
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

Mouse.BUTTON_LEFT = 0;
Mouse.BUTTON_MIDDLE = 1;
Mouse.BUTTON_RIGHT = 2;
Mouse.MOUSE_WHEEL = 3;
Mouse.MOUSE_MOVE = 4;
