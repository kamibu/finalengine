function assert( condition, description ) {
    if ( !condition ) {
        throw description;
    }
}

function assertIn( value ) {
    for ( var i = 1; i < arguments.length - 1; ++i ) {
        if ( value == arguments[ i ] ) {
            return;
        }
    }
    throw arguments[ arguments.length - 1 ];
    
}

function debug_log( level, message ){
    console.log( message );    
}
