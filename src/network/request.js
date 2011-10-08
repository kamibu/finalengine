/**
 * @constructor
 *
 */
function Request() {
}


/**
 * @static
 */
Request.send = function( method, url, data, callback ) {
    if ( typeof data === 'function' ) {
        callback = data;
        data = null;
    }
    var formData = new FormData();
    if ( data ) {
        for ( var field in data ) {
            formData.append( field, data[ field ] );
        }
    }
    var v = new XMLHttpRequest();
    v.open( method, url );
    if ( callback ) {
        v.onreadystatechange = function() {
            if ( v.readyState == 4 ) {
                callback( v.responseText );
            }
        };
    }
    v.send( formData );
};

/**
 * @static
 */
Request.get = function( url, data, callback ) {
    Request.send( 'GET', url, data, callback );
};

/**
 * @static
 */
Request.post = function( url, data, callback ) {
    Request.send( 'POST', url, data, callback );
};
