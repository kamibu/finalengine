var http = require( 'http' );

http.createServer( function( req, res ) {
    console.log( 'Request' );

    res.writeHead( 200, { 
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
    } );
    var data = '';
    req.on( 'data', function( chunk ) {
        data += chunk;
    } ).on( 'end', function() {
        data = unescape( data );
        var json = JSON.parse( data.substring( data.indexOf( '{' ), data.lastIndexOf( '}' ) + 1 ) );
        var fs = require( 'fs' );
        
        for ( var objectName in json.library ) {
            var object = json.library[ objectName ];
            var file = {
                library: {},
                object: objectName
            }
            file.library[ objectName ] = object;
            fs.writeFileSync( objectName + '.json', JSON.stringify( file ) );
        }
        res.end();
    } );
} ).listen( 5000, "127.0.0.1" );

console.log('Server running at http://127.0.0.1:5000/');


