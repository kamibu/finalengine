/* see node.js EventEmitter */
function EventEmitter() {
    this._events_ = [];
    this.on = function( name, action ) {
        if ( !( name in this._events_ ) ) {
            this._events_[ name ] = [];
        }
        this._events_[ name ].push( action );
    };
    this.once = function( name, action ) {
        action.once = true;
        this.on( name, action );
    };
    this.clearListeners = function( name ) {
        this._events_[ name ] = [];
    };
    this.emit = function( name ) {
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
    };
    this.removeListener = function( name, callback ) {
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
    };
}

function EventWaiter() {
    var numWaiting = 0;
    this.waitMore = function() {
        ++numWaiting;
    };
    this.waitLess = function( description ) {
        --numWaiting;
        this.emit( 'emit', description );
        if ( !numWaiting ) {
            this.emit( 'complete' );
        }
    };
    this.wait = function( obj, name, description, progressevent ) {
        this.waitMore();
        var that = this;
        obj.once( name, function() {
            that.waitLess( description );
        } ); 
        if ( progressevent ) {
            obj.on( progressevent, function( percentage ) {
                that.emit( 'emit', description + ' ' + percentage * 100 + '%' );
            } );
        }
    };
    this.waitFor = function( obj, name, time ) {
        time = time || 1000;
        this.waitMore();
        var that = this;
        var timeout = setTimeout( function() {
            that.waitLess();
        }, time );
        obj.once( name, function() {
            setTimeout( function() {
                that.waitLess();
                clearTimeout( timeout );
            }, 0 ); // be sure other callbacks are called first
        } );
    };
    this.waitWithTimeout = function( obj, name, timeoutCallback ) {
        this.waitMore();
        var that = this;
        var timeout = setTimeout( function() {
            timeoutCallback();
            that.waitLess();
        }, 1000 );
        obj.once( name, function() {
            setTimeout( function() {
                that.waitLess();
                clearTimeout( timeout );
            }, 0 ); // be sure other callbacks are called first
        } );
    };
    this.isWaiting = function() {
        return numWaiting > 0;
    };
    this.numWaiting = function() {
        return numWaiting;
    };
}
EventWaiter.extend( EventEmitter );

function EventChain() {
    var chain = [];
    var running = false;
    this.autostart = true;
    this.push = function( f ) {
        if ( f instanceof EventChain ) {
            chain.push( function( callback ) {
                f.once( 'complete', callback );
                f.start();
            } );
        }
        else {
            chain.push( f );
        }
        if ( !running && this.autostart ) {
            this.next();
        }
    };
    this.next = function() {
        var that = this;
        if ( !chain.length ) {
            setTimeout( function() {
                that.emit( 'complete' );
            }, 0 );
            running = false;
            return false;
        }
        running = true;
        ( chain.shift( arguments ) )( function() {
            that.emit( 'one' );
            that.next.apply( that, arguments );
        } );
    };
    this.start = function() {
        this.next();
    };
    this.isRunning = function() {
        return running;
    };
}
EventChain.extend( EventEmitter );
