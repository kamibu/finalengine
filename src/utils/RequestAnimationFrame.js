/**
 * Provides requestAnimationFrame in a cross browser way.
 * @author paulirish / http://paulirish.com/
 */

function makeRequestAnimationFrame() {
    return window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame    ||
           window.oRequestAnimationFrame      ||
           window.msRequestAnimationFrame     ||
           function( callback ) {
               window.setTimeout( callback, 1000 / 60 );
           };
}

if ( !window.requestAnimationFrame ) {
    window.requestAnimationFrame = makeRequestAnimationFrame();
}
