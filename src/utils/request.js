Request = {
    send: function( method, url, callback ) {
        var v = new XMLHttpRequest();
        v.open( method, url );
        v.onreadystatechange = function() {
            if ( v.readyState == 4 ) {
                callback( v.responseText );
            }
        };
        v.send();
    },
    get: function( url, callback ) {
        this.send( 'GET', url, callback );
    },
    post: function( url, callback ) {
        this.send( 'GET', url, callback );
    }
};
