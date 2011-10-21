/**
 * @class
 *
 * Class for convenient HTTP requests.
 */
function Request() {
}


/**
 * @param {String} method
 * @param {String} url
 * @param {Object} data
 * @param {Function} callback
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
 * @param {String} url
 * @param {Object} data
 * @param {Function} callback
 */
Request.get = function( url, data, callback ) {
    Request.send( 'GET', url, data, callback );
};

/**
 * @param {String} url
 * @param {Object} data
 * @param {Function} callback
 */
Request.post = function( url, data, callback ) {
    Request.send( 'POST', url, data, callback );
};
