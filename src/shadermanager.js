function ShaderManager(){
    this.cache = {};
}

ShaderManager.prototype = {
    load: function( url ) {
        var vSource, fSource, v, f, waiter, shader;

        if ( this.cache[ url ] ) {
            return this.cache[ url ];
        }
        
        shader = new Shader();

        Request.get( url + '/vertex.c', function( vertexSource ) {
            shader.setVertexSource( vertexSource );
        } );

        Request.get( url + '/fragment.c', function( fragmentSource ) {
            shader.setFragmentSource( fragmentSource );
        } );

        this.cache[ url ] = shader;
        return shader;
    }
};
