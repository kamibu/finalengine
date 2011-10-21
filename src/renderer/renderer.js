/*global
    assert       :  false,
    Framebuffer  :  false,
    Buffer       :  false,
    Mesh         :  false,
    Shader       :  false,
    Texture      :  false,
    debug        :  false
*/

/**
 * @class
 *
 * An abstraction to WebGL calls.
 *
 * <p>Renderer is the central point of the graphics library.
 * It abstracts the underlying API in some simple methods.</p>
 *
 * <p>All the drawing should be made with calls to the renderer
 * and not directly. This is the only place that WebGL
 * calls should exist.</p>
 *
 * @constructor
 * @param {HTMLCanvasElement=} canvas The canvas element to draw to. (optional)
 * @param {number=} width The width of the canvas. (optional)
 * @param {number=} height The height of the canvas. (optional)
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
    this.render = this.dummyRender;

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
        this.uniformMatrix2fv( location, false, value );
    }.bind( gl );

    gl.mineUniformMatrix3fv = function( location, value ) {
        this.uniformMatrix3fv( location, false, value );
    }.bind( gl );

    gl.mineUniformMatrix4fv = function( location, value ) {
        this.uniformMatrix4fv( location, false, value );
    }.bind( gl );

    /*
     * Define two custom functions that upload a Texture object to the current shader.
     * These are defined to be consistent to all uniform types, as Textures also need
     * to be bound before their sampler ID is set to the shader uniform.
     */
    gl.mineUniformSampler2D = function( renderer, location, value ) {
        /*DEBUG*/
            assert( value instanceof Texture, 'Tried to set a non-Texture object to a sampler2D uniform' );
            assert( value.type === Texture.IMAGE, 'The Texture object is not of type IMAGE' );
        /*DEBUG_END*/
        this.uniform1i( location, renderer.bindTexture( value ) );
    }.bind( gl, this );

    gl.mineUniformSamplerCube = function( renderer, location, value ) {
        /*DEBUG*/
            assert( value instanceof Texture, 'Tried to set a non-Texture object to a samplerCube uniform' );
            assert( value.type === Texture.CUBEMAP, 'The Texture object is not of type CUBEMAP' );
        /*DEBUG_END*/
        this.uniform1i( location, renderer.bindTexture( value ) );
    }.bind( gl, this );

    /*
     * The two arrays defined bellow will hold the texture positions that are used
     * from the most recently used one the oldest.
     */
    var maxTextures = this.getParameter( Renderer.MAX_FRAGMENT_TEXTURE_UNITS );

    function makeLinkedList( size ) {
        var ret = [];
        for ( var i = 0; i < size; i++ ) {
            ret[ i ] = {
                previous: null,
                next: null,
                index: i,
                texture: {}
            };
        }
        for ( i = 0; i < size; i++ ) {
            ret[ i ].previous = ret[ i - 1 ] || null;
            ret[ i ].next = ret[ i + 1 ] || null;
        }
        return {
            head: ret[ 0 ],
            tail: ret[ size - 1 ]
        };
    }

    var a = makeLinkedList( maxTextures );
    this.firstTexture2DPosition = a.head;
    this.lastTexture2DPosition = a.tail;

    a = makeLinkedList( maxTextures );
    this.firstTextureCubePosition = a.head;
    this.lastTextureCubePosition = a.tail;

    /*These objects will hold references to the underlying API*/
    this.bufferObjects = {};
    this.textureObjects = {};
    this.programObjects = {};
    this.framebufferObjects = {};

    this.currentShader = null;
	this.boundedBuffer = null;
    this.boundedFrameBuffer = null;

    /*
     * This is the default Render state.
     */
    gl.viewport( 0, 0, this.width, this.height );
    gl.clearColor( 0, 0, 0, 1 );
    gl.clearDepth( 1 );
    gl.enable( gl.CULL_FACE );
    gl.enable( gl.DEPTH_TEST );
    gl.depthFunc( gl.LEQUAL );
    gl.disable( gl.BLEND );
    //gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
};


/**
 * @const
 * @static
 */
Renderer.MAX_FRAGMENT_TEXTURE_UNITS = 1;
/**
 * @const
 * @static
 */
