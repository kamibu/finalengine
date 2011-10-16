/*global
    assertIn : false,
    UUID     : false
*/

/**
 * @constructor
 * @param {number=} type The type of the texture to create (optional)
 */
function Texture( type ) {
    this.uid = Texture.uid++;
    this.uuid = UUID.generateCanonicalForm();
    this.name = this.uuid;

    this.width = 1;
    this.height = 1;
    this.minFilter = Texture.LINEAR;
    this.magFilter = Texture.LINEAR;
    this.type = type || Texture.IMAGE;

    this.setRepeat( true );

    this.format = Texture.RGB;

    this.dataType = Texture.UNSIGNED_BYTE;

    this.origin = Texture.UPPER_LEFT_CORNER;

    this.source = null;

    this.needsUpdate = true;
}

Texture.uid = 0;

/** @const */
Texture.IMAGE = 1;
/** @const */
Texture.CUBEMAP = 2;

/** @const */
Texture.NEAREST = 1;
/** @const */
Texture.LINEAR = 2;

/** @const */
Texture.NEAREST_MIPMAP_NEAREST = 3;
/** @const */
Texture.LINEAR_MIPMAP_NEAREST = 4;

/** @const */
Texture.NEAREST_MIPMAP_LINEAR = 5;
/** @const */
Texture.LINEAR_MIPMAP_LINEAR = 6;

/** @const */
Texture.REPEAT = 1;
/** @const */
Texture.MIRROR_REPEAT = 2;
/** @const */
Texture.CLAMP_TO_EDGE = 3;

/** @const */
Texture.LOWER_LEFT_CORNER = 1;
/** @const */
Texture.UPPER_LEFT_CORNER = 2;

/** @const */
Texture.RGB = 1;
/** @const */
Texture.RGBA = 2;

/** @const */
Texture.UNSIGNED_BYTE = 1;
/** @const */
Texture.FLOAT = 2;

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
    setMagFilter: function( filter ) {
        /*DEBUG*/
            assertIn( filter, Texture.NEAREST, Texture.LINEAR, 'Unsupported minification filtering. ' + filter  );
        /*DEBUG_END*/
        this.magFilter = filter;
        return this;
    },
    setRepeat: function( setting ) {
        if ( setting ) {
            this.setWrapS( Texture.REPEAT );
            this.setWrapT( Texture.REPEAT );
        }
        else {
            this.setWrapS( Texture.CLAMP_TO_EDGE );
            this.setWrapT( Texture.CLAMP_TO_EDGE );
        }
    },
    setWrapS: function( wrap ) {
        /*DEBUG*/
            assertIn( wrap, Texture.REPEAT, Texture.MIRROR_REPEAT, Texture.CLAMP_TO_EDGE, 'Unsupported wrapping. ' + wrap );
        /*DEBUG_END*/
        this.wrapS = wrap;
        return this;
            
    },
    setWrapT: function( wrap ) {
        /*DEBUG*/
            assertIn( wrap, Texture.REPEAT, Texture.MIRROR_REPEAT, Texture.CLAMP_TO_EDGE, 'Unsupported wrapping. ' + wrap  );
        /*DEBUG_END*/
        this.wrapT = wrap;
        return this;
    },
    setFormat: function( format ) {
        /*DEBUG*/
            assertIn( format, Texture.RGB, Texture.RGBA, 'Unsupported format. ' + format );
        /*DEBUG_END*/
        this.format = format;
        return this;
    },
    setDataType: function( dataType ) {
        /*DEBUG*/
            assertIn( dataType, Texture.UNSIGNED_BYTE, Texture.FLOAT, 'Unsupported format. ' + dataType );
        /*DEBUG_END*/
        this.dataType = dataType;
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
            source.addEventListener( 'load',this.setImage.bind( this, source ) );
            return this;
        }
        this.source = source;
        this.setDimentions( this.source.width, this.source.height );
        if ( !source.width.isPowerOfTwo() || !source.height.isPowerOfTwo() ) {
            this.setRepeat( false );
        }
        this.needsUpdate = true;
        return this;
    },
    setDimentions: function( width, height ) {
        this.width = width;
        this.height = height;
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
            source: this.source !== null ? this.source.getAttribute( 'src' ) : null
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
