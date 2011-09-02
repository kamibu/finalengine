function InputAction( callback, speed ) {
    this.callback = this.createCallback( callback ) || function() {};
    this.endCallback = function() {};
    this.speed = speed || 100;
    this.eventId = null;
    this.enabled = true;
}

InputAction.prototype.enable = function() {
    this.enabled = true;
};

InputAction.prototype.disable = function() {
    this.enabled = false;
};

InputAction.prototype.isEnabled = function() {
    return this.enabled;
};

InputAction.prototype.setCallback = function( callback ) {
    this.callback = this.createCallback( callback );
};

InputAction.prototype.getCallback = function() {
    return this.callback;
};

InputAction.prototype.getIntervalCallback = function() {
    var self = this;
    return function() {
        console.log( 'interval callback' );
        self.callback();
    };
};

InputAction.prototype.perform = function() {
    this.callback.apply( this, arguments );
};

InputAction.prototype.performEnd = function() {
    this.endCallback.apply( this, arguments );
};

InputAction.prototype.setEndCallback = function( endCallback ) {
    this.endCallback = this.createCallback( endCallback );
};

InputAction.prototype.getEndCallback = function() {
    return this.endCallback;
};

InputAction.prototype.createCallback = function( callback ) {
    var self = this;
    return function() {
        if ( self.isEnabled() ) {
            callback.apply( window, arguments );
        }
    };
};

InputAction.prototype.setSpeed = function( speed ) {
    this.speed = speed;
    return this;
};

InputAction.prototype.getSpeed = function() {
    return this.speed;
};

InputAction.prototype.setEventId = function( eventId ) {
    this.eventId = eventId;
    return this;
};

InputAction.prototype.getEventId = function() {
    return this.eventId;
};
