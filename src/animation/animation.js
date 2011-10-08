/**
 * @constructor
 */
function Animation( name ) {
    this.name = name;
    this.keyframes = [];
}

Animation.prototype = {
    addKeyFrame: function( keyframe ) {
        this.keyframes.push( keyframe );
    }
};
