var Texture = function( type ) {
    /*DEBUG*/
        assertIn( type, Texture.IMAGE, Texture.CUBEMAP, 'Illegal value. type must be TEXTURE_2D or TEXTURE_CUBEMAP' );
    /*DEBUG_END*/
    this.id = Texture.uid++;
    this.name = 'Texture #' + this.id;
    this.width = 1;
    this.height = 1;
    this.minFilter = Texture.LINEAR_MIPMAP_LINEAR;
    this.maxFilter = Texture.LINEAR;

    this.wrapS = Texture.REPEAT;
    this.wrapT = Texture.REPEAT;

    this.origin = Texture.UPPER_LEFT_CORNER;

    this.source = null;

    this.needsUpdate = true;
};

Texture.uid = 0;
Texture.IMAGE = 1;
Texture.CUBEMAP = 2;

Texture.NEAREST = 1;
Texture.LINEAR = 2;

Texture.NEAREST_MIPMAP_NEAREST = 3;
Texture.LINEAR_MIPMAP_NEAREST = 4;

Texture.NEAREST_MIPMAP_LINEAR = 5;
Texture.LINEAR_MIPMAP_LINEAR = 6;

Texture.REPEAT = 1;
Texture.MIRROR_REPEAT = 2;
Texture.CLAMP_TO_EDGE = 3;

Texture.LOWER_LEFT_CORNER = 1;
Texture.UPPER_LEFT_CORNER = 2;

Texture.prototype = {
    setName: function( name ) {
        this.name = name || 'Texture #' + this.id;
    },
    setMinFilter: function( filter ) {
        /*DEBUG*/
            assertIn( filter, Texture.NEAREST, 
                              Texture.LINEAR, 
                              Texture.NEAREST_MIPMAP_NEAREST, 
                              Texture.NEAREST_MIPMAP_LINEAR, 
                              Texture.LINEAR_MIPMAP_NEAREST, 
                              Texture.LINEAR_MIPMAP_LINEAR, 
                              'Unsupported minification filtering. ' + filter 
            );
        /*DEBUG_END*/
        this.minFilter = filter;
    },
    setMaxFilter: function( filter ) {
        /*DEBUG*/
            assertIn( filter, Texture.NEAREST, Texture.LINEAR, 'Unsupported minification filtering. ' + filter  );
        /*DEBUG_END*/
        this.magFilter = filter;
    },
    setImage: function( source ) {
        /*DEBUG*/
            assertIn( source.constructor, Image, HTMLImageElement, HTMLCanvasElement, HTMLVideoElement, 'Unsupported type of source' );
        /*DEBUG_END*/
        /*TODO Race condition: A non loaded image is set to the texture, then an other loaded image is set.
               Then the previous pending callback must be canceled and only the most recent call should be
               valid.
        */
        if ( ( source.constructor == HTMLImageElement || source.constructor == Image ) && !source.complete ) {
            source.onload = this.setImage.bind( this, source );
            return;
        }
        this.source = source;
        this.setDimentions( this.source.width, this.source.height );
        this.needsUpdate = true;
    },
    setDimentions: function( width, height ) {
        if ( this.width != width || this.height != height ) {
            this.width = width;
            this.height = height;
        }
    }
};
