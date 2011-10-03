/*global
    Importer  :  false,
    Material  :  false,
    Vector3   :  false
*/

function TexturedMaterial() {
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
}

TexturedMaterial.extend( Material );
