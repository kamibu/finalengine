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
            this.parameters[ name ] = value;   
        }
        else {
            this.parameters[ name ] = {
                data: value
            };
        }
        return this;
    }
};
