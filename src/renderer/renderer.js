/*
 * Renderer is the central point of the graphics library.
 * It abrstacts the underlying API in some simple methods.
 * All the drawing should be made with calls to the renderer
 * and not directly. Also this is the only place that WebGL
 * calls should exist.
 */

var Renderer = function( canvas, width, height ) {
    /*
        As the renderer is running, several objects are copyied to the 
        GPU memory for fast rendering. But, as there isn't a way to know
        when the client-side objects are garbage collected we specify a
        decay time. If an object isn't used for this amount of time then
        it is destroyed.
        The decay time is specified in milliseconds.
    */
    this.decayTime = 5 * 1000;
    this.width = width || 640;
    this.height = height || 480;

    this.canvas = canvas || document.createElement( 'canvas' );
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    setInterval( this.decay.bind( this ), this.decayTime );

    /*
     * This should change to .getContext( 'webgl' ) at some point.
     */
    var gl = this.gl = this.canvas.getContext( 'experimental-webgl' );
    if ( this.gl === null ) {
        throw 'Could not initialize WebGL';
    }

    /*
     *  According to the OpenGL ES 2.0 reference, the second parameter
     *  of the functions glUniformMatrix*fv must always be false. So
     *  we are overriding the methods so that they are consistent with
     *  the paramerer format of the other uniform upload functions.
     *
     *  See http://www.khronos.org/opengles/sdk/2.0/docs/man/glUniform.xml
     */
      
    gl.mineUniformMatrix2fv = function( location, value ) { 
        gl.uniformMatrix2fv( location, false, value );
    };
    gl.mineUniformMatrix3fv = function( location, value ) { 
        gl.uniformMatrix3fv( location, false, value );
    };
    gl.mineUniformMatrix4fv = function( location, value ) { 
        gl.uniformMatrix4fv.call( gl, location, false, value );
    };

    /*These objects will hold references to the underlying API*/
    this.bufferObjects = {};
    this.textureObjects = {};
    this.programObjects = {};
    this.framebufferObjects = {};
    this.renderbufferObjects = {};

    this.currentShader = null;
	this.boundedBuffer = null;

    /*
     * This is the default Render state.
     */
    gl.viewport( 0, 0, this.width, this.height );
    gl.clearColor( 0, 0, 0, 1 );
    gl.clearDepth( 1 );
    gl.enable( gl.CULL_FACE );
    gl.enable( gl.DEPTH_TEST );
    gl.depthFunc( gl.LEQUAL );
    gl.enable( gl.BLEND );
    gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
};



Renderer.MAX_FRAGMENT_TEXTURE_UNITS = 1;
Renderer.MAX_VERTEX_TEXTURE_UNITS = 2;
Renderer.FLOAT_TEXTURE = 3;
    
