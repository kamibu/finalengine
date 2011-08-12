function Color( data ) {
    Vector3.call( this, data );
}

Color.prototype = {
    constructor: Color,
    clip: function() {
        this[ 0 ] = this[ 0 ] > 1 ? 1 : this[ 0 ] < 0 ? 0 : this[ 0 ];
        this[ 1 ] = this[ 1 ] > 1 ? 1 : this[ 1 ] < 0 ? 0 : this[ 1 ];
        this[ 2 ] = this[ 2 ] > 1 ? 1 : this[ 2 ] < 0 ? 0 : this[ 2 ];
        return this;
    },
    add: function( color ) {
        this.Vector3_add( color );
        return this.clip();
    },
    /**
     * Defines the color using a hex string in the form of 'abb4a3'
     */
    fromHex: function( hex ) {
        var r = parseInt( hex[ 0 ] + hex[ 1 ], 16 );
        var g = parseInt( hex[ 2 ] + hex[ 3 ], 16 );
        var b = parseInt( hex[ 4 ] + hex[ 5 ], 16 );
        return this.fromRGB( r, g, b );
    },
    /**
     * Defines the color using r, g, b in range 0...255
     */
    fromRGB: function( r, g, b ) {
        this.set( arguments );
        return this.scale( 1 / 255 );
    },
    /**
     * Defines the color using h, s, l:
     * @param h Color hue (0...2 pi)
     * @param r Color saturation (0...1)
     * @param l Color lightness (0...1)
     */
    fromHSL: function( h, s, l ) {
        function hueToRgb( m1, m2, hue ) {
            var v;

            if ( hue < 0 ) {
                hue += 1;
            }
            else if ( hue > 1 ) {
                hue -= 1;
            }

            if ( 6 * hue < 1 ) {
                v = m1 + (m2 - m1) * hue * 6;
            }
            else if ( 2 * hue < 1 ) {
                v = m2;
            }
            else if ( 3 * hue < 2 ) {
                v = m1 + ( m2 - m1 ) * ( 2 / 3 - hue ) * 6;
            }
            else {
                v = m1;
            }

            return v;
        }

        var m1, m2, hue;
        var r, g, b;

        if ( s === 0 ) {
            this[ 0 ] = this[ 1 ] = this[ 2 ] = l;
        }
        else {
            if ( l <= 0.5 ) {
                m2 = l * ( s + 1 );
            }
            else {
                m2 = l + s - l * s;
            }
            m1 = l * 2 - m2;
            hue = h / ( 2 * Math.PI );
            this[ 0 ] = hueToRgb( m1, m2, hue + 1 / 3 );
            this[ 1 ] = hueToRgb( m1, m2, hue );
            this[ 2 ] = hueToRgb( m1, m2, hue - 1 / 3 );
        }
    }
};

Color.extend( Vector3 );
