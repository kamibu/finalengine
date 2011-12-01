/*global
    UUID: false,
    Request: false
*/

/**
 * @class
 *
 * Class for adding HTML and CSS.
 *
 * @constructor
 */
function UIComponent() {
    this.id = UUID.generateCanonicalForm();
}

UIComponent.prototype = {
    /**
     * Attaches a CSS file to the HTML document.
     * @param {String} href.
     */
    attachCSS: function( href ) {
        var link = document.createElement( 'link' );
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild( link );
    },
    /**
     * Calls callback with a &lt;div&gt; tag containing the HTML defined in the url.
     *
     * The callback is passed a HTMLElement instance, that can be added somewhere in the HTML document.
     *
     * <code>
     * new UIComponent().loadHTML( "frontend/menu.html", function( menuTag ) {
     *     document.body.appendChild( menuTag );
     * } );
     </code>
     *
     * @param {String} url
     * @param {Function} callback
     */
    loadHTML: function( url, callback ) {
        var self = this;
        Request.get( url, {}, function( data ) {
            var element = document.createElement( 'div' );
            element.innerHTML = data;
            callback( element );
        } );
    }
};
