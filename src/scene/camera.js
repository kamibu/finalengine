function Camera() {
    Node.call( this );

    this.width = 1;
    this.height = 1;
    this.ratio = 1;
    this.zNear = 0.1;
    this.zFar = 1000;

    this.fieldOfView = 55;
    this.tanFieldOfView = Math.tan( ( this.fieldOfView / 2 ) * ( Math.PI / 180 ) );
    this.cosFieldOfView = Math.cos( ( this.fieldOfView / 2 ) * ( Math.PI / 180 ) );
    this.horizontalTanFieldOfView = this.tanFieldOfView;
    this.horizontalCosFieldOfview = Math.cos( Math.atan( this.tanFieldOfView ) );

    this.projectionMatrix = Matrix4();
}
 
Camera.prototype = {
    constructor: Camera,
    setPerspective: function () {
        this.projectionMatrix.perspective( this.FOV, this.w / this.h, this.zNear, this.zFar );
        this.ratio = this.w / this.h;
        this.horizCosFOV = Math.cos( Math.atan( this.tanFOV * this.ratio ) );
        this.horizTanFOV = this.tanFOV * this.ratio;
    }
};

Camera.extend( Node );
