/* Method so you can call foo.toArray() in any TypedArray and
 * take a copy of it in a javascript Array. Used primarly for
 * serialization of buffers into JSON.
 */
Object.defineProperty( Float32Array.prototype, "toArray", {
    /**
     * @this {Float32Array}
     */
    value: function() {
        var l = this.length;
        var ret = [];
        while ( l-- ) {
            ret[ l ] = this[ l ];
        }
        return ret;
    }
} );

Object.defineProperty( Uint16Array.prototype, "toArray", {
    /**
     * @this {Uint16Array}
     */
    value: function() {
        var l = this.length;
        var ret = [];
        while ( l-- ) {
            ret[ l ] = this[ l ];
        }
        return ret;
    }
} );
