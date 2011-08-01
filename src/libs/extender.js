/*
    Implementation of classical inheritance. I use the defineProperty method on the
    Object.prototype in order to make it non-enumerable. If set directly it breaks all
    the "for( i in obj )" loops
*/
Object.defineProperty( Function.prototype, "extend", {
    value: function( parent ) {
        for ( var method in parent.prototype ) {
            if ( method == 'constructor' ) {
                continue;
            }
            if ( this.prototype[ method ] ) {
                this.prototype[ parent.name + '_' + method ] = parent.prototype[ method ];
            }
            else {
                this.prototype[ method ] = parent.prototype[ method ];
            }
        }
    } 
} );