Renderer.prototype = {
    constructor: Renderer,
    getParameter: function( query ) {
        switch ( query ) {
            case Renderer.MAX_FRAGMENT_TEXTURE_UNITS:
                return this.gl.getParameter( this.gl.MAX_TEXTURE_IMAGE_UNITS );
            case Renderer.MAX_VERTEX_TEXTURE_UNITS:
                return this.gl.getParameter( this.gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS );
            case Renderer.FLOAT_TEXTURE:
                var ext = this.gl.getSupportedExtentions();
                for ( var i = 0; i < ext.length; i++ ) {
                    if ( ext[ i ] == 'OES_texture_float' ) {
                        return true;
                    }
                }
                return false;
        }
    },
    decay: function() {
        var now = Date.now();
        var decayTime = this.decayTime;
        var gl = this.gl;
        var object;
        for ( object in this.bufferObjects ) {
            if ( now - this.bufferObjects[ object ].lastTimeUsed > decayTime ) {
                gl.deleteBuffer( this.bufferObjects[ object ] );
                delete this.bufferObjects[ object ];
            }
        }
        for ( object in this.textureObjects ) {
            if ( now - this.textureObjects[ object ].lastTimeUsed > decayTime ) {
                gl.deleteTexture( this.textureObjects[ object ] );
                delete this.textureObjects[ object ];
            }
        }
        for ( object in this.programObjects ) {
            if ( now - this.programObjects[ object ].lastTimeUsed > decayTime ) {
                gl.deleteProgram( this.programObjects[ object ] );
                delete this.programObjects[ object ];
            }
        }
    },
    /*
     * This method will create a GL buffer containing the data specified.
     * If no type is specified the buffer will be of type ARRAY_BUFFER.
     */
    createBuffer: function( buffer ) {
        var type, usage;
        switch ( buffer.type ) {
            case Buffer.ELEMENT_BUFFER:
                type = this.gl.ELEMENT_ARRAY_BUFFER;
                break;
            case Buffer.DATA_BUFFER:
                type = this.gl.ARRAY_BUFFER;
        }

        switch ( buffer.usage ) {
            case Buffer.DYNAMIC:
                usage = this.gl.DYNAMIC_DRAW;
                break;
            case Buffer.STREAM:
                usage = this.gl.STREAM_DRAW;
                break;
            case Buffer.STATIC:
                usage = this.gl.STATIC_DRAW;
                break;
        }

        var bufferObject = this.gl.createBuffer();
        this.gl.bindBuffer( type, bufferObject );
        this.gl.bufferData( type, buffer.data, usage );
        this.gl.bindBuffer( type, null );

        bufferObject.length = buffer.data.length;
        this.bufferObjects[ buffer.uid ] = bufferObject;
    },
    /*
     * This method will delete a buffer previously made with createBuffer.
     * If the buffer is currently bound to some target it or there are
     * references to it it will be marked for deletion and will be deleted
     * when it is unbound and all the references are destroyed.
     */
    deleteBuffer: function( buffer ) {
        /*DEBUG*/
            assert( this.gl.isBuffer( this.bufferObjects[ buffer ] ), 'Illegal type. buffer must be a GL Buffer object.' );
        /*DEBUG_END*/
        this.gl.deleteBuffer( this.bufferObjects[ buffer.uid ] );
        delete this.bufferObjects[ buffer.uid ];
    },
	updateBuffer: function( buffer ) {
		/*DEBUG*/
            assert( this.gl.isBuffer( this.bufferObjects[ buffer ] ), 'Illegal type. buffer must be a GL Buffer object.' );
        /*DEBUG_END*/
		var bufferObject = this.bufferObjects[ buffer.uid ];
		if ( typeof bufferObject == 'undefined' ) {
			this.createBuffer( buffer );
		}
		else if ( bufferObject.length != buffer.data.length ) {
			this.deleteBuffer( buffer );
			this.createBuffer( buffer );
		}
        else {
            var type;
            switch ( buffer.type ) {
                case Buffer.DATA_BUFFER:
                    type = this.gl.ARRAY_BUFFER;
                    break;
                case Buffer.ELEMENT_BUFFER:
                    type = this.gl.ELEMENT_BUFFER;
                    break;
            }
            this.gl.bindBuffer( type, this.bufferObjects[ buffer.uid ] );
            this.gl.bufferSubData( type, 0, buffer.data );
            this.gl.bindbuffer( type, null );
        }
        buffer.needsUpdate = false;
	},
	bindBuffer: function( buffer ) {
        /*DEBUG*/
            assert( this.gl.isBuffer( buffer ), 'Illegal type. buffer must be a GL Buffer object.' );
        /*DEBUG_END*/
        if ( buffer.data === null ) {
            return;
        }
		var bufferObject, type;
		switch ( buffer.type ) {
			case Buffer.DATA_BUFFER:
				type = this.gl.ARRAY_BUFFER;
				break;
			case Buffer.ELEMENT_BUFFER:
				type = this.gl.ELEMENT_ARRAY_BUFFER;
				break;
		}
		
		if ( !this.bufferObjects[ buffer.uid ] || buffer.needsUpdate ) {
			this.updateBuffer( buffer );
            this.boundedBuffer = null;
        }

        if ( this.boundedBuffer == buffer ) {
            return;
        }
        this.boundedBuffer = buffer;
        bufferObject = this.bufferObjects[ buffer.uid ];
        this.gl.bindBuffer( type, bufferObject );
        bufferObject.lastTimeUsed = Date.now();
    },
    /*
     * This method  will create a texture object with the data passed to it.
     * The source of the texture can be a canvas, video or img element or
     * a pixel array. If it is a pixel array then width and height must be
     * specified. In every case they must be a power of 2.
     */
    createTexture: function( texture ) {
        /*DEBUG*/
            assert( texture.constructor == Texture, 'Invalid type. texture must be a Texture instance' );
            if ( !texture.width.isPowerOfTwo() || !texture.height.isPowerOfTwo() ) {
                debug_log( DEBUG_WARNING, 'Creating a texture which has non power of two dimentions.' );
                assert( generateMipmap, 'Cannot use mipmaps in a texture with non power of two dimentions.' );
            }
        /*DEBUG_END*/

        var gl = this.gl;
        var target;
        var textureObject = gl.createTexture();
        
        switch ( texture.origin ) {
            case texture.UPPER_LEFT_CORNER:
                gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
                break;
            case texture.LOWER_LEFT_CORNER:
                gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, false );
                break;
        }

        switch ( texture.type ) {
            case texture.TEXTURE2D:
                target = gl.TEXTURE_2D;
                gl.bindTexture( target, textureObject );
                if ( texture.source !== null ) {
                    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture.source );
                }
                break;
            case texture.TEXTURE_CUBEMAP:
                target = gl.TEXTURE_CUBE_MAP;
                gl.bindTexture( target, textureObject );
                for( var i = 0; i < 6; ++i ) {
                    gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture.source[ i ] );
                }
                break;
        }

        switch ( texture.minFilter ) {
            case texture.NEAREST:
                gl.texParameteri( target, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
                break;
            case texture.LINEAR:
                gl.texParameteri( target, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
                break;
            case texture.NEAREST_MIPMAP_NEAREST:
                gl.texParameteri( target, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST );
                gl.generateMipmap( target );
                break;
            case texture.NEAREST_MIPMAP_LINEAR:
                gl.texParameteri( target, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
                gl.generateMipmap( target );
                break;
            case texture.LINEAR_MIPMAP_NEAREST:
                gl.texParameteri( target, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST );
                gl.generateMipmap( target );
                break;
            case texture.LINEAR_MIPMAP_LINEAR:
                gl.texParameteri( target, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
                gl.generateMipmap( target );
                break;
        }

        switch ( texture.maxFilter ) {
            case texture.NEAREST:
                gl.texParameteri( target, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
                break;
            case texture.LINEAR:
                gl.texParameteri( target, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
                break;
        }

        switch ( texture.wrapS ) {
            case texture.REPEAT:
                gl.texParameteri( target, gl.TEXTURE_WRAP_S, gl.REPEAT );
                break;
            case texture.MIRROR_REPEAT:
                gl.texParameteri( target, gl.TEXTURE_WRAP_S, gl.MIRROR_REPEAT );
                break;
            case texture.CLAMP:
                gl.texParameteri( target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
                break;
        }

        switch ( texture.wrapT ) {
            case texture.REPEAT:
                gl.texParameteri( target, gl.TEXTURE_WRAP_T, gl.REPEAT );
                break;
            case texture.MIRROR_REPEAT:
                gl.texParameteri( target, gl.TEXTURE_WRAP_T, gl.MIRROR_REPEAT );
                break;
            case texture.CLAMP:
                gl.texParameteri( target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
                break;
        }
        gl.bindTexture( target, null );
        
        this.textureObjects[ texture.uid ] = textureObject;
    },
    updateTexture: function( texture ) {
        /*DEBUG*/
            assert( texture.constructor == Texture, 'Invalid type. texture must be a Texture instance' );
        /*DEBUG_END*/
        if ( typeof this.textureObjects[ texture.uid ] == 'undefined' ) {
            this.createTexture( texture );
        }
        else if ( texture.flags & texture.DIMENTIONS ) {
            this.deleteTexture( texture );
            this.createTexture( texture );
        }
        else if ( texture.flags & texture.IMAGE ) {
            var textureObject = this.textureObjects[ texture.uid ];
            var gl = this.gl;
            gl.texSubImage2D( gl.TEXTURE_2D, 0, 0, 0, texture.width, texture.height, gl.RGB, gl.UNSIGNED_BYTE, texture.source );
        }
        texture.ready = true;
        texture.flags = 0x0;
    },
    /*
     * This method binds a texture or a cubemap to the position specified.
     * If the texture needs updateing then it is automatically updated. 
     * The position must be a number between 0 and the MAX_FRAGMENT_TEXTURE_UNITS.
     */
    bindTexture: function( texture, position ) {
        /*DEBUG*/
            assert( texture.constructor == Texture, 'Invalid type. texture must be a Texture instance' );
            assert( position < 0 || position > this.getParameter( Renderer.MAX_FRAGMENT_TEXTURE_UNITS ), 'Texture bind position is out of bounds' );
        /*DEBUG_END*/
        if ( !this.textureObjects[ texture.uid ] || texture.needsUpdate ) {
            this.updateTexture( texture );
        }
        var type, textureObject, gl;
        gl = this.gl;
        switch ( texture.type ) {
            case Texture.IMAGE:
                type = gl.TEXTURE_2D;
                break;
            case Texture.CUBEMAP:
                type = gl.TEXTURE_CUBEMAP;
                break;
        }

        textureObject = this.textureObjects[ texture.uid ];
        textureObject.lastTimeUsed = Date.now();
        gl.activeTexture( this.gl.TEXTURE0 + position );
        gl.bindTexture( type, textureObject );
    },
    deleteTexture: function( texture ) {
        var textureObject = this.textureObjects[ texture.uid ];
        if ( typeof textureObject != 'undefined' ) {
            this.gl.deleteTexture( textureObject );
            delete this.textureObjects[ texture.uid ];
        }
    },
//    /*
//     * This method creates a framebuffer object with the specified
//     * dimentions. The color attachment of the framebuffer created
//     * is a texture and can be used as input to a shader. Also, the
//     * framebuffer created has a 16bit depth buffer.
//     */
//    createFramebuffer: function( width, height ) {
//        var gl = this.gl;
//        var fb = gl.createFramebuffer();
//        gl.bindFramebuffer( gl.FRAMEBUFFER, fb );
//
//        var colorTex = gl.createTexture();
//        gl.activeTexture( gl.TEXTURE0 );
//        gl.bindTexture( gl.TEXTURE_2D, colorTex );
//        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
//        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
//        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
//        gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTex, 0 );
//
//        var depthRB = gl.createRenderbuffer();
//        gl.bindRenderbuffer( gl.RENDERBUFFER, depthRB );
//        gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height );
//        gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRB );
//
//        gl.bindRenderbuffer( gl.RENDERBUFFER, null );
//
//        fb.colorAttachment = colorTex;
//        fb.depthAttachment = depthRB;
//        gl.bindFramebuffer( gl.FRAMEBUFFER, null );
//        fb.uid = this.uid.get();
//        return fb;
//    },
//    /*
//     * This method binds the passed framebuffer so that it becomes active.
//     * Any drawing calls following a framebuffer bind will cause the result
//     * of the calls being writted in the framebuffer. To return to the normal
//     * renderering to the screen bindFramebuffer must be called with null as
//     * its parameter.
//     */
//    bindFramebuffer: function( fb ) {
//        var gl = this.gl;
//        gl.bindFramebuffer( gl.FRAMEBUFFER, fb );
//    },
//    /*
//     * This method updated the dimentions of an already created framebuffer.
//     * The contents of the framebuffer immediatelly after this call are
//     * undefined.
//     */
//    updateFramebuffer: function( fb, width, height ) {
//        var gl = this.gl;
//        gl.activeTexture( gl.TEXTURE0 );
//        gl.bindTexture( gl.TEXTURE_2D, fb.colorAttachment );
//        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
//
//        gl.bindRenderbuffer( gl.RENDERBUFFER, fb.depthAttachment );
//        gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height );
//        
//        gl.bindRenderbuffer( gl.RENDERBUFFER, null );
//    },
    deleteShader: function( shader ) {
        var programObject, gl;
        gl = this.gl;
        programObject = this.programObjects[ shader.uid ];

        if ( this.currentShader == shader ) {
            this.currentShader = null;
        }

        if ( programObject ) {
            gl.deleteShader( programObject.vertexShader );
            gl.deleteShader( programObject.fragmentShader );
            gl.deleteProgram( programObject );
            delete this.programObjects[ shader.uid ];
        }
    },
    /*
     * This method creates a shader object from the two GLSL sources provided.
     * After compiling and linking the shaders it will search for all active
     * uniforms and attributes also finding their type.
     */
    createShader: function( shader ) {
        var gl, program, uniformCount, attributeCount, i, info, vertexShader, fragmentShader;
        gl = this.gl;

        vertexShader = gl.createShader( gl.VERTEX_SHADER );
        gl.shaderSource( vertexShader, shader.vertexSource );
        gl.compileShader( vertexShader );
        if ( !gl.getShaderParameter( vertexShader, gl.COMPILE_STATUS ) ) {
            throw 'Vertex Shader compile error: ' + gl.getShaderInfoLog( vertexShader );
        }

        fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );
        gl.shaderSource( fragmentShader, shader.fragmentSource );
        gl.compileShader( fragmentShader );
        if ( !gl.getShaderParameter( fragmentShader, gl.COMPILE_STATUS ) ) {
            throw 'Fragment Shader compile error: ' + gl.getShaderInfoLog( fragmentShader );
        }

        program = gl.createProgram();
        gl.attachShader( program, vertexShader );
        program.vertexShader = vertexShader;

        gl.attachShader( program, fragmentShader );
        program.fragmentShader = fragmentShader;

        gl.linkProgram( program );
        if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
            throw 'Program linking error: ' + gl.getProgramInfoLog( program );
        }


        uniformCount = gl.getProgramParameter( program, gl.ACTIVE_UNIFORMS );
        program.uniforms = {};
        while ( uniformCount-- ) {
            info = gl.getActiveUniform( program, uniformCount );

            program.uniforms[ info.name ] = {
                location: gl.getUniformLocation( program, info.name ),
                set: null
            };

            switch ( info.type ) {
                case gl.FLOAT:
                    program.uniforms[ info.name ].set = gl.uniform1f.bind( gl );
                    break;
                case gl.FLOAT_VEC2:
                    program.uniforms[ info.name ].set = gl.uniform2fv.bind( gl );
                    break;
                case gl.FLOAT_VEC3:
                    program.uniforms[ info.name ].set = gl.uniform3fv.bind( gl );
                    break;
                case gl.FLOAT_VEC4:
                    program.uniforms[ info.name ].set = gl.uniform4fv.bind( gl );
                    break;
                case gl.INT:
                case gl.BOOL:
                case gl.SAMPLER_2D:
                case gl.SAMPLER_CUBE:
                    program.uniforms[ info.name ].set = gl.uniform1i.bind( gl );
                    break;
                case gl.INT_VEC2:
                case gl.BOOL_VEC2:
                    program.uniforms[ info.name ].set = gl.uniform2iv.bind( gl );
                    break;
                case gl.INT_VEC3:
                case gl.BOOL_VEC3:
                    program.uniforms[ info.name ].set = gl.uniform3iv.bind( gl );
                    break;
                case gl.INT_VEC4:
                case gl.BOOL_VEC4:
                    program.uniforms[ info.name ].set = gl.uniform4iv.bind( gl );
                    break;
                case gl.FLOAT_MAT2:
                    program.uniforms[ info.name ].set = gl.mineUniformMatrix2fv;
                    break;
                case gl.FLOAT_MAT3:
                    program.uniforms[ info.name ].set = gl.mineUniformMatrix3fv;
                    break;
                case gl.FLOAT_MAT4:
                    program.uniforms[ info.name ].set = gl.mineUniformMatrix4fv;
            }
        }
        
        attributeCount = gl.getProgramParameter( program, gl.ACTIVE_ATTRIBUTES );
        program.attributes = {};
        gl.useProgram( program );
        while ( attributeCount-- ) {
            gl.enableVertexAttribArray( attributeCount );
            info = gl.getActiveAttrib( program, attributeCount );
            program.attributes[ info.name ] = {
                location: gl.getAttribLocation( program, info.name )
            };
        }
        gl.useProgram( null );

        program.lastTimeUsed = Date.now();
        this.programObjects[ shader.uid ] = program;
        shader.needsUpdate = false;
    },
    /*
     * This method is used to use the specified shader. All the values that are
     * currenly saved in the shader object will be uploaded to the GPU and the
     * appropriate buffers will be bound to the appropriate attributes.
     */
    useShader: function( shader ) {
        var programObject, u, uniform;
        if ( !this.programObjects[ shader.uid ] || shader.needsUpdate ) {
            this.deleteShader( shader );
            this.createShader( shader );
            this.currentShader = null;
        }

        programObject = this.programObjects[ shader.uid ];

        if ( this.currentShader != shader ) {
            this.gl.useProgram( programObject );
            this.currentShader = shader;
        }

        programObject.lastTimeUsed = Date.now();
    },
    uploadShaderUniforms: function() {
        /*DEBUG*/
            assert( this.currentShader, 'No shader to upload uniforms. Call useShader() before rendering anything' );
        /*DEBUG_END*/
        var programObject = this.programObjects[ shader.uid ];
        for ( var uniform in programObject.uniforms ) {
            /*DEBUG*/
                assert( typeof shader.uniforms[ uniform ] != 'undefined', 'Uniform "' + uniform + '" is undefined! You must set a value.' );
            /*DEBUG_END*/
            u = programObject.uniforms[ uniform ];
            u.set( u.location, shader.uniforms[ uniform ] );
        }

        programObject.lastTimeUsed = Date.now();
    },
    /*
     * This method will resize the default framebuffer to the size specified.
     * It will not have any effect to custom framebuffers, if any is bounded.
     */
    setSize: function( width, height ) {
        this.canvas.width = this.width = width;
        this.canvas.height = this.height = height;
    },
    /*
     * This method is responsible for initializing the rendering buffer with
     * the current clear color and resets the depth buffer. Should be called
     * before drawing objects on the screen.
     */
    clear: function() {
        this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );
    },
    /*
     * This method takes an index buffer as a parameter and renders the indexed
     * vertices from the buffers binded when useShader() was called. An optional
     * paramter is the drawing method which defaults to TRIANGLES.
     */
    render: function( mesh ) {
		if ( !this.currentShader ) {
			/*DEBUG*/
				debug_log( 'ERROR', 'Tried to render without a shader. Call useShader() before rendering.' );
			/*DEBUG_END*/
			return;
		}
        var gl = this.gl;
		var mode;
		
        switch ( mesh.mode ) {
            case Mesh.POINTS:
                mode = gl.POINTS;
                break;
            case Mesh.LINES:
                mode = gl.LINES;
                break;
            case Mesh.LINE_STRIP:
                mode = gl.LINE_STRIP;
                break;
            case Mesh.LINE_LOOP:
                mode = gl.LINE_LOOP;
                break;
            case Mesh.TRIANGLES:
                mode = gl.TRIANGLES;
                break;
            case Mesh.TRIANGLE_STRIP:
                mode = gl.TRIANGLE_STRIP;
                break;
            case Mesh.TRIANGLE_LOOP:
                mode = gl.TRIANGLE_LOOP;
                break;
        }
		
        this.uploadShaderUniforms();
		var shader = this.currentShader;

		var program = this.programObjects[ shader.uid ];
		
		for ( var attribute in program.attributes ) {
			var vertexAttribute = mesh.vertexAttributes[ attribute ];

			this.bindBuffer( vertexAttribute.buffer );
			gl.vertexAttribPointer( program.attributes[ attribute ].location, vertexAttribute.size, gl.FLOAT, false, vertexAttribute.stride, vertexAttribute.offset );
		}

		this.bindBuffer( mesh.indexBuffer );
        gl.drawElements( mode, mesh.indexBuffer.data.length, gl.UNSIGNED_SHORT, 0 );
    }
};
