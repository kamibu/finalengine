/**
 * @interface
 * Interface for input devices.
 */
function InputDevice() {
}

/**
 * addAction should register an action for an event.
 * @param {number} eventId An identifier for the event. This should be a constant defined by the implemented device class.
 * @param {Object} action An object that defines what action should be done when the event occurs. The action has a callback property, and may have an endCallback property. Custom devices may use other properties too for configuration.
 */
InputDevice.prototype.addAction = function( eventId, action ) {
};
