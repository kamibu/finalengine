Object.defineProperty( Number.prototype, "isPowerOfTwo", {
    value: function() {
         return ( this > 0 ) && ( this & ( this - 1 ) ) == 0;
    } 
} );
