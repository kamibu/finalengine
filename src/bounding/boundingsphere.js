function BoundingSphere() {
    BoundingVolume.call( this );
    this.radius;
    this.type = 1;
};

BoundingSphere.prototype = {
    set: function( vertices ) {
        var center = TempVars.vec3a;
        var temp = TempVars.vec3b;


        var center.set( [ 0, 0, 0 ] );
        var l = vertices.length;
        while ( l-- ) {
            center.add( vertices[ l ] );
        }
        center.scale( 1 / vertices.length );
        this.setPosition( center );

        var maxRadius = 0;
        var l = vertices.length;
        while ( l-- ) {
            var radius = temp.set( center ).subtract( vertices[ l ] ).length2();
            if ( radius > maxRadius ) {
                maxRadius = radius;
            }
        }
        this.radius = Math.sqrt( radius );
        return this;
    },
    getRadius: function() {
        return this.radius;
    },
    collide: function( boundingVolume ) {
        if ( boundingVolume.type == 0 ) {
            return false;
        }
        else if ( this.type > boundingVolume.type ) {
            return boundingVolume.collide( this );
        }
        else {
            if ( boundingVolume.type == 1 ) {
                //sphere against sphere
                var temp = TempVars.vec3a;

                var distance = temp.set( this.position ).subtract( boundingVolume.position ).length();
                var R = this.radius + boundingVolume.radius;

                return dist <= R;
            }
            else if ( boundingVolume.type == 2 ) {
                //sphere against rectangle
                //TODO
            }
        }    
    }   
};

BoundingSphere.extend( BoundingVolume );
