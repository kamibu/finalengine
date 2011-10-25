/*global
    Importer  :  false,
    Material  :  false,
    Vector3   :  false,
    Texture   :  false
*/

/**
 * @class
 * @extends Material
 *
 * A material for objects with textures.
 *
 * @constructor
 * @param {Texture} texture
 */
function CubemapMaterial( sources ) {
    Material.call( this );
    this.name = 'CubemapMaterial';

    var self = this;
    new Importer( 'resources' ).load( 'system/CubemapShader', function( shader ) {
        self.shader = shader;
    } );

    this.engineParameters = {
        WorldViewProjectionMatrix: true,
        WorldViewMatrix: true
    };

    var texture = new Texture( Texture.CUBEMAP ).setRepeat( false );
    texture.source = [];
    texture.origin = Texture.LOWER_LEFT_CORNER;

    var toLoad = 0;
    sources.forEach( function( source, i ) {
        var textureURL = texture;
        var img = new Image();

        ++toLoad;
        img.onload = function() {
            --toLoad;
            if ( !toLoad ) {
                console.log( 'h ' + img.height + ', w ' + img.width );
                texture.setDimensions( img.width, img.height );
                texture.needsUpdate = true;
            }
        };

        img.src = source;
        texture.source[ i ] = img;
    } );
    this.setParameter( 'texture', { data: texture } );
    this.texture = texture;
}

CubemapMaterial.extend( Material );
