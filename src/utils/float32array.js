/* Method so you can call foo.toArray() in any Float32Array and
 * take a copy of it in a javascript Array. Used primarly for
 * serialization of buffers into JSON.
 */
Object.defineProperty( Float32Array.prototype, "toArray", {
    value: function() {
        var l = this.length;
        var ret = [];
        while ( l-- ) {
            ret[ l ] = this[ l ];
        }
        return ret;
    } 
} );
