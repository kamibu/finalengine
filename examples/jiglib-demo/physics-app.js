var KeyboardDevice;

function PhysicsApp() {
    Application.call( this );
    var self = this;

    this.cubeMaterial = null;

    this.importer.load( 'streets_Asphalt', function( material ) {
        var img = new Image();
        img.src = 'resources/asphalt.png';
        material.setParameter( 'texture', new Texture().setImage( img ) );

        self.cubeMaterial = material; 

        var floor = new Rectangle( -500, 500, 500, -500 );
        floor.setMaterial( material );
        self.scene.appendChild( floor );
    } );

    this.input.onKey( 'SPACE', function() {
        self.addCube();
    } );

    this.system = new jigLib.PhysicsSystem.getInstance();
    this.system.setGravity( [ 0, -9.8, 0, 0 ] );
    this.system.setSolverType( 'NORMAL' );

    var ground = new jigLib.JPlane( null, [ 0, 1, 0, 0 ] );
    ground.set_friction( 1 );
    ground.moveTo( [ 0, 0, 0, 0 ] );
    this.system.addBody( ground );

    this.camera.setPosition( [ 0, 7, 20 ] );
}

PhysicsApp.prototype.addCube = function() {
    var cube = new Cube();
    cube.setMaterial( this.cubeMaterial );
    this.scene.appendChild( cube );

    var box = new jigLib.JBox( new NodeSkin( cube ), 1, 1, 1 );
    box.set_mass( 1 );
    box.set_friction( 10 );
    box.moveTo( [ Math.random() - 0.5, 10, 0, 0 ] );

    this.system.addBody( box );
}

PhysicsApp.prototype.onBeforeRender = function( elapsed ) {
    this.system.integrate( elapsed / 1000 );
};

PhysicsApp.extend( Application );

var physicsApp = new PhysicsApp();
