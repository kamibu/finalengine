function EventWaiter() {
    this._waitingList = [];
}

EventWaiter.prototype.isWaiting = function() {
    return this._waitingList.length;
};

EventWaiter.prototype.wait = function( obj, name, title ) {
    this.waitMore( title );
    var that = this;
    obj.once( name, function() {
        that.waitLess( title );
    } );
};

EventWaiter.prototype.waitTimed = function( obj, name, time, title ) {
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
};

EventWaiter.prototype.callback = function( title ) {
    this.waitMore( title );
    var that = this;
    return function() {
        that.waitLess( title );
    };
};

EventWaiter.prototype.waitMore = function( title ) {
    title = title || "";
    this._waitingList.push( title );
};

EventWaiter.prototype.waitLess = function( title ) {
    var i = this._waitingList.indexOf( title );
    this._waitingList.splice( i, 1 );
    this.emit( 'one', title );
    if ( !this._waitingList.length ) {
        this.emit( 'complete' );
    }
};

EventWaiter.prototype.isComplete = function() {
    return !!this._waitingList.length;
};

EventWaiter.prototype.getWaitingList = function() {
    return this._waitingList;
};

EventWaiter.extend( EventEmitter );
