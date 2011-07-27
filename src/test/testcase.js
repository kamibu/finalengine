var Testcase = function( name ) {
    this.name = name;
    this.results = {};
};

Testcase.prototype.arrayEquals = function( expected, actual ) {
    if ( expected.length != actual.length ) {
        return false;
    }
    for ( var i in expected ) {
        if ( expected[ i ] != actual[ i ] ) {
            actual[ i ] = 255;
            actual[ i + 1 ] = 0;
            actual[ i + 2 ] = 0;
            actual[ i + 3 ] = 255;
            /*
            console.log( +i, expected[ +i ], actual[ +i ] );
            console.log( +i + 1, expected[ +i + 1 ], actual[ +i + 1 ] );
            console.log( +i + 2, expected[ +i + 2 ], actual[ +i + 2 ] );
            console.log( +i + 3, expected[ +i + 3 ], actual[ +i + 3 ] );
            */
            return false;
        }
    }
    return true;
};

Testcase.prototype.equals = function( expected, actual ) {
    if ( typeof expected != typeof actual ) {
        return false;
    }
    else if ( typeof expected == "array" ) {
        return  this.arrayEquals( expected, actual );
    }
    else if ( typeof expected == "object" ) {
        for ( var i in expected ) {
            if ( !( i in actual ) ) {
                return false;
            }
            if ( !this.equals( expected[ i ], actual[ i ] ) ) {
                return false;
            }
        }
        for ( i in actual ) {
            if ( !( i in expected ) ) {
                return false;
            }
        }
        return true;
    }
    else {
        return expected == actual;
    }
};

Testcase.prototype._assert = function( result, description, label, data  ) {
    if ( !result ) {
        this.results[ this.currentMethod ].pass = false;
    }
    this.results[ this.currentMethod ].asserts.push( {
        result: result,
        description: description,
        label: label,
        data: data
    } );
    return result;
};

Testcase.prototype.assert = function( bool, description ) {
    var result = !!bool;
    return this._assert( result, description, "assert", { bool: bool } );
};

Testcase.prototype.assertFalse = function( bool, description ) {
    return this._assert( !bool, description, "assertFalse", { "bool": bool } );
};

Testcase.prototype.assertEquals = function( got, expected, description ) {
    return this._assert( this.equals( expected, got ), description, "assertEquals", {
        expected: expected,
        got: got
    } );
};

Testcase.prototype.assertType = function( obj, type, description ) {
    return this._assert( typeof obj == type, description, "assertType", {
        object: obj,
        type: type
    } );
};

Testcase.prototype.assertDOMElement = function( element, description ) {
    return this._assert( element instanceof HTMLElement, description, 'assertDOMElement', { element: element } );
};

Testcase.prototype.assertDOMTagName = function( element, tagname, description ) {
    return this._assert( element instanceof HTMLElement && element.tagName.toLowerCase() == tagname, description, 'assertDOMTagName', { element: element } );
};

Testcase.prototype.run = function( name, next ) {
    this.currentMethod = name;
    this.results[ currentMethod ] = { asserts: [], pass: true };
};
