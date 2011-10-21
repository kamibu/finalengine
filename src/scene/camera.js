/*global
    Matrix4    : false,
    SceneNode  : false
*/

/**
 * @class
 * Basic camera class.
 *
 * Add a camera to a {@link Scene} to render with this camera.
 * The Application scene has a camera added by default.
 *
 * @constructor
 * @extends SceneNode
 */
function Camera() {
    SceneNode.call( this );

    /**
     * @public
     * @type Number
     * @default 1
     */
    this.width = 1;

    /**
     * @public
     * @type Number
     * @default 1
     */
    this.height = 1;

    /**
     * @public
     * @type Number
     * @default 1
     */
    this.ratio = 1;

    /**
     * @public
     * @type Number
     * @default 0.1
     */
    this.zNear = 0.1;

    /**
     * @public
     * @type Number
     * @default 1000
     */
    this.zFar = 1000;

    /**
     * @public
     * @type Number
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
     * @public
     * <p>Updates perspective projection matrix based on the camera properties.</p>
     * <p>Call this method if you manually change properties.</p>
     */
    setPerspective: function () {
        Matrix4.perspective( this.fieldOfView, this.width / this.height, this.zNear, this.zFar, this.projectionMatrix );
        this.ratio = this.width / this.height;
        this.horizontalCosFielfOfView = Math.cos( Math.atan( this.tanFieldOfView * this.ratio ) );
        this.horizontalTanFieldOfView = this.tanFieldOfView * this.ratio;
    },
    /**
     * @param {Number} zNear
     */
    setZNear: function( zNear ) {
        this.zNear = zNear;
        this.setPerspective();
    },
    /**
     * @param {Number} zFar
     */
    setZFar: function( zFar ) {
        this.zFar = zFar;
        this.setPerspective();
    },
    /**
     * @param {Number} fieldOfView
     */
    setFieldOfView: function( fieldOfView ) {
        this.fieldOfView = fieldOfView;
        this.setPerspective();
    }
};

Camera.extend( SceneNode );
