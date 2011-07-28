function BoundingBox() {
    BoundingVolume.call( this );
    this.points = [
        Vector3(), Vector3(), Vector3(), Vector3(), 
        Vector3(), Vector3(), Vector3(), Vector3()
    ];
}

BoundingBox.prototype = {
    set: function( vertices ) {
        var l = vertices.length - 1;
        var min = vertices[ l ].clone();
        var max = vertices[ l ].clone();
        
        while ( l-- ) {
            var point = vertices[ l ];
            var i = 3;
            while( i-- ) {
                if ( point[ i ] < min[ i ] ) {
                    min[ i ] = point[ i ];
                }
                if ( point[ i ] > max[ i ] ) {
                    max[ i ] = point[ i ];
                }
            }
        }

        this.points[ 0 ].set( [ min[ 0 ], min[ 1 ], min[ 2 ] ] );
        this.points[ 1 ].set( [ min[ 0 ], min[ 1 ], max[ 2 ] ] );
        this.points[ 2 ].set( [ min[ 0 ], max[ 1 ], min[ 2 ] ] );
        this.points[ 3 ].set( [ min[ 0 ], max[ 1 ], max[ 2 ] ] );
        this.points[ 4 ].set( [ max[ 0 ], min[ 1 ], min[ 2 ] ] );
        this.points[ 5 ].set( [ max[ 0 ], min[ 1 ], max[ 2 ] ] );
        this.points[ 6 ].set( [ max[ 0 ], max[ 1 ], min[ 2 ] ] );
        this.points[ 7 ].set( [ max[ 0 ], max[ 1 ], max[ 2 ] ] );
        return this.points;
    
    },
    getPoints: function() {
        var p = [];
        for ( var i = 0; i < 8; i++ ) {
            p[ i ] = this.points[ i ].clone();
        }
        return p;
    },
    collide: function( boundingVolume ) {
        if ( boundingVolume.type === 0 ) {
            return false;
        }
        else if ( this.type > boundingVolume.type ) {
            return boundingVolume.collide( this );
        }
        else {
            if ( boundingVolume.type == 2 ) {
                //rectangle against rectangle
                var res = ( new Rect() ).rectInterferenceArea( this.getPoints(), boundingVolume.getPoints() );
                return res;
            }
        }    
    }
};

BoundingBox.extend( BoundingVolume );
