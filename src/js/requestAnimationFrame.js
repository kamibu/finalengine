/**
 * Provides requestAnimationFrame in a cross browser way.
 * @author paulirish / http://paulirish.com/
 */

function makeRequestAnimationFrame() {
    if ( typeof window.webkitRequestAnimationFrame !== 'undefined' ) {
        return window.webkitRequestAnimationFrame;
    }
    if ( typeof window.mozRequestAnimationFrame !== 'undefined' ) {
        return window.mozRequestAnimationFrame;
    }
    if ( typeof window.oRequestAnimationFrame !== 'undefined' ) {
        return window.oRequestAnimationFrame;
    }
    if ( typeof window.msRequestAnimationFrame !== 'undefined' ) {
        return window.msRequestAnimationFrame;
    }

    function fallback( callback ) {
       window.setTimeout( callback, 1000 / 60 );
    }

    return fallback;
}

if ( !window.requestAnimationFrame ) {
    window.requestAnimationFrame = makeRequestAnimationFrame();
}
