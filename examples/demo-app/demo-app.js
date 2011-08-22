function DemoApp() {
    Application.call( this );
    var self = this;

    /*
     * This block of code loads a json and renders it
     *
    this.importer.load( 'woman high detail', function( woman ) {
        self.scene.add( woman );
        setInterval( function() {
            woman.rotate( [ 0, 1, 0 ], 0.01 );
        }, 17 );
    } );
     */

    /*
     * This block of code loads an OBJ and renders it.
     *
    new OBJLoader().loadOBJ( 'woman/Woman_Low.obj', function( node ) {
        self.scene.add( node );
        console.log( 'Done' );

        //To save the loaded mesh first set a name to node, for example node.name = 'woman high detail'
        //and then do self.exporter.save( node ); After you do this the model will be saved in the folder
        //./resources. Use the code above to load the JSON that you just created.
    } );
    */

    this.camera.setPosition( [ 0, 1, 3 ] );
}
DemoApp.extend( Application );

var demoApp = new DemoApp();
