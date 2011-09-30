/*global Matrix4: true, Node: true*/

/**
 * @class
 *
 * Basic camera class.
 *
 * Add a camera to a {@link Scene} to render with this camera.
 * The Application scene has a camera added by default.
 */
function Camera() {
    Node.call( this );

    /**
     * @public
     * @default 1
     */
    this.width = 1;

    /**
     * @public
     * @default 1
     */
    this.height = 1;

    /**
     * @public
     * @default 1
     */
    this.ratio = 1;

    /**
     * @public
     * @default 0.1
     */
    this.zNear = 0.1;

    /**
     * @public
     * @default 1000
     */
    this.zFar = 1000;

    /**
     * @public
     * @default 55
     */
    this.fieldOfView = 55;

    this.tanFieldOfView = Math.tan( ( this.fieldOfView / 2 ) * ( Math.PI / 180 ) );
    this.cosFieldOfView = Math.cos( ( this.fieldOfView / 2 ) * ( Math.PI / 180 ) );
    this.horizontalTanFieldOfView = this.tanFieldOfView;
    this.horizontalCosFieldOfview = Math.cos( Math.atan( this.tanFieldOfView ) );

    this.projectionMatrix = new Matrix4();
    this.setPerspective();
}

Camera.prototype = {
    constructor: Camera,

    /**
     * Updates perspective projection matrix based on the camera properties.
     */
    setPerspective: function () {
        Matrix4.perspective( this.fieldOfView, this.width / this.height, this.zNear, this.zFar, this.projectionMatrix );
        this.ratio = this.width / this.height;
        this.horizCosFOV = Math.cos( Math.atan( this.tanFOV * this.ratio ) );
        this.horizTanFOV = this.tanFOV * this.ratio;
    }
};

Camera.extend( Node );
