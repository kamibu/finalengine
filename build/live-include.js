var root = 'src/';

var files = [
    'debug/assert.js',
    'utils/math.js',
    'utils/request.js',

    'libs/uuid.js',
    'libs/glMatrix.js',
    'libs/extender.js',
    'libs/events.js',

    'math/transform.js',
    'math/matrix4.js',
    'math/vector3.js',
    'math/quaternion.js',

    'utils/tempvars.js',
    'utils/uidgenerator.js',
    'utils/bounds.js',

    'renderer/renderer.js',
    'renderer/buffer.js',
    'renderer/vertexbuffer.js',
    'renderer/texture.js',
    'renderer/mesh.js',
    'renderer/shader.js',

    'bounding/volume.js',
    'bounding/sphere.js',
    'bounding/box.js',

    'scene/scene.js',
    'scene/node.js',
    'scene/camera.js',
    'scene/drawable.js',

    'geometry/cube.js',

    'texturemanager.js',
    'shadermanager.js',
    'rendermanager.js',
    'application.js'
];

//var firstChild = document.body.firstElementChild;

var file;
while ( file = files.shift() ) {
    var script = document.createElement( 'script' );
    script.src = root + file;
    //document.body.insertBefore( script, firstChild );
    document.head.appendChild( script );
}
