var Shader = function() {
    this.vertexSource = '';
    this.fragmentSource = '';
	
    this.uniforms = {};
	this.attributes = {};
    
    this.needsUpdate = false;
}

Shader.prototype = {
    setVertexSource: function( source ) {
        this.vertexSource = source;
        this.needsUpdate = true;
    },
    setFragmentSource: function( source ) {
        this.fragmentSource = source;
        this.needsUpdate = true;
    }
}
