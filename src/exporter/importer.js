/*jshint evil: true */

function Importer( resourcePath ) {
    if ( resourcePath[ resourcePath.length - 1 ] !== '/'  ){ 
        resourcePath += '/';
    }
    this.resourcePath = resourcePath;
    this.cache = {};
}

Importer.prototype[ 'import' ] = function( asset, callback ) {
    if ( this.cache[ asset ] ) {
        callback( this.cache[ asset ] );
    }
    else {
        Request.get( this.resourcePath + asset, function( data ) {
            data = JSON.parse( data );
            var object = data.library[ data.object ];
            //Careful with eval statements..
            if ( /[a-zA-Z_$][0-9a-zA-Z_$]*/.test( object[ 'class' ] ) ) {
                var className = eval( object[ 'class' ] );
                if ( typeof className == 'function' ) {

                }
            }
        } );
    }
};
