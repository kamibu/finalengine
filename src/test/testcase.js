function Testcase( name ) {
    this.name = name;
    this.reports = {};
}

Testcase.prototype.arrayEquals = function( expected, actual ) {
    if ( expected.length != actual.length ) {
        return false;
    }
    for ( var i = 0; i < expected.length; ++i ) {
        if ( expected[ i ] != actual[ i ] ) {
            return false;
        }
    }
    return true;
};

Testcase.prototype.equals = function( expected, actual ) {
    if ( typeof expected != typeof actual ) {
        return false;
    }
    else if ( Array.isArray( expected ) || expected instanceof Float32Array ) {
        if ( !Array.isArray( actual ) || !( actual instanceof Float32Array ) ) {
            return false;
        }
        return this.arrayEquals( expected, actual );
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
        this.reports[ this.currentMethod ].pass = false;
    }
    this.reports[ this.currentMethod ].asserts.push( {
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

Testcase.prototype.assertArrayEquals = function( got, expected, description ) {
    var arrayToString = function() {
        var s = "";
        var l = this.length;
        for ( i = 0; i < l; ++i ) {
            s += this[ i ];
            if ( s != l - 1 ) {
                s += ",";
            }
        }
        return s;
    };

    if ( got instanceof Float32Array && !got.hasOwnProperty( "toString" ) ) {
        Object.defineProperty( got, "toString", {
            value: arrayToString.bind( got ),
            enumerable: false
        } );
    }
    if ( expected instanceof Float32Array && !expected.hasOwnProperty( "toString" ) ) {
        Object.defineProperty( expected, "toString", {
            value: arrayToString.bind( expected ),
            enumerable: false
        } );
    }
    return this._assert( this.arrayEquals( expected, got ), description, "assertArrayEquals", {
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

Testcase.prototype.runMethod = function( name ) {
    this.currentMethod = name;
    this.reports[ this.currentMethod ] = { asserts: [], pass: true, name: name };
    this[ name ]();
};

Testcase.prototype.run = function() {
    for ( var i in this ) {
        if ( !this.hasOwnProperty( i ) || typeof this[ i ] != "function" ) {
            continue;
        }
        this.runMethod( i );
    }
};
