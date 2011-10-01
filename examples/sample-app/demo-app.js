function DemoApp() {
    Application.call( this );
    this.scene.appendChild( new Sphere() );
}

DemoApp.extend( Application );

var d = new DemoApp();
