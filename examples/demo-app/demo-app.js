var foo = function(){};
function DemoApp() {
    Application.call( this );
    var self = this;

//    this.importer.load( 'streets_Asphalt_drawable', function( woman ) {
//        self.scene.add( woman );
//        window.node = woman;
//        setInterval( function() {
//            woman.rotate( [ 0, 1, 0 ], 0.01 );
//        }, 17 );
//    } );

//    console.log( 'Loading..' );

    effect = new Material();
    effect.vertexShader = 'attribute vec2 UVCoord; varying vec2 fragUVCoord; void main() { fragUVCoord = UVCoord * 0.5 + 0.5; gl_Position = vec4( UVCoord, 0.0, 1.0  ); }';
    effect.fragmentShader = 'precision highp float; uniform sampler2D ColorTexture;varying vec2 fragUVCoord;void main () {  vec4 c = texture2D( ColorTexture, fragUVCoord );  c += texture2D( ColorTexture, fragUVCoord + 0.001 );  c += texture2D( ColorTexture, fragUVCoord + 0.003 );  c += texture2D( ColorTexture, fragUVCoord + 0.005 );  c += texture2D( ColorTexture, fragUVCoord + 0.007 );  c += texture2D( ColorTexture, fragUVCoord + 0.009 );  c += texture2D( ColorTexture, fragUVCoord + 0.011 );  c += texture2D( ColorTexture, fragUVCoord - 0.001 );  c += texture2D( ColorTexture, fragUVCoord - 0.003 );  c += texture2D( ColorTexture, fragUVCoord - 0.005 );  c += texture2D( ColorTexture, fragUVCoord - 0.007 );  c += texture2D( ColorTexture, fragUVCoord - 0.009 );  c += texture2D( ColorTexture, fragUVCoord - 0.011 );  c.rgb = vec3( ( c.r + c.g + c.b ) / 3.0 );  c = c / 9.5;  gl_FragColor = c;}';
//    effect.fragmentShader = 'precision highp float;varying vec2 fragUVCoord;uniform sampler2D ColorTexture;uniform float gamma;uniform float numColors;void main() {  vec3 c = texture2D( ColorTexture, fragUVCoord ).rgb;  c = pow( c, vec3( gamma, gamma, gamma ) );  c = c * numColors;  c = floor( c );  c = c / numColors;  c = pow( c, vec3( 1.0 / gamma ) );  gl_FragColor = vec4( c, 1.0 );}';
//
//    effect.setParameter( 'gamma', 0.5 );
//    effect.setParameter( 'numColors', 10 );
    this.renderManager.addPostProcessEffect( effect );
    setInterval( function() {
        self.renderManager.postProcess = self.renderManager.postProcess ? false : true;
    }, 2000 );

    new OBJLoader().loadOBJ( 'woman/Woman_Low.obj', function( node ) {
        console.log( 'Loaded' );
        window.node = node;
        node.name = 'woman_Low';
        self.scene.add( node.setScale( 0.2 ) );
        setInterval( function() {
            node.rotate( [ 0, 1, 0 ], 0.01 );
        }, 17 );
    } );
    this.camera.setPosition( [ 0, 2, 4 ] );

}
DemoApp.extend( Application );

var demoApp = new DemoApp();
