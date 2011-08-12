// extern
var Texture;

function TextureManager() {
    this.cache = {};
}


TextureManager.prototype = {
    constructor: TextureManager,
    load: function ( url ) {
        if ( this.cache[ url ] )  {
            return this.cache[ url ];
        }

        var texture = new Texture( url.split( '/' ).pop() );

        var img = new Image();
        img.onload = function() {
            texture.setImage( img );
        };
        img.src = url;

        this.cache[ url ] = texture;

        return texture;
    }
};
