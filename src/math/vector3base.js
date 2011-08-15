var Vector3Base;

( function () {
    // ugly stuff here

    var Vector3Array = function( data ) {
        var ret = new Array( 3 );
        ret[ '__proto__' ] = this.constructor.prototype;
        ret.data = ret;

        if ( data ) {
            ret.set( data );
        }
        else {
            ret.set( [ 0, 0, 0 ] );
        }
        return ret;
    };

    Vector3Array.prototype.toString = function() {
        return this.join( ',' );
    };

    Vector3Array.prototype.subarray = Array.prototype.slice;
    Vector3Array.extend( Array );

    var Vector3Float32Array = function( data ) {
        var ret = new Float32Array( 3 );
        ret[ '__proto__' ] = this.constructor.prototype;
        ret.data = ret;
        if ( data ) {
            ret.set( data );
        }
        return ret;
    };

    Vector3Float32Array.extend( Float32Array );

    // check to see if we can modify the instance of a Float32Array
    var testSubject = new Float32Array();
    var a = {};
    testSubject[ '__proto__' ] = a;
    if ( testSubject[ '__proto__' ] === a ) {
        Vector3Base = Vector3Float32Array;
    }
    else {
        Vector3Base = Vector3Array;
    }
}() );
