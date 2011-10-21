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
 * @class
 * Material base class.
 *
 * @constructor
 */
function Material() {
    /**
     * @public
     * @type String
     *
     * A UUID generated for this material instance.
     */
    this.uuid = UUID.generateCanonicalForm();

    this.uid = Material.uid++;

    /**
     * @public
     * @type String
     *
     * The name of this Material. The default value is the same as {@link uuid}.
     */
    this.name = this.uuid;

    /*
     * @public
     * @type Shader
     *
     * The shader used for rendering objects with this material.
     */
    this.shader = null;

    /*
     * @public
     * @type Object
     *
     * The values of parameters to be passed to the shader.
     */
    this.parameters = {};
}

Material.uid = 0;

Material.prototype = {
    constructor: Material,
    /**
     * Set the value of a parameter for the shader.
     */
    setParameter: function( name, value ) {
        if ( typeof value === 'object' ) {
            this.parameters[ name ] = value.data;
        }
        else {
            this.parameters[ name ] = value;
        }
        return this;
    },
    /**
     * Get the shader object.
     */
    getShader: function() {
        if ( this.shader !== null ) {
            for ( var parameterName in this.parameters ) {
                this.shader.uniforms[ parameterName ] = this.parameters[ parameterName ];
            }
        }
        return this.shader;
    }
};
