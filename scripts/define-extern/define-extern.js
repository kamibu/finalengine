if ( process.argv.length != 3 ) {
    console.log( 'Usage: node ' + __filename + ' source.js' );
    return;
}
var filename = process.argv[ 2 ];
var fs = require( 'fs' );

var source = fs.readFileSync( filename, 'utf-8' );
var globals = fs.readFileSync(
    'defined-globals',
    'utf-8'
).split( '\n' ).map(
    function ( x ) {
        return x.trim();
    }
).filter(
    function ( x ) {
        return x != '';
    }
).filter(
    function ( x ) {
        var r = new RegExp( "\\b" + x + "\\b" );
        return r.test( source );
    }
).filter(
    function ( x ) {
        return x.toLowerCase() != filename.split( '/' ).pop().split( '.js' )[ 0 ];
    }
);

if ( !globals.length ) {
    return;
}

source = '// extern\nvar ' + globals.join( ', ' ) + ';\n\n' + source;

fs.writeFileSync( filename, source );
// console.log( source );
