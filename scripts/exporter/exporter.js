var http = require( 'http' ),
    fs = require( 'fs' ),
    querystring = require( 'querystring' );

// use final engine extender
require( '../../src/js/object' );

function ExportServer() {
    http.Server.call( this );

    this.on( 'request', this.handleRequest.bind( this ) );
}

ExportServer.prototype.handleRequest = function( request, response ) {
    var self = this;

    response.writeHeader( { 'Content-type': 'text/plain' } );
    response.write( 'Hello' );
    response.end();

    var body = "";
    request.on( 'data', function( chunk ) {
        body += chunk;
    } );

    request.on( 'end', function() {
        var postVars = querystring.parse( body );
        self.save( postVars[ 'data' ] );
    } );
};

ExportServer.prototype.save = function( data ) {
    var json = JSON.parse( data );
    fs.writeFile( json.object + '.json', data );
};

ExportServer.extend( http.Server );

var server = new ExportServer();
server.listen( 1337, 'localhost' );
