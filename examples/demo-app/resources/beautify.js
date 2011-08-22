var uglyJSON = require( 'fs' ).readFileSync( process.argv[ 2 ], 'utf-8' );
console.log( JSON.stringify( JSON.parse( uglyJSON ), null, 4 ) );
