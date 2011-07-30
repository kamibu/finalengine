function FrameBuffer( width, height ) {
    this.uid = Framebuffer.uid++;
    this.width = width || 256;
    this.height = height || 256;
    this.depthBuffer = null;
    this.colorBuffer = null;
}

Framebuffer.uid = 0;

Framebuffer.prototype = {
    setDimentions: function( width, height ) {
        this.width = width;
        this.height = height;
    }
};
