/*
    Implementation of classical inheritance. I use the defineProperty method on the
    Object.prototype in order to make it non-enumerable. If set directly it breaks all
    the "for( i in obj )" loops
*/
Object.defineProperty( Function.prototype, "extend", {
    value: function() {
        var method, l = arguments.length;
        while ( l-- ) {
            var parent = arguments[ l ];
            var childPrototype = this.prototype;

            //Continue with the overriding handling
            for ( method in parent.prototype ) {
                //Every prototype has the property constructor. No need to override.
                if ( method == 'constructor' ) {
                    continue;
                }
                /* If a parent method is overrided provide a way to call it by setting
                 * the ParentClass_overridedMethod method on child's prototype
                 */
                if ( childPrototype[ method ] ) {
                    this.prototype[ parent.name + '_' + method ] = parent.prototype[ method ];
                }
                else {
                    this.prototype[ method ] = parent.prototype[ method ];
                }
            }
        }

        var propertiesObject = {};
        for ( method in this.prototype ) {
            propertiesObject[ method ] = {
                value: this.prototype[ method ],
                enumerable: true
            };
        }
        this.prototype = Object.create( arguments[ 0 ].prototype, propertiesObject );
    }
} );
