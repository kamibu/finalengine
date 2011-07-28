function BoundingVolume( points ) {
    Transform.call( this );
}

BoundingVolume.prototype = {
    set: function( points ) {
        //Abstract Method
    }
};

BoundingVolume.extend( Transform );
