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

var debug = {
    TRACE: 0,
    WARNING: 1,
    ERROR: 2,
    log: function( level, message ) {
        console.log( message );
    }
};
