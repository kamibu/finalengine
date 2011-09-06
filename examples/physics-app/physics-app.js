var KeyboardDevice;

function PhysicsApp() {
    Application.call( this );
    var self = this;

    new Importer( 'resources' ).load( 'streets_Asphalt', function( material ) {
        var cube = new Cube();
        self.cube = cube;
        var img = new Image();
        img.src = 'resources/asphalt.png';
        material.setParameter( 'texture', new Texture().setImage( img ) );
        cube.setMaterial( material );
        self.scene.appendChild( cube );

        var box = new jigLib.JBox( new NodeSkin( cube ), 1, 1, 1 );
        // var box = new jigLib.JTriangleMesh();
        window.box = box;
        box.set_mass( 1 );
        box.set_friction( 10 );
        box.moveTo( [ 0, 4, 0, 0 ] );
        system.addBody( box );
    } );

    var system = new jigLib.PhysicsSystem.getInstance();
    system.setGravity( [ 0, -9.8, 0, 0 ] );
    system.setSolverType( 'ACCUMULATED' );

    var ground = new jigLib.JPlane( null, [ 0, 1, 0, 0 ] );
    ground.set_friction( 10 );
    system.addBody( ground );
    ground.moveTo( [ 0, -0, 0, 0 ] );

    window.system = system;

    this.camera.setPosition( [ 0, 2, 15 ] );
}

PhysicsApp.prototype.onBeforeRender = function( elapsed ) {
    system.integrate( -elapsed / 75 / 10 );
};

PhysicsApp.extend( Application );

var physicsApp = new PhysicsApp();
