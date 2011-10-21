/*global
    Importer  :  false,
    Material  :  false,
    Vector3   :  false
*/

/**
 * @class
 * @extends Material
 *
 * A material with a diffuse color.
 *
 * @constructor
 */
function BasicMaterial() {
    Material.call( this );
    this.name = 'BasicMaterial';

    var self = this;
    new Importer( 'resources' ).load( 'system/BasicShader', function( shader ) {
        self.shader = shader;
    } );
    this.setParameter( 'Diffuse', new Vector3( [ 1, 1, 1 ] ) );

    this.engineParameters = {
        WorldViewProjectionMatrix: true
    };
}

BasicMaterial.extend( Material );
