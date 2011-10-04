function Bullet( yAngle ) {
    Sphere.call( this );

    this.setScale( 0.5 );
    this.material.setParameter( 'Diffuse', new Vector3( [ 1, 1, 0 ] ) );
    this.yAngle = yAngle;

    this.velocity = 2;
}

Bullet.prototype = {
    constructor: Bullet,
    update: function( dt ) {
        if ( !dt ) {
            this.Sphere_update.call( this );
        }
        this.move( new Vector3( [ -this.velocity * Math.sin( this.yAngle ), 0, -this.velocity * Math.cos( this.yAngle ) ] ) );
    }
};

Bullet.extend( Sphere );
