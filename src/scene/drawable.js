function Drawable() {
    Node.call( this );
    this.mesh = null;
}

Drawable.prototype = {
    onBeforeRender: function( camera ) {
        
    }
};

Drawable.extend( Node );
