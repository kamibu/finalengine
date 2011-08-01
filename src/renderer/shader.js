function Shader() {
    this.uid = Shader.uid++;

    this.vertexSource = '';
    this.fragmentSource = '';
	
    this.uniforms = {};
	this.attributes = {};
    
    this.needsUpdate = false;
}

Shader.uid = 0;

Shader.prototype = {
    constructor: Shader,
    setVertexSource: function( source ) {
        this.vertexSource = source;
        this.needsUpdate = true;
    },
    setFragmentSource: function( source ) {
        this.fragmentSource = source;
        this.needsUpdate = true;
    }
};
