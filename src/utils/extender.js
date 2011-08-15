/*
    Implementation of classical inheritance. I use the defineProperty method on the
    Object.prototype in order to make it non-enumerable. If set directly it breaks all
    the "for( i in obj )" loops
*/
Object.defineProperty( Function.prototype, "extend", {
    value: function( parent ) {
        //Save the child prototype because it will be overwritten by the Empty function's instance
        var childPrototype = this.prototype;

        var propertiesObject = {};
        for ( var method in this.prototype ) {
            propertiesObject[ method ] = {
                value: this.prototype[ method ],
                enumerable: true
            };
        }
        this.prototype = Object.create( parent.prototype, propertiesObject );

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
            /* TODO Test if setting non-overrided parent methods on the child prototype is nessesary.
             * Only reason is for performance in method name resolution, otherwise they are already
             * available because child.prototype.__proto__ == parent.prototype
             */
            else {
                this.prototype[ method ] = parent.prototype[ method ];
            }
        }
    }
} );
