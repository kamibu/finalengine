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
    new OBJLoader().loadOBJ( 'futuristic2/futuristic_0.obj', function( node ) {
        console.log( 'Loaded' );
        window.node = node;
        node.name = 'fp_city';
    } );
    this.camera.setPosition( [ 0, 2, 0 ] );

}
DemoApp.extend( Application );

var demoApp = new DemoApp();
