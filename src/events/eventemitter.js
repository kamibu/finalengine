/**
 * @constructor
 * Abstract class for objects that fire events.
 *
 * Similar API to the node.js EventEmitter.
 */
function EventEmitter() {
    this._events_ = [];
}

EventEmitter.prototype = {
    constructor: EventEmitter,
    /**
     * Register listener to an event.
     * @param {string} name The name of the event.
     * @param {Function} action
     */
    on: function( name, action ) {
        if ( !( name in this._events_ ) ) {
            this._events_[ name ] = [];
        }
        this._events_[ name ].push( action );
    },
    /**
     * Like {@link EventEmitter.on} but callback is called only the first time.
     * @param {string} name The name of the event
     * @param {Function} action
     * @see EventEmitter.on
     */
    once: function( name, action ) {
        action.once = true;
        this.on( name, action );
    },
    /**
     * Remove all listeners registered to an event.
     * @param {string} name The event name.
     */
    clearListeners: function( name ) {
        this._events_[ name ] = [];
    },
    /**
     * Fires an event.
     *
     * Calls all listeners registered for this event.
     * @param {string} name The event name.
     */
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
    /**
     * Remove a specific listener from an event.
     * @param {string} name The event name.
     * @param {Function} callback
     */
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
