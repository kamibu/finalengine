/*global
    Color       :  false,
    Matrix4     :  false,
    Quaternion  :  false,
    Shader      :  false,
    Texture     :  false,
    UUID        :  false,
    Vector3     :  false
*/

/**
 * @constructor
 */
function Material() {
    this.uuid = UUID.generateCanonicalForm();
    this.uid = Material.uid++;
    this.name = this.uuid;

    this.shader = null;
    this.parameters = {};
}

Material.uid = 0;

Material.prototype = {
    constructor: Material,
    setParameter: function( name, value ) {
        if ( typeof value === 'object' ) {
            this.parameters[ name ] = value.data;
        }
        else {
            this.parameters[ name ] = value;
        }
        return this;
    },
    getShader: function() {
        if ( this.shader !== null ) {
            for ( var parameterName in this.parameters ) {
                this.shader.uniforms[ parameterName ] = this.parameters[ parameterName ];
            }
        }
        return this.shader;
    }
};
