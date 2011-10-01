//JSHint Options
var options = {
    browser    :  true,
    curly      :  true,
    devel      :  true,
    es5        :  true,
    immed      :  true,
    jquery     :  true,
    newcap     :  true,
    noarg      :  true,
    noempty    :  true,
    proto      :  true,
    regexdash  :  true,
    trailing   :  true,
    undef      :  true
}

var JSHINT = require( './jshint' ).JSHINT;
var fs = require( 'fs' );

var files = fs.readFileSync( __dirname + '/files.list', 'utf8' ).split( '\n' ).filter( function( file ) {
    return file;
} ).map( function( file ) {
    return file.trim();
} );

var root = '../src/';
var debugRegExp = /\/\*DEBUG\*\/(.|\n|\r)*?\/\*DEBUG_END\*\//g;

var lintFree = true;
var res = '';
files.forEach( function( file ) {
    var source = fs.readFileSync( __dirname + '/' + root + file, 'utf8' );
    if ( JSHINT( source, options ) ) {
        res += source;
    }
    else {
        JSHINT.errors.forEach( function( error ) {
            console.log( file + ': line ' + error.line + ', col ' + error.character + ', ' + error.reason );
        } );
        lintFree = false;
    }
} );
//res = "'use strict';\n" + res;

if ( lintFree ) {
    console.log( 'Lint Free!' );
    console.log( 'Building..' );
    fs.writeFileSync( __dirname + '/final-engine-debug.js', res );
    res = res.replace( debugRegExp, '' );
    fs.writeFileSync( __dirname + '/final-engine.js', res );
}
else {
    console.log( 'Please fix these errors before building' );
}
