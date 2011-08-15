function EventEmitter() {
    this._events_ = [];
}

EventEmitter.prototype = {
    constructor: EventEmitter,
    on: function( name, action ) {
        if ( !( name in this._events_ ) ) {
            this._events_[ name ] = [];
        }
        this._events_[ name ].push( action );
    },
    once: function( name, action ) {
        action.once = true;
        this.on( name, action );
    },
    clearListeners: function( name ) {
        this._events_[ name ] = [];
    },
    emit: function( name ) {
        var params = Array.prototype.slice.call( arguments, 1 );
        var events = this._events_[ name ];
        if ( !events ) {
            return;
        }
        // do not change to loop based on length
        // because some indexes of the array are undefined
        // due to the splice on removeListener
        for ( var i in events ) {
            var action = events[ i ];
            action.apply( this, params );
            if ( action.once ) {
                events.splice( i, 1 );
                if ( !events.length ) {
                    break;
                }
                --i;
            }
        }
    },
    removeListener: function( name, callback ) {
        if ( !this._events_[ name ] ) {
            return false;
        }
        var actionlist = this._events_[ name ];
        for ( var i = 0, l = actionlist.length; i < l; i++ ) {
            if ( actionlist[ i ] === callback ) {
                actionlist.splice( i, 1 );
                return true;
            }
        }
        return false;
    }
};
