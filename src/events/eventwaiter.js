/*global
    EventEmitter : false
*/

/**
 * @class
 *
 * Handle waiting a group of events to finish.
 *
 * Consider the case that you need two wait for all the files to finish loading:
 * <code>
 * loader.load( 'file1', callback );
 * loader.load( 'file2', callback );
 </code>
 *
 * You can use the EventWaiter to call a function when all files have finished loading.
 * <code>
 * var w = new EventWaiter();
 * loader.load( 'file1', w.callback() );
 * loader.load( 'file2', w.callback() );
 * w.on( 'complete', function() {
 *     console.log( 'finished loading' );
 * } );
 </code>
 * @constructor
 * @extends EventEmitter
 */
function EventWaiter() {
    this._waitingList = [];
    EventEmitter.call( this );
}

EventWaiter.prototype = {
    constructor: EventWaiter,
    /*
     * Check if the events have finished.
     */
    isWaiting: function() {
        return this._waitingList.length;
    },
    /**
     * Wait for an EventEmitter to fire an event.
     * @param {EventEmitter} emitter
     * @param {String} event
     */
	wait: function( emitter, name, title ) {
        this.waitMore( title );
        var that = this;
        emitter.once( name, function() {
            that.waitLess( title );
        } );
    },
    /**
     * Wait for a limited time.
     * @param {EventEmitter} emitter
     * @param {String} event
     * @param {Number} time
     * @param {String} title
     */
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
    /**
     * Create a callback that will wait to be called.
     * @param {String} title
     */
	callback: function( callback ) {
        this.waitMore();
        var that = this;
        return function() {
            callback.apply( arguments );
            that.waitLess();
        };
    },
    /**
     * @param {String} title
     */
	waitMore: function( title ) {
        title = title || "";
        this._waitingList.push( title );
    },
    /*
     * @param {String} title
     */
	waitLess: function( title ) {
        title = title || "";
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
