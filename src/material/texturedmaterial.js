/*global
    Importer  :  false,
    Material  :  false,
    Vector3   :  false,
    Texture   :  false
*/

/**
 * @constructor
 * @extends Material
 *
 */
function TexturedMaterial( texture ) {
    Material.call( this );
    this.name = 'TexturedMaterial';

    var self = this;
    new Importer( 'resources' ).load( 'system/TexturedShader', function( shader ) {
        self.shader = shader;
    } );

    this.engineParameters = {
        WorldViewProjectionMatrix: true,
        WorldViewMatrix: true
    };

    if ( typeof texture == "string" ) {
        var textureURL = texture;
        var img = new Image();
        img.src = textureURL;
        texture = new Texture().setImage( img );
        this.setParameter( 'texture', { data: texture } );
    }
}

TexturedMaterial.extend( Material );