Renderer.MAX_VERTEX_TEXTURE_UNITS = 2;
/**
 * @const
 * @static
 */
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
                var ext = this.gl.getSupportedExtensions();
                for ( var i = 0; i < ext.length; i++ ) {
                    if ( ext[ i ] == 'OES_texture_float' ) {
                        this.gl.getExtension( ext[ i ] );
                        return true;
                    }
                }
                return false;
        }
    },
    decayArray: function ( array, deleteFunc ) {
        var gl = this.gl;
        for ( var objectName in array ) {
            var object = array[ objectName ];
            if ( !object.used ) {
                deleteFunc.call( gl, object );
                delete array[ objectName ];
            }
            else {
                object.used = false;
            }
        }
    },
    decay: function() {
        var gl = this.gl;
        this.decayArray( this.bufferObjects, gl.deleteBuffer );
        this.decayArray( this.textureObjects, gl.deleteTexture );
        this.decayArray( this.programObjects, gl.deleteProgram );
    },
    /*
     * This method will create a GL buffer containing the data specified.
     * If no type is specified the buffer will be of type ARRAY_BUFFER.
     */
    createBuffer: function( buffer ) {
        /*DEBUG*/
            assert( buffer instanceof Buffer, 'Illegal type. buffer must be a Buffer object.' );
        /*DEBUG_END*/
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
            assert( buffer instanceof Buffer, 'Illegal type. buffer must be a Buffer object.' );
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
            this.gl.bindBuffer( type, null );
        }
        buffer.needsUpdate = false;
	},
    /*DEBUG*/
    isBuffer: function( buffer ) {
        try {
            return this.gl.isBuffer( buffer );
        }
        catch ( e ) {
            return false;
        }
    },
    /*DEBUG_END*/
	bindBuffer: function( buffer ) {
        /*DEBUG*/
            assert( buffer instanceof Buffer, 'Illegal type. buffer must be a Buffer object.' );
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
        bufferObject.used = true;
    },
    /*
     * This method  will create a texture object with the data passed to it.
     * The source of the texture can be a canvas, video or img element or
     * a pixel array. If it is a pixel array then width and height must be
     * specified. In every case they must be a power of 2.
     */
    createTexture: function( texture ) {
        /*DEBUG*/
            assert( texture instanceof Texture, 'Invalid type. texture must be a Texture instance' );
            if ( !texture.width.isPowerOfTwo() || !texture.height.isPowerOfTwo() ) {
                assert( texture.minFilter !== Texture.NEAREST_MIPMAP_NEAREST, 'Cannot use mipmapping with non power of two dimentions texture' );
                assert( texture.minFilter !== Texture.NEAREST_MIPMAP_LINEAR, 'Cannot use mipmapping with non power of two dimentions texture' );
                assert( texture.minFilter !== Texture.LINEAR_MIPMAP_NEAREST, 'Cannot use mipmapping with non power of two dimentions texture' );
                assert( texture.minFilter !== Texture.LINEAR_MIPMAP_LINEAR, 'Cannot use mipmapping with non power of two dimentions texture' );
            }
        /*DEBUG_END*/

        var gl = this.gl;
        var target, format, dataType, previousTexture;
        var textureObject = gl.createTexture();
        textureObject.bindPosition = null;
        textureObject.width = texture.width;
        textureObject.height = texture.height;

        switch ( texture.origin ) {
            case Texture.UPPER_LEFT_CORNER:
                gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
                break;
            case Texture.LOWER_LEFT_CORNER:
                gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, false );
                break;
        }

        switch ( texture.dataType ) {
            case Texture.UNSIGNED_BYTE:
                dataType = gl.UNSIGNED_BYTE;
                break;
            case Texture.FLOAT:
                dataType = gl.FLOAT;
                break;
        }

        switch ( texture.format ) {
            case Texture.RGB:
                format = gl.RGB;
                break;
            case Texture.RGBA:
                format = gl.RGBA;
                break;
        }

        switch ( texture.type ) {
            case Texture.IMAGE:
                target = gl.TEXTURE_2D;
                previousTexture = gl.getParameter( gl.TEXTURE_BINDING_2D );
                gl.bindTexture( target, textureObject );
                if ( texture.source === null ) {
                    gl.texImage2D( target, 0, format, texture.width, texture.height, 0, format, dataType, null );
                }
                else {
                    gl.texImage2D( target, 0, format, format, dataType, texture.source );
                }
                break;
            case Texture.CUBEMAP:
                target = gl.TEXTURE_CUBE_MAP;
                previousTexture = gl.getParameter( gl.TEXTURE_BINDING_CUBE_MAP );
                gl.bindTexture( target, textureObject );
                for ( var i = 0; i < 6; ++i ) {
                    gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, format, format, dataType, texture.source[ i ] );
                }
                break;
        }

        switch ( texture.minFilter ) {
            case Texture.NEAREST:
                gl.texParameteri( target, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
                break;
            case Texture.LINEAR:
                gl.texParameteri( target, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
                break;
            case Texture.NEAREST_MIPMAP_NEAREST:
                gl.texParameteri( target, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST );
                gl.generateMipmap( target );
                break;
            case Texture.NEAREST_MIPMAP_LINEAR:
                gl.texParameteri( target, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
                gl.generateMipmap( target );
                break;
            case Texture.LINEAR_MIPMAP_NEAREST:
                gl.texParameteri( target, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST );
                gl.generateMipmap( target );
                break;
            case Texture.LINEAR_MIPMAP_LINEAR:
                gl.texParameteri( target, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
                gl.generateMipmap( target );
                break;
        }

        switch ( texture.magFilter ) {
            case Texture.NEAREST:
                gl.texParameteri( target, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
                break;
            case Texture.LINEAR:
                gl.texParameteri( target, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
                break;
        }

        switch ( texture.wrapS ) {
            case Texture.REPEAT:
                gl.texParameteri( target, gl.TEXTURE_WRAP_S, gl.REPEAT );
                break;
            case Texture.MIRROR_REPEAT:
                gl.texParameteri( target, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT );
                break;
            case Texture.CLAMP_TO_EDGE:
                gl.texParameteri( target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
                break;
        }

        switch ( texture.wrapT ) {
            case Texture.REPEAT:
                gl.texParameteri( target, gl.TEXTURE_WRAP_T, gl.REPEAT );
                break;
            case Texture.MIRROR_REPEAT:
                gl.texParameteri( target, gl.TEXTURE_WRAP_T, gl.MIRROR_REPEAT );
                break;
            case Texture.CLAMP_TO_EDGE:
                gl.texParameteri( target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
                break;
        }
        gl.bindTexture( target, previousTexture );

        this.textureObjects[ texture.uid ] = textureObject;
        texture.needsUpdate = false;
    },
    updateTexture: function( texture ) {
        /*DEBUG*/
            assert( texture instanceof Texture, 'Invalid type. texture must be a Texture instance' );
        /*DEBUG_END*/
        
        if ( typeof this.textureObjects[ texture.uid ] === 'undefined' ) {
            this.createTexture( texture );
            return;
        }

        var textureObject = this.textureObjects[ texture.uid ];
        if ( textureObject.bindPosition ) {
            textureObject.bindPosition.texture = {};
            textureObject.bindPosition = null;
        }

        if ( texture.width !== textureObject.width || texture.height !== textureObject.height ) {
            this.deleteTexture( texture );
            this.createTexture( texture );
            return;
        }

        var gl = this.gl;
        var previousTexture;
        switch ( texture.type ) {
            case Texture.IMAGE:
                previousTexture = gl.getParameter( gl.TEXTURE_BINDING_2D );
                gl.bindTexture( gl.TEXTURE_2D, textureObject );
                if ( texture.source === null ) {
                    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, texture.width, texture.height, 0, gl.RGB, gl.UNSIGNED_BYTE, null );
                }
                else {
                    gl.texSubImage2D( gl.TEXTURE_2D, 0, 0, 0, gl.RGB, gl.UNSIGNED_BYTE, texture.source );
                }
                gl.bindTexture( gl.TEXTURE_2D, previousTexture );
                break;
            case Texture.CUBEMAP:
                throw 'Not implemented';
        }
        texture.needsUpdate = false;
    },
    /*
     * This method binds a Texture object to a position determined by an internal algorithm
     * and the position choosed is returned. If the texture needs
     * updating then it is automatically updated.
     */
    bindTexture: function( texture ) {
        /*DEBUG*/
            assert( texture instanceof Texture, 'Invalid type. texture must be a Texture instance' );
        /*DEBUG_END*/
        var type, textureObject, gl, position, firstPosition, lastPosition;

        if ( texture.needsUpdate || typeof this.textureObjects[ texture.uid ] === 'undefined' ) {
            this.updateTexture( texture );
        }

        gl = this.gl;
        textureObject = this.textureObjects[ texture.uid ];
        textureObject.used = true;
        position = textureObject.bindPosition;

        switch ( texture.type ) {
            case Texture.IMAGE:
                firstPosition = this.firstTexture2DPosition;

                if ( !position ) {
                    position = this.lastTexture2DPosition;
                    position.texture.bindPosition = null;
                    position.texture = textureObject;
                    textureObject.bindPosition = position;

                    gl.activeTexture( gl.TEXTURE0 + position.index );
                    gl.bindTexture( gl.TEXTURE_2D, textureObject );
                }
                if ( position.previous ) {
                    if ( position.next ) {
                        position.next.previous = position.previous;
                    }
                    else {
                        this.lastTexture2DPosition = position.previous;
                    }

                    position.previous.next = position.next;

                    position.previous = null;
                    position.next = firstPosition;

                    firstPosition.previous = position;
                    this.firstTexture2DPosition = position;
                }
                break;
            case Texture.CUBEMAP:
                firstPosition = this.firstTextureCubePosition;

                if ( !position ) {
                    position = this.lastTextureCubePosition;
                    position.texture.bindPosition = null;
                    position.texture = textureObject;
                    textureObject.bindPosition = position;

                    gl.activeTexture( gl.TEXTURE0 + position.index );
                    gl.bindTexture( gl.TEXTURE_CUBE_MAP, textureObject );
                }
                if ( position.previous ) {
                    if ( position.next ) {
                        position.next.previous = position.previous;
                    }
                    else {
                        this.lastTexture2DPosition = position.previous;
                    }

                    position.previous.next = position.next;

                    position.previous = null;
                    position.next = firstPosition;

                    firstPosition.previous = position;
                    this.firstTexture2DPosition = position;
                }
                break;
        }
        return position.index;
    },
    deleteTexture: function( texture ) {
        /*DEBUG*/
            assert( texture instanceof Texture, 'Invalid type. texture must be a Texture instance' );
        /*DEBUG_END*/
        var textureObject = this.textureObjects[ texture.uid ];
        if ( textureObject ) {
            this.gl.deleteTexture( textureObject );
            delete this.textureObjects[ texture.uid ];
        }
    },
    deleteFramebuffer: function( framebuffer ) {
        /*DEBUG*/
            assert( framebuffer instanceof Framebuffer, 'Invalid type. framebuffer must be a Framebuffer instance' );
        /*DEBUG_END*/
        var gl = this.gl;
        this.deleteTexture( framebuffer.colorTexture );

        var framebufferObject = this.framebufferObjects[ framebuffer.uid ];
        if ( framebufferObject ) {
            gl.deleteRenderbuffer( framebufferObject.renderbuffer );
            gl.deleteFramebuffer( framebufferObject );
        }
    },
    /*
     * This method creates a framebuffer object with the specified
     * dimentions. The color attachment of the framebuffer created
     * is a texture and can be used as input to a shader. Also, the
     * framebuffer created has a 16bit depth buffer.
     */
    createFramebuffer: function( framebuffer ) {
        /*DEBUG*/
            assert( framebuffer instanceof Framebuffer, 'Tried to update a non-framebuffer object' );
        /*DEBUG_END*/
        var gl = this.gl;

        var framebufferObject = this.framebufferObjects[ framebuffer.uid ] = gl.createFramebuffer();
        gl.bindFramebuffer( gl.FRAMEBUFFER, framebufferObject );

        this.bindTexture( framebuffer.colorTexture );
        framebufferObject.colorTexture = this.textureObjects[ framebuffer.colorTexture.uid ];
        gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, framebufferObject.colorTexture, 0 );

        var renderbufferObject = framebufferObject.renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer( gl.RENDERBUFFER, renderbufferObject );
        gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, framebuffer.width, framebuffer.height );
        gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbufferObject );
        gl.bindRenderbuffer( gl.RENDERBUFFER, null );

        /*DEBUG*/
            assert( gl.checkFramebufferStatus( gl.FRAMEBUFFER ) === gl.FRAMEBUFFER_COMPLETE, 'Framebuffer was not constructed correctly' );
        /*DEBUG_END*/
        gl.bindFramebuffer( gl.FRAMEBUFFER, null );
    },
    /*
     * This method updated the dimentions of an already created framebuffer.
     * The contents of the framebuffer immediatelly after this call are
     * undefined.
     */
    updateFramebuffer: function( framebuffer ) {
        /*DEBUG*/
            assert( framebuffer instanceof Framebuffer, 'Tried to update a non-framebuffer object' );
        /*DEBUG_END*/
        if ( this.framebufferObjects[ framebuffer.uid ] ) {
            this.deleteFramebuffer( framebuffer );
        }
        this.createFramebuffer( framebuffer );

        framebuffer.needsUpdate = false;
    },
    /*
     * This method binds the passed framebuffer so that it becomes active.
     * Any drawing calls following a framebuffer bind will cause the result
     * of the calls being writted in the framebuffer. To return to the normal
     * renderering to the screen bindFramebuffer must be called with null as
     * its parameter.
     */
    bindFramebuffer: function( framebuffer ) {
        /*DEBUG*/
            assert( framebuffer instanceof Framebuffer || framebuffer === null, 'Tried to bind a non-framebuffer object' );
        /*DEBUG_END*/
        var gl = this.gl,
            framebufferObject;

        if ( framebuffer !== null ) {
            framebufferObject = this.framebufferObjects[ framebuffer.uid ];

            if ( framebuffer.needsUpdate || !framebufferObject || !this.textureObjects[ framebuffer.colorTexture.uid ] ) {
                this.updateFramebuffer( framebuffer );
                framebufferObject = this.framebufferObjects[ framebuffer.uid ];
            }
            framebufferObject.colorTexture.used = true;
        }
        else {
            framebufferObject = null;
        }

        if ( this.boundedFramebuffer != framebuffer ) {
            gl.bindFramebuffer( gl.FRAMEBUFFER, framebufferObject );
            this.boundedFramebuffer = framebuffer;
        }
    },
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

            /* If a shader uses a uniform that is an array then the uniform name that we get has "[0]" at the end.
             * For example uniform vec4 foo[ 10 ] will have a name of foo[0]. We remove the brackets so the names are
             * easier to program.
             */
            var name = info.size > 1 ? info.name.slice( 0, -3 ) : info.name;


            program.uniforms[ name ] = {
                location: gl.getUniformLocation( program, info.name ),
                set: null
            };

            switch ( info.type ) {
                case gl.FLOAT:
                    program.uniforms[ name ].set = gl.uniform1f.bind( gl );
                    break;
                case gl.FLOAT_VEC2:
                    program.uniforms[ name ].set = gl.uniform2fv.bind( gl );
                    break;
                case gl.FLOAT_VEC3:
                    program.uniforms[ name ].set = gl.uniform3fv.bind( gl );
                    break;
                case gl.FLOAT_VEC4:
                    program.uniforms[ name ].set = gl.uniform4fv.bind( gl );
                    break;
                case gl.INT:
                case gl.BOOL:
                    program.uniforms[ name ].set = gl.uniform1i.bind( gl );
                    break;
                case gl.INT_VEC2:
                case gl.BOOL_VEC2:
                    program.uniforms[ name ].set = gl.uniform2iv.bind( gl );
                    break;
                case gl.INT_VEC3:
                case gl.BOOL_VEC3:
                    program.uniforms[ name ].set = gl.uniform3iv.bind( gl );
                    break;
                case gl.INT_VEC4:
                case gl.BOOL_VEC4:
                    program.uniforms[ name ].set = gl.uniform4iv.bind( gl );
                    break;
                case gl.FLOAT_MAT2:
                    program.uniforms[ name ].set = gl.mineUniformMatrix2fv;
                    break;
                case gl.FLOAT_MAT3:
                    program.uniforms[ name ].set = gl.mineUniformMatrix3fv;
                    break;
                case gl.FLOAT_MAT4:
                    program.uniforms[ name ].set = gl.mineUniformMatrix4fv;
                    break;
                case gl.SAMPLER_2D:
                    program.uniforms[ name ].set = gl.mineUniformSampler2D;
                    break;
                case gl.SAMPLER_CUBE:
                    program.uniforms[ name ].set = gl.mineUniformSamplerCube;
                    break;
            }
        }

        attributeCount = gl.getProgramParameter( program, gl.ACTIVE_ATTRIBUTES );
        program.attributes = {};
        gl.useProgram( program );
        while ( attributeCount-- ) {
            gl.enableVertexAttribArray( attributeCount );
            info = gl.getActiveAttrib( program, attributeCount );
            program.attributes[ info.name ] = {
                /*DEBUG*/
                    type: info.type,
                /*DEBUG_END*/
                location: gl.getAttribLocation( program, info.name )
            };
        }
        gl.useProgram( null );

        program.used = true;
        this.programObjects[ shader.uid ] = program;
        shader.needsUpdate = false;
    },
    /*
     * This method is used to use the specified shader. All the values that are
     * currenly saved in the shader object will be uploaded to the GPU and the
     * appropriate buffers will be bound to the appropriate attributes.
     */
    useShader: function( shader ) {
        if ( shader === null ) {
            this.render = this.dummyRender;
            return;
        }
        this.render = this._render;
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

        programObject.used = true;
    },
    uploadShaderUniforms: function() {
        var shader = this.currentShader;

        /*DEBUG*/
            assert( shader, 'No shader to upload uniforms. Call useShader() before rendering anything' );
        /*DEBUG_END*/
        var programObject = this.programObjects[ shader.uid ];
        for ( var uniform in programObject.uniforms ) {
            /*DEBUG*/
                assert( typeof shader.uniforms[ uniform ] != 'undefined', 'Uniform "' + uniform + '" is undefined! You must set a value.' );
            /*DEBUG_END*/
            var u = programObject.uniforms[ uniform ];
            u.set( u.location, shader.uniforms[ uniform ] );
        }

        programObject.used = true;
    },
    /*
     * This method will resize the default framebuffer to the size specified.
     * It will not have any effect to custom framebuffers, if any is bounded.
     */
    setSize: function( width, height ) {
        this.canvas.width = this.width = width;
        this.canvas.height = this.height = height;
        this.gl.viewport( 0, 0, this.width, this.height );
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
    _render: function( mesh ) {
		if ( !this.currentShader ) {
			/*DEBUG*/
				debug.log( debug.ERROR, 'Tried to render without a shader. Call useShader() before rendering.' );
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
        }

        this.uploadShaderUniforms();
		var shader = this.currentShader;

		var program = this.programObjects[ shader.uid ];

		for ( var attribute in program.attributes ) {
			var vertexAttribute = mesh.vertexAttributes[ attribute ];
            /*DEBUG*/
                assert( typeof vertexAttribute != 'undefined', 'VertexAttribute "' + attribute + '" is missing from the mesh.' );
                switch ( program.attributes[ attribute ].type ) {
                    case gl.FLOAT:
                        assert( vertexAttribute.size === 1, 'VertexAttribute "' + attribute + '" needs a VertexAttribute of size = 1.' );
                        break;
                    case gl.FLOAT_VEC2:
                        assert( vertexAttribute.size === 2, 'VertexAttribute "' + attribute + '" needs a VertexAttribute of size = 2.' );
                        break;
                    case gl.FLOAT_VEC3:
                        assert( vertexAttribute.size === 3, 'VertexAttribute "' + attribute + '" needs a VertexAttribute of size = 3.' );
                        break;
                    case gl.FLOAT_VEC4:
                        assert( vertexAttribute.size === 4, 'VertexAttribute "' + attribute + '" needs a VertexAttribute of size = 4.' );
                        break;
                }
            /*DEBUG_END*/

			this.bindBuffer( vertexAttribute.buffer );
			gl.vertexAttribPointer( program.attributes[ attribute ].location, vertexAttribute.size, gl.FLOAT, false, vertexAttribute.stride * 4, vertexAttribute.offset * 4 );
		}

		this.bindBuffer( mesh.indexBuffer );
        gl.drawElements( mode, mesh.indexBuffer.data.length, gl.UNSIGNED_SHORT, 0 );
    },
    dummyRender: function( mesh ) {
    },
    render: null
};
