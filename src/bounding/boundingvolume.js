// extern
var Transform;

function BoundingVolume( points ) {
    Transform.call( this );
}

BoundingVolume.prototype = {
    constructor: BoundingVolume,
    set: function( points ) {
        //Abstract Method
    }
};

BoundingVolume.extend( Transform );
