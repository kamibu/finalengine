// extern
var assertIn, UUID;

function Texture( type ) {
    this.uid = Texture.uid++;
    this.uuid = UUID();
    this.name = this.uuid;

    this.width = 1;
    this.height = 1;
    this.minFilter = Texture.LINEAR;
    this.maxFilter = Texture.LINEAR;
    this.type = type || Texture.IMAGE;

    this.wrapS = Texture.REPEAT;
    this.wrapT = Texture.REPEAT;

    this.origin = Texture.UPPER_LEFT_CORNER;

    this.source = null;

    this.needsUpdate = true;
}

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
    constructor: Texture,
    setName: function( name ) {
        this.name = name || 'Texture #' + this.uid;
        return this;
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
        return this;
    },
    setMaxFilter: function( filter ) {
        /*DEBUG*/
            assertIn( filter, Texture.NEAREST, Texture.LINEAR, 'Unsupported minification filtering. ' + filter  );
        /*DEBUG_END*/
        this.magFilter = filter;
        return this;
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
            return this;
        }
        this.source = source;
        this.setDimentions( this.source.width, this.source.height );
        this.needsUpdate = true;
        return this;
    },
    setDimentions: function( width, height ) {
        if ( this.width != width || this.height != height ) {
            this.width = width;
            this.height = height;
        }
        return this;
    },
    getExportData: function( exporter ) {
        return {
            width: this.width,
            height: this.height,
            minFilter: this.minFilter,
            maxFilter: this.maxFilter,
            type: this.type,
            wrapS: this.wrapS,
            wrapT: this.wrapT,
            origin: this.origin,
            source: this.source !== null ? this.source.src : null
        };
    },
    setImportData: function( importer, data ) {
        this.width = data.width;
        this.height = data.height;
        this.minFilter = data.minFilter;
        this.maxFilter = data.maxFilter;
        this.type = data.type;
        this.wrapS = data.wrapS;
        this.wrapT = data.wrapT;
        this.origin = data.origin;

        var img = new Image();
        img.src = data.source;
        this.setImage( img );

        return this;
    }
};
