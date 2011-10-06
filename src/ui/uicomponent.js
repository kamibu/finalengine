/*global UUID: false, Request: false */

function UIComponent() {
    this.id = UUID.generateCanonicalForm();
}

UIComponent.prototype = {
    attachCSS: function( href ) {
        var link = document.createElement( 'link' );
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild( link );
    },
    loadHTML: function( url, callback ) {
        var self = this;
        Request.get( url, {}, function( data ) {
            var element = document.createElement( 'div' );
            element.innerHTML = data;
            callback( element );
        } );
    }
};
