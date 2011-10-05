function Spaceship( modelfile, importer, input ) {
    var self = this;

    Node.call( this );

    this.bullets = [];
    this.velocity = 0.5;

    importer.load( modelfile, function( model ) {
        self.onModelLoad( model );
    } );

    this.zOrientation = this.getOrientation();
    this.base = new Quaternion( [ 0, 0, 0, 1 ] );
    this.left = new Quaternion( [ 0, 0, 0.707, 0.707 ] );
    this.right = new Quaternion( [ 0, 0, -0.707, 0.707 ] );
    this.targetOrientation = this.base;
    this.yAngle = 0;

    input.onKey( 'RIGHT_ARROW', {
        callback: function() {
            self.targetOrientation = self.right;
            self.yAngle -= 0.01;
        },
        endCallback: function() {
            self.targetOrientation = self.base;
        },
        repeat: true
    } );

    input.onKey( 'LEFT_ARROW', {
        callback: function() {
            self.targetOrientation = self.left;
            self.yAngle += 0.01;
        },
        endCallback: function() {
            self.targetOrientation = self.base;
        },
        repeat: true
    } );

    input.onKey( 'SPACE', function() {
        self.shoot();
    } );
}

Spaceship.prototype = {
    constructor: Spaceship,
    onModelLoad: function( model ) {
        model.rotate( new Vector3( [ 1, 0, 0 ] ), -Math.PI / 2 ); // fix orientation
        this.appendChild( model );
    },
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

        var turnSpeed = this.targetOrientation == this.base ? 1 : 1;

        //console.log( this.zOrientation, this.targetOrientation, turnSpeed, dt );
        this.setOrientation( this.zOrientation.slerp( this.targetOrientation, turnSpeed * dt / 1000 ) );
        //console.log( this.zOrientation, this.targetOrientation, turnSpeed, dt );
        //console.log( '---' );
        this.rotate( new Vector3( [ 0, 1, 0 ] ), this.yAngle );
        this.move( new Vector3( [ -this.velocity * Math.sin( this.yAngle ), 0, -this.velocity * Math.cos( this.yAngle ) ] ) );

        for ( var i = 0; i < this.bullets.length; ++i ) {
            this.bullets[ i ].update( dt );
        }
    }
};

Spaceship.extend( Node );
