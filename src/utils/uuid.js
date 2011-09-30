/** @class
 *
 * Generates Universally Unique IDentifiers compliant to RFC-4112.
 */
var UUID = {
    /**
     * @returns 128-bit UUID string.
     */
    generate: function() {
        var s = "", i, high, low;
        for ( i = 0; i < 16; ++i ) {
            if ( i == 6 ) {
                low = 0x40;
                high = 0x4F;
            }
            else if ( i == 8 ) {
                low = 0x80;
                high = 0xBF;
            }
            else {
                low = 0;
                high = 256;
            }
            s += String.fromCharCode( Math.floor( Math.random() * ( high - low ) + low ) );
        }
        return s;
    },
    generateCanonicalForm: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : ( r & 0x3 | 0x8 );
            return v.toString(16);
        } );
    },
    /**
     * Converts UUID to a printable version.
     * @param uuid The generated uuid.
     * @returns 36 character string (32 0-f and 4 hyphens).
     */
    toCanonicalForm: function( uuid ) {
        var canonical = "", hex;
        for ( var i = 0; i < 16; ++i ) {
            if ( i == 4 || i == 6 || i == 8 || i == 10 ) {
                canonical += "-";
            }
            hex = uuid.charCodeAt( i ).toString( 16 );
            if ( hex.length == 1 ) {
                hex = "0" + hex;
            }
            canonical += hex;
        }
        return canonical;
    },
    /**
     * Converts printable version back to original (compressed) form.
     * @param canonical The canonical form of a UUID.
     * @returns 128-bit UUID as a string.
     */
    fromCanonicalForm: function( canonical ) {
        var s = "", i;
        canonical = canonical.replace( /-/g, '' );
        for ( i = 0; i < 16; ++i ) {
            s += String.fromCharCode( parseInt( canonical[ i * 2 ] + canonical[ i * 2 + 1 ], 16 ) );
        }
        return s;
    }
};
