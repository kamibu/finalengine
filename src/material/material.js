// extern
var Matrix4, Quaternion, Shader, UUID, Vector3, Color, Texture;

function Material() {
    this.uuid = UUID();
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
