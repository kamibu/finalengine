var debug = true;
var root = '../src/';

var files = [
    'debug/assert.js',
    'utils/math.js',
    'utils/request.js',

    'libs/uuid.js',
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
    
    'bounding/boundingvolume.js',
    'bounding/boundingsphere.js',
    'bounding/boundingbox.js',    

    'scene/scene.js',
    'scene/node.js',
    'scene/camera.js',
    'scene/drawable.js',

    'material/material.js',

    'geometry/cube.js',

    'texturemanager.js',
    'shadermanager.js',
    'rendermanager.js',
    'application.js',

    'test/testcase.js',
    'test/browser/testview.js'
];


var debugRegExp = /\/\*DEBUG\*\/(.|\n|\r)*?\/\*DEBUG_END\*\//g;
var fs = require( 'fs' );
var res = '';
var file = '';
for( var i = 0; i < files.length; ++i ) {
    res += fs.readFileSync( root + files[ i ], 'utf8' );
}
if( !debug ) {
    res = res.replace( debugRegExp, '' );
}
fs.writeFileSync( 'final-engine.js', res );
