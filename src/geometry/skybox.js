/*global CubemapMaterial: false */

// extern
var Buffer, Drawable, Mesh, VertexAttribute;

/**
 * @class
 * Display background images on a 3D scene.
 *
 * <p>
 * The skybox is a box that has the camera on its center and has a texture on each
 * of its (internal) sides.
 * </p>
 *
 * <p>To instantiate the Skybox, pass an array of 6 textures as a parameter to the constructor.
 * The order is the following: (following the order of the WebGL specification constants):</p>
 * <ul>
 * <li>positive x</li>
 * <li>negative x</li>
 * <li>positive y</li>
 * <li>negative y</li>
 * <li>positive z</li>
 * <li>negative z</li>
 * </ul>
 *
 * After instantiating the skybox, you have to add it to the Scene.
 *
 * <p>Example:</p>
 * <code>
 * var skybox = new Skybox( [ 
 *  'skybox/posx.jpg', 
 *  'skybox/negx.jpg', 
 *  'skybox/posy.jpg', 
 *  'skybox/negy.jpg',
 *  'skybox/posz.jpg',
 *  'skybox/negz.jpg'
 * ] );
 * 
 * scene.appendChild( skybox );
 </code>
 * 
 * <p>You can also pass a second parameter to the Skybox to denote the size of skybox (e.g. distance from camera). However, you should be careful that it does not exceed the camera zfar value (by default 1000) or it won't be rendered.</p>
 *
 * @extends Drawable
 *
 * @constructor
 * @param {Array} sources
 * @param {Number} scale
 */
function Skybox( sources, scale ) {
    scale = scale || 500;

    Drawable.call( this );

    console.log( sources );
    this.material = new CubemapMaterial( sources );

    var ret = {
        vertices: [
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,

            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0
        ],
        indices: [
            1, 5, 7, 7, 3, 1,
            2, 6, 4, 4, 0, 2,
            0, 4, 5, 5, 1, 0,
            3, 7, 6, 6, 2, 3,
            4, 6, 7, 7, 5, 4,
            0, 1, 3, 3, 2, 0
        ],
        normals: [
            1.0,  1.0,  -1.0,
            -1.0,  1.0,  -1.0,
            -1.0,  -1.0,  -1.0,
            1.0,  -1.0,  -1.0,
            1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  -1.0,  1.0,
            1.0,  -1.0,  1.0,
        ],
        uvcoords: [
            /*
            1.0, 1.0,  -1.0,
            -1.0, 1.0,  -1.0,
            1.0,  -1.0,  -1.0,
            -1.0,  -1.0,  -1.0,
            1.0, 1.0,  1.0,
            -1.0, 1.0,  1.0,
            1.0,  -1.0,  1.0,
            -1.0,  -1.0,  1.0,
            */
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,

            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0
        ]
    };

    var vertices = new Buffer().setData( ret.vertices );
    var uvcoords = new Buffer().setData( ret.uvcoords );
    // var normals = new Buffer().setData( ret.normals );

    vertices = new VertexAttribute( 'Position' ).setBuffer( vertices );
    uvcoords = new VertexAttribute( 'UVCoord' ).setBuffer( uvcoords );
    // normals = new VertexAttribute( 'Normal' ).setBuffer( normals );

    var indices = new Buffer( Buffer.ELEMENT_BUFFER ).setData( ret.indices );

    var m = new Mesh();
    m.setVertexAttribute( vertices );
    // m.setVertexAttribute( normals );
    m.setVertexAttribute( uvcoords );
    m.setIndexBuffer( indices );

    this.mesh = m;
    this.setScale( scale );
}

Skybox.prototype = {
    constructor: Skybox,
    onBeforeRender: function( camera ) {
        this.setPosition( camera.getPosition() );
    }
};

Skybox.extend( Drawable );
