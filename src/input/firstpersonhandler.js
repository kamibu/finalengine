/*global InputHandler: false, Vector3: false */

function FirstPersonHandler( node, camera ) {
    InputHandler.call( this );

    this.node = node;
    this.moveInterval = false;
    this.velocity = 0.3;
    this.angularVelocity = 0.1;

    if ( camera ) {
        node.appendChild( camera );
    }

    this.onKey( 'W', this.moveForward.bind( this ) );
    this.onKey( 'S', this.moveBackward.bind( this ) );
    this.onKey( 'A', this.rotateLeft.bind( this ) );
    this.onKey( 'D', this.rotateRight.bind( this ) );
    this.onKeyUp( [ 'W', 'S' ], this.stopMoving.bind( this ) );
    this.onKeyUp( [ 'A', 'D' ], this.stopRotating.bind( this ) );
}

FirstPersonHandler.prototype = {
    getAngle: function() {
        var a, c = this.node.orientation.data[ 3 ];
        if ( c < -1 ) {
            a = 2 * Math.PI;
        }
        else if ( c > 1 ) {
            a = 0;
        }
        else {
            a = Math.acos( c ) * 2;
        }
        if ( Math.abs( this.node.orientation.data[ 1 ] - 1 ) > 1 ) {
            a = 2 * Math.PI - a;
        }
        if ( isNaN( a ) ) {
            // throw "NaN firstpersonhandler angle";
            return 0;
        }
        return a;
    },
    stopMoving: function() {
        clearInterval( this.walkInterval );
        this.walkInterval = false;
    },
    stopRotating: function() {
        clearInterval( this.rotateInterval );
        this.rotateInterval = false;
    },
    moveForward: function() {
        var self = this;
        this.walkInterval = setInterval( function() {
            var angle = self.getAngle();
            console.log( angle );
            self.node.move( new Vector3( [ self.velocity * Math.sin( angle ), 0, self.velocity * Math.cos( angle ) ] ) );
        }, 17 );
    },
    moveBackward: function() {
        var self = this;
        this.walkInterval = setInterval( function() {
            var angle = self.getAngle();
            self.node.move( new Vector3( [ -self.velocity * Math.sin( angle ), 0, -self.velocity * Math.cos( angle ) ] ) );
        }, 30 );
    },
    rotateLeft: function() {
        var self = this;
        this.rotateInterval = setInterval( function() {
            self.node.rotate( new Vector3( [ 0, 1, 0 ] ), self.angularVelocity );
        }, 30 );
    },
    rotateRight: function() {
        var self = this;
        this.rotateInterval = setInterval( function() {
            self.node.rotate( new Vector3( [ 0, 1, 0 ] ), -self.angularVelocity );
        }, 30 );
    }
};

FirstPersonHandler.extend( InputHandler );
