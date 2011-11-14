/**
 * @class
 *
 * Generates Universally Unique IDentifiers compliant to RFC-4112.
 *
 * <p>UUIDs are used for creating identifiers that are (practically) unique throughout a network.</p>
 *
 * <p>This way, network communication, especially for small sized games, can be created without
 * significant coordination from a server.</p>
 *
 * <p>To create a UUID, call the static {@link generate} method.</p>
 *
 * <code>
 * function MyConstructor() {
 *     this.uuid = UUID.generate();
 * }
 </code>
 *
 * <p>The {@link generate} method generates UUID that is in a compressed form,
 * suitable for sending through the network, and so contains unprintable characters too.</p>
 *
 * <p>If you want a printable version, you should generate a UUID in canonical form:</p>
 * <code>
 * this.uuid = UUID.generateCanonicalForm();
 </code>
 *
 * You can also convert between the forms with {@link toCanonicalForm} and {@link fromCanonicalForm}.
 */
function UUID() {
}

/**
 * Generates a compressed 128-bit UUID string.
 * @returns String
 */
UUID.generate = function() {
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
};

/**
 * Generates a UUID in canonical form.
 * @returns String
 */
UUID.generateCanonicalForm = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : ( r & 0x3 | 0x8 );
        return v.toString(16);
    } );
};

/**
 * Converts UUID to a printable version.
 * @param {String} uuid
 * @returns String
 */
UUID.toCanonicalForm = function( uuid ) {
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
};
/**
 * Converts printable version back to original (compressed) form.
 * @param {String} canonical The canonical form of a UUID.
 * @returns String UUID as a string.
 */
UUID.fromCanonicalForm = function( canonical ) {
    var s = "", i;
    canonical = canonical.replace( /-/g, '' );
    for ( i = 0; i < 16; ++i ) {
        s += String.fromCharCode( parseInt( canonical[ i * 2 ] + canonical[ i * 2 + 1 ], 16 ) );
    }
    return s;
};
