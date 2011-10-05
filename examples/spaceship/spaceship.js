function Spaceship( modelfile, importer ) {
    Node.call( this );

    this.bullets = [];
    this.velocity = 0.5;

    this.targetRoll = 0;
    this.yAngle = 0;
}

Spaceship.prototype = {
    constructor: Spaceship,
    shoot: function() {
        var leftBullet = new Bullet( this.yAngle );
        leftBullet.setPosition( new Vector3( [ -3, 0, 0 ] ) );
        leftBullet.combineWith( this );
        this.parent.appendChild( leftBullet );
        this.bullets.push( leftBullet );

        var rightBullet = new Bullet( this.yAngle );
        rightBullet.setPosition( new Vector3( [ 3, 0, 0 ] ) );
        rightBullet.combineWith( this );
        this.parent.appendChild( rightBullet );
        this.bullets.push( rightBullet );
    },
    update: function( dt ) {
        if ( !dt ) {
            return this.Node_update.call( this );
        }
    
        this.yAngle += this.targetRoll / 4500;
        
        var targetOrientation = new Quaternion().setEuler( this.yAngle, 0, this.targetRoll );
        this.setOrientation( this.getOrientation().slerp( targetOrientation, dt / 1000 ) );

        this.move( new Vector3( [ -this.velocity * Math.sin( this.yAngle ), 0, -this.velocity * Math.cos( this.yAngle ) ] ) );

        for ( var i = 0; i < this.bullets.length; ++i ) {
            this.bullets[ i ].update( dt );
        }
    }
};

Spaceship.extend( Node );
