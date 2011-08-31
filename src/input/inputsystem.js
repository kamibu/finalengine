function InputSystem() {
    this.devices = [];
}

InputSystem.prototype.addDevice = function( device ) {
    var eventIds = device.getEventIds();

    this[ 'DEVICE_' + device.getName() ] = device;

    for ( var i in eventIds ) {
        this[ i ] = eventIds[ i ];
    }

    return this;
};

InputSystem.prototype.removeDevice = function( device ) {
    var eventIds = device.getEventIds();
    for ( var i in eventIds ) {
        this[ i ] = eventIds[ i ];
    }

    delete this[ 'DEVICE_' + device.getName() ];

    return this;
};
