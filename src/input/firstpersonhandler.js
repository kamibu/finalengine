var InputHandler;

function FirstPersonHandler( node, camera ) {
    InputHandler.call( this );

    this.node = node;
    this.moveInterval = false;
    this.velocity = 0.8;
    this.angularVelocity = 0.1;

    camera.setPosition( [ 0, 28, -60 ] );
    camera.setOrientation( [ 0, 1, 0, 0 ] );
    node.appendChild( camera );

    this.onKey( 'W', this.moveForward.bind( this ) );
    this.onKey( 'S', this.moveBackward.bind( this ) );
    this.onKey( 'A', this.rotateLeft.bind( this ) );
    this.onKey( 'D', this.rotateRight.bind( this ) );
    this.onKeyUp( [ 'W', 'A', 'S', 'D' ], this.stopMoving.bind( this ) );

    var self = this;
    $( window ).keydown( function( event ) {
        if ( event.which == 87 ) {
            self.node.children[ 1 ].playAnimation( 'walk' );
        }
    } );

    $( window ).keyup( function( event ) {
        if ( event.which == 87 ) {
            self.node.children[ 1 ].playAnimation( 'idle' );
        }
    } );
}

FirstPersonHandler.prototype = {
    getAngle: function() {
        var a = Math.acos( this.node.orientation[ 3 ] ) * 2;
        if ( Math.abs( this.node.orientation[ 1 ] - 1 ) > 1 ) {
            a = 2 * Math.PI - a;
        }
        if ( isNaN( a ) ) {
            throw "NaN firstpersonhandler angle";
        }
        return a;
    },
    stopMoving: function() {
        clearInterval( this.walkInterval );
        clearInterval( this.rotateInterval );
        this.walkInterval = false;
        this.rotateInterval = false;
    },
    moveForward: function() {
        if ( this.walkInterval ) {
            return;
        }
        var self = this;
        this.walkInterval = setInterval( function() {
            var angle = self.getAngle();
            self.node.move( [ self.velocity * Math.sin( angle ), 0, self.velocity * Math.cos( angle ) ] );
        }, 17 );
    },
    moveBackward: function() {
        if ( this.walkInterval ) {
            return;
        }
        var self = this;
        this.walkInterval = setInterval( function() {
            var angle = self.getAngle();
            self.node.move( [ -self.velocity * Math.sin( angle ), 0, -self.velocity * Math.cos( angle ) ] );
        }, 17 );
    },
    rotateLeft: function() {
        if ( this.rotateInterval ) {
            return;
        }
        var self = this;
        this.rotateInterval = setInterval( function() {
            self.node.rotate( [ 0, 1, 0 ], self.angularVelocity );
        }, 17 );
    },
    rotateRight: function() {
        if ( this.rotateInterval ) {
            return;
        }
        var self = this;
        this.rotateInterval = setInterval( function() {
            self.node.rotate( [ 0, 1, 0 ], -self.angularVelocity );
        }, 17 );
    }
};

FirstPersonHandler.extend( InputHandler );
