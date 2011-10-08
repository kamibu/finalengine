/*global
    EventEmitter : false
*/

/**
 * @constructor
 * @extends EventEmitter
 */
function EventWaiter() {
    this._waitingList = [];
    EventEmitter.call( this );
}

EventWaiter.prototype = {
    constructor: EventWaiter,
    isWaiting: function() {
        return this._waitingList.length;
    },
	wait: function( obj, name, title ) {
        this.waitMore( title );
        var that = this;
        obj.once( name, function() {
            that.waitLess( title );
        } );
    },
	waitTimed: function( obj, name, time, title ) {
        this.waitMore( title );
        var that = this;
        var timeout = setTimeout( function() {
            that.waitLess( title );
        }, time );
        obj.once( name, function() {
            setTimeout( function() {
                that.waitLess( title );
                clearTimeout( timeout );
            }, 0 ); // be sure other callbacks are called first
        } );
    },
	callback: function( title ) {
        this.waitMore( title );
        var that = this;
        return function() {
            that.waitLess( title );
        };
    },
	waitMore: function( title ) {
        title = title || "";
        this._waitingList.push( title );
    },
	waitLess: function( title ) {
        var i = this._waitingList.indexOf( title );
        this._waitingList.splice( i, 1 );
        this.emit( 'one', title );
        if ( !this._waitingList.length ) {
            this.emit( 'complete' );
        }
    },
	isComplete: function() {
        return !!this._waitingList.length;
    },
	getWaitingList: function() {
        return this._waitingList;
    }
};

EventWaiter.extend( EventEmitter );
