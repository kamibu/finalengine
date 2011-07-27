function assert( condition, description ) {
    if ( !condition ) {
        throw description;
    }
};

function assertIn( value ) {
    for ( var i = 1; i < arguments.length - 1; ++i ) {
        if ( value == arguments[ i ] ) {
            return;
        }
    }
    throw arguments[ arguments.length - 1 ];
    
};

function debug_log( level, message ){
    console.log( message );    
};
Object.defineProperty( Number.prototype, "isPowerOfTwo", {
    value: function() {
         return ( this > 0 ) && ( this & ( this - 1 ) ) == 0;
    } 
} );
Request = {
    send: function( method, url, callback ) {
        var v = new XMLHttpRequest();
        v.open( method, url );
        v.onreadystatechange = function() {
            if ( v.readyState == 4 ) {
                callback( v.responseText );
            }
        }
        v.send();
    },
    get: function( url, callback ) {
        this.send( 'GET', url, callback );
    },
    post: function( url, callback ) {
        this.send( 'GET', url, callback );
    }
}
function UUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : ( r & 0x3 | 0x8 );
        return v.toString(16);
    } );
}
/*
    Implementation of classical inheritance. I use the defineProperty method on the
    Object.prototype in order to make it non-enumerable. If set directly it breaks all
    the "for( i in obj )" loops
*/
Object.defineProperty( Function.prototype, "extend", {
    value: function( parent ) {
        for ( method in parent.prototype ) {
            if ( this.prototype[ method ] ) {
                this.prototype[ parent.name + '_' + method ] = parent.prototype[ method ];
            }
            else {
                this.prototype[ method ] = parent.prototype[ method ];
            }
        }
    } 
} );
/* see node.js EventEmitter */
function EventEmitter() {
    this._events_ = [];
    this.on = function( name, action ) {
        if ( !( name in this._events_ ) ) {
            this._events_[ name ] = [];
        }
        this._events_[ name ].push( action );
    };
    this.once = function( name, action ) {
        action.once = true;
        this.on( name, action );
    };
    this.clearListeners = function( name ) {
        this._events_[ name ] = [];
    };
    this.emit = function( name ) {
        var params = Array.prototype.slice.call( arguments, 1 );
        var events = this._events_[ name ];
        if ( !events ) {
            return;
        }
        // do not change to loop based on length
        // because some indexes of the array are undefined
        // due to the splice on removeListener
        for ( var i in events ) {
            var action = events[ i ];
            action.apply( this, params );
            if ( action.once ) {
                events.splice( i, 1 );
                if ( !events.length ) {
                    break;
                }
                --i;
            }
        }
    };
    this.removeListener = function( name, callback ) {
        if ( !this._events_[ name ] ) {
            return false;
        }
        var actionlist = this._events_[ name ];
        for ( var i = 0, l = actionlist.length; i < l; i++ ) {
            if ( actionlist[ i ] === callback ) {
                actionlist.splice( i, 1 );
                return true;
            }
        }
        return false;
    };
}

function EventWaiter() {
    var numWaiting = 0;
    this.waitMore = function() {
        ++numWaiting;
    };
    this.waitLess = function( description ) {
        --numWaiting;
        this.emit( 'emit', description );
        if ( !numWaiting ) {
            this.emit( 'complete' );
        }
    };
    this.wait = function( obj, name, description, progressevent ) {
        this.waitMore();
        var that = this;
        obj.once( name, function() {
            that.waitLess( description );
        } ); 
        if ( progressevent ) {
            obj.on( progressevent, function( percentage ) {
                that.emit( 'emit', description + ' ' + percentage * 100 + '%' );
            } );
        }
    };
    this.waitFor = function( obj, name, time ) {
        time = time || 1000;
        this.waitMore();
        var that = this;
        var timeout = setTimeout( function() {
            that.waitLess();
        }, time );
        obj.once( name, function() {
            setTimeout( function() {
                that.waitLess();
                clearTimeout( timeout );
            }, 0 ); // be sure other callbacks are called first
        } );
    };
    this.waitWithTimeout = function( obj, name, timeoutCallback ) {
        this.waitMore();
        var that = this;
        var timeout = setTimeout( function() {
            timeoutCallback();
            that.waitLess();
        }, 1000 );
        obj.once( name, function() {
            setTimeout( function() {
                that.waitLess();
                clearTimeout( timeout );
            }, 0 ); // be sure other callbacks are called first
        } );
    };
    this.isWaiting = function() {
        return numWaiting > 0;
    };
    this.numWaiting = function() {
        return numWaiting;
    };
}
EventWaiter.extend( EventEmitter );

function EventChain() {
    var chain = [];
    var running = false;
    this.autostart = true;
    this.push = function( f ) {
        if ( f instanceof EventChain ) {
            chain.push( function( callback ) {
                f.once( 'complete', callback );
                f.start();
            } );
        }
        else {
            chain.push( f );
        }
        if ( !running && this.autostart ) {
            this.next();
        }
    };
    this.next = function() {
        var that = this;
        if ( !chain.length ) {
            setTimeout( function() {
                that.emit( 'complete' );
            }, 0 );
            running = false;
            return false;
        }
        running = true;
        ( chain.shift( arguments ) )( function() {
            that.emit( 'one' );
            that.next.apply( that, arguments )
        } );
    };
    this.start = function() {
        this.next();
    };
    this.isRunning = function() {
        return running;
    };
}
EventChain.extend( EventEmitter );
function Transform() {
    this.position = Vector3();
    this.orientation = Quaternion();
    this.scale = 1;
    this.invalidate();
    this.matrix = Matrix4();
    this.needsUpdate = false;
}

Transform.prototype = {
    set: function( transform ) {
        this.position.set( transform.position );
        this.orientation.set( transform.orientation );
        this.scale = transform.scale;
        this.invalidate();
        return this;
    },
    setPosition: function( position ) {
        this.position.set( position );
        this.invalidate();
        return this;
    },
    setOrientation: function( orientation ) {
        this.orientation.set( orientation );
        this.invalidate();
        return this;
    },
    setScale: function( scale ) {
        this.scale = scale;
        this.invalidate();
        return this;
    },
    getPosition: function( dest ) {
        if ( !dest ) {
            dest = Vector3();
        }
        return dest.set( this.position );
    },
    getOrientation: function( dest ) {
        if ( !dest ) {
            dest = Quaternion();
        }
        return dest.set( this.orientation );
    },
    getScale: function() {
        return this.scale;
    },
    setIdentity: function() {
        this.position.set( [ 0, 0, 0 ] );
        this.orientation.set( [ 0, 0, 0, 1 ] );
        this.scale = 1;
        return this;
    },
    combineWith: function( transform ) {
        this.scale *= transform.scale;

        var p = this.orientation.multiplyVec3( transform.getPosition( TempVars.vec3a ) );
        p.scale( this.scale );
        this.position.add( p );
        this.orientation.multiply( transform.orientation );
        this.invalidate();

        return this;
    },
    getMatrix: function( dest ) {
        if ( !dest ) {
            dest = Matrix4();
        }
        if ( this.needsUpdate  ) {
            this.update();
        }
        return dest.set( this.matrix );
    },
    getInverseMatrix: function( dest ) {
        if ( !dest ) {
            dest = Matrix4();
        }
        this.orientation.toMatrix4( dest ).transpose();
        //Translation part rotated by the transposed 3x3 matrix
        var x = -this.position[ 0 ];
        var y = -this.position[ 1 ];
        var z = -this.position[ 2 ];
        dest[ 12 ] = x * dest[ 0 ] + y * dest[ 4 ] + z * dest[ 8 ];
        dest[ 13 ] = x * dest[ 1 ] + y * dest[ 5 ] + z * dest[ 9 ];
        dest[ 14 ] = x * dest[ 2 ] + y * dest[ 6 ] + z * dest[ 10 ];
        return dest;
    },
    update: function() {
        var mat = this.matrix;
        this.orientation.toMatrix4( mat );
        if ( this.scale != 1 ) {
            var s = this.scale;
            mat[ 0 ] *= s;
            mat[ 1 ] *= s;
            mat[ 2 ] *= s;
            mat[ 4 ] *= s;
            mat[ 5 ] *= s;
            mat[ 6 ] *= s;
            mat[ 8 ] *= s;
            mat[ 9 ] *= s;
            mat[ 10 ] *= s;
        }
        var pos = this.position;
        mat[ 12 ] = pos[ 0 ];
        mat[ 13 ] = pos[ 1 ];
        mat[ 14 ] = pos[ 2 ];
        this.needsUpdate = false;
    },
    invalidate: function() {
        this.needsUpdate = true;
    }
}
function Matrix4( data ) {
    var ret = new Float32Array( 16 );
    ret.__proto__  = Matrix4.prototype;
    if ( data ) {
        ret.set( data );
    }
    return ret;
}

Matrix4.prototype = {
    identity: function() {
        this[ 0 ] = 1;
        this[ 1 ] = 0;
        this[ 2 ] = 0;
        this[ 3 ] = 0;

        this[ 4 ] = 0;
        this[ 5 ] = 1;
        this[ 6 ] = 0;
        this[ 7 ] = 0;

        this[ 8 ] = 0;
        this[ 9 ] = 0;
        this[ 10 ] = 1;
        this[ 11 ] = 0;

        this[ 12 ] = 0;
        this[ 13 ] = 0;
        this[ 14 ] = 0;
        this[ 15 ] = 1;
        return this;
    },
    set: function( data ) {
        this[ 0 ] = data[ 0 ];
        this[ 1 ] = data[ 1 ];
        this[ 2 ] = data[ 2 ];
        this[ 3 ] = data[ 3 ];
        this[ 4 ] = data[ 4 ];
        this[ 5 ] = data[ 5 ];
        this[ 6 ] = data[ 6 ];
        this[ 7 ] = data[ 7 ];
        this[ 8 ] = data[ 8 ];
        this[ 9 ] = data[ 9 ];
        this[ 10 ] = data[ 10 ];
        this[ 11 ] = data[ 11 ];
        this[ 12 ] = data[ 12 ];
        this[ 13 ] = data[ 13 ];
        this[ 14 ] = data[ 14 ];
        this[ 15 ] = data[ 15 ];
        return this;
    },
    transpose: function(){
        var a01 = this[ 1 ], 
            a02 = this[ 2 ], 
            a03 = this[ 3 ],
            a12 = this[ 6 ], 
            a13 = this[ 7 ],
            a23 = this[ 11 ];
        
        this[ 1 ] = this[ 4 ];
        this[ 2 ] = this[ 8 ];
        this[ 3 ] = this[ 12 ];
        this[ 4 ] = a01;
        this[ 6 ] = this[ 9 ];
        this[ 7 ] = this[ 13 ];
        this[ 8 ] = a02;
        this[ 9 ] = a12;
        this[ 11 ] = this[ 14 ];
        this[ 12 ] = a03;
        this[ 13 ] = a13;
        this[ 14 ] = a23;
        return this;
    },
    determinant: function() {
        // Cache the matrix values (makes for huge speed increases!)
        var a00 = this[ 0 ], a01 = this[ 1 ], a02 = this[ 2 ], a03 = this[ 3 ],
            a10 = this[ 4 ], a11 = this[ 5 ], a12 = this[ 6 ], a13 = this[ 7 ],
            a20 = this[ 8 ], a21 = this[ 9 ], a22 = this[ 10 ], a23 = this[ 11 ],
            a30 = this[ 12 ], a31 = this[ 13 ], a32 = this[ 14 ], a33 = this[ 15 ];

        return  a30*a21*a12*a03 - a20*a31*a12*a03 - a30*a11*a22*a03 + a10*a31*a22*a03 +
                        a20*a11*a32*a03 - a10*a21*a32*a03 - a30*a21*a02*a13 + a20*a31*a02*a13 +
                        a30*a01*a22*a13 - a00*a31*a22*a13 - a20*a01*a32*a13 + a00*a21*a32*a13 +
                        a30*a11*a02*a23 - a10*a31*a02*a23 - a30*a01*a12*a23 + a00*a31*a12*a23 +
                        a10*a01*a32*a23 - a00*a11*a32*a23 - a20*a11*a02*a33 + a10*a21*a02*a33 +
                        a20*a01*a12*a33 - a00*a21*a12*a33 - a10*a01*a22*a33 + a00*a11*a22*a33
    },
    inverse: function() {
        // Cache the matrix values (makes for huge speed increases!)
        var a00 = this[ 0 ], a01 = this[ 1 ], a02 = this[ 2 ], a03 = this[ 3 ];
        var a10 = this[ 4 ], a11 = this[ 5 ], a12 = this[ 6 ], a13 = this[ 7 ];
        var a20 = this[ 8 ], a21 = this[ 9 ], a22 = this[ 10 ], a23 = this[ 11 ];
        var a30 = this[ 12 ], a31 = this[ 13 ], a32 = this[ 14 ], a33 = this[ 15 ];
        
        var b00 = a00 * a11 - a01 * a10;
        var b01 = a00 * a12 - a02 * a10;
        var b02 = a00 * a13 - a03 * a10;
        var b03 = a01 * a12 - a02 * a11;
        var b04 = a01 * a13 - a03 * a11;
        var b05 = a02 * a13 - a03 * a12;
        var b06 = a20 * a31 - a21 * a30;
        var b07 = a20 * a32 - a22 * a30;
        var b08 = a20 * a33 - a23 * a30;
        var b09 = a21 * a32 - a22 * a31;
        var b10 = a21 * a33 - a23 * a31;
        var b11 = a22 * a33 - a23 * a32;
        
        // Calculate the determinant (inlined to avoid double-caching)
        var invDet = 1 / ( b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06 );
        
        this[ 0 ] = ( a11 * b11 - a12 * b10 + a13 * b09 ) * invDet;
        this[ 1 ] = ( -a01 * b11 + a02 * b10 - a03 * b09 ) * invDet;
        this[ 2 ] = ( a31 * b05 - a32 * b04 + a33 * b03 ) * invDet;
        this[ 3 ] = ( -a21 * b05 + a22 * b04 - a23 * b03 ) * invDet;
        this[ 4 ] = ( -a10 * b11 + a12 * b08 - a13 * b07 ) * invDet;
        this[ 5 ] = ( a00 * b11 - a02 * b08 + a03 * b07 ) * invDet;
        this[ 6 ] = ( -a30 * b05 + a32 * b02 - a33 * b01 ) * invDet;
        this[ 7 ] = ( a20 * b05 - a22 * b02 + a23 * b01 ) * invDet;
        this[ 8 ] = ( a10 * b10 - a11 * b08 + a13 * b06 ) * invDet;
        this[ 9 ] = ( -a00 * b10 + a01 * b08 - a03 * b06 ) * invDet;
        this[ 10] = ( a30 * b04 - a31 * b02 + a33 * b00 ) * invDet;
        this[ 11] = ( -a20 * b04 + a21 * b02 - a23 * b00 ) * invDet;
        this[ 12] = ( -a10 * b09 + a11 * b07 - a12 * b06 ) * invDet;
        this[ 13] = ( a00 * b09 - a01 * b07 + a02 * b06 ) * invDet;
        this[ 14] = ( -a30 * b03 + a31 * b01 - a32 * b00 ) * invDet;
        this[ 15] = ( a20 * b03 - a21 * b01 + a22 * b00 ) * invDet;
        return this;
    },
    multiply: function( matrix ) {
        // Cache the matrix values (makes for huge speed increases!)
        var a00 = this[ 0 ], a01 = this[ 1 ], a02 = this[ 2 ], a03 = this[ 3 ];
        var a10 = this[ 4 ], a11 = this[ 5 ], a12 = this[ 6 ], a13 = this[ 7 ];
        var a20 = this[ 8 ], a21 = this[ 9 ], a22 = this[ 10 ], a23 = this[ 11 ];
        var a30 = this[ 12 ], a31 = this[ 13 ], a32 = this[ 14 ], a33 = this[ 15 ];
        
        var b00 = matrix[ 0 ], b01 = matrix[ 1 ], b02 = matrix[ 2 ], b03 = matrix[ 3 ];
        var b10 = matrix[ 4 ], b11 = matrix[ 5 ], b12 = matrix[ 6 ], b13 = matrix[ 7 ];
        var b20 = matrix[ 8 ], b21 = matrix[ 9 ], b22 = matrix[ 10 ], b23 = matrix[ 11 ];
        var b30 = matrix[ 12 ], b31 = matrix[ 13 ], b32 = matrix[ 14 ], b33 = matrix[ 15 ];
        
        this[ 0 ] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
        this[ 1 ] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
        this[ 2 ] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
        this[ 3 ] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
        this[ 4 ] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
        this[ 5 ] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
        this[ 6 ] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
        this[ 7 ] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
        this[ 8 ] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
        this[ 9 ] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
        this[ 10 ] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
        this[ 11 ] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
        this[ 12 ] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
        this[ 13 ] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
        this[ 14 ] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
        this[ 15 ] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;

        return this;
    },
    multiplyVector3: function( vector ) {
        var x = vector[ 0 ], y = vector[ 1 ], z = vector[ 2 ];

        vector[ 0 ] = this[ 0 ] * x + this[ 4 ] * y + this[ 8 ] * z + this[ 12 ];
        vector[ 1 ] = this[ 1 ] * x + this[ 5 ] * y + this[ 9 ] * z + this[ 13 ];
        vector[ 2 ] = this[ 2 ] * x + this[ 6 ] * y + this[ 10 ] * z + this[ 14 ];
        return vector;
    },
    multiplyVector4: function( vector ) {
        var x = vector[ 0 ], y = vector[ 1 ], z = vector[ 2 ], w = vector[ 3 ];
        
        vector[ 0 ] = this[ 0 ] * x + this[ 4 ] * y + this[ 8 ] * z + this[ 12 ] * w;
        vector[ 1 ] = this[ 1 ] * x + this[ 5 ] * y + this[ 9 ] * z + this[ 13 ] * w;
        vector[ 2 ] = this[ 2 ] * x + this[ 6 ] * y + this[ 10 ] * z + this[ 14 ] * w;
        vector[ 3 ] = this[ 3 ] * x + this[ 7 ] * y + this[ 11 ] * z + this[ 15 ] * w;
        
        return vector;
    },
    frustrum: function( left, right, bottom, top, near, far ) {
        var rl = ( right - left );
        var tb = ( top - bottom );
        var fn = ( far - near );
        this[ 0 ] = ( near * 2 ) / rl;
        this[ 1 ] = 0;
        this[ 2 ] = 0;
        this[ 3 ] = 0;
        this[ 4 ] = 0;
        this[ 5 ] = ( near * 2 ) / tb;
        this[ 6 ] = 0;
        this[ 7 ] = 0;
        this[ 8 ] = ( right + left ) / rl;
        this[ 9 ] = ( top + bottom ) / tb;
        this[ 10 ] = -( far + near ) / fn;
        this[ 11 ] = -1;
        this[ 12 ] = 0;
        this[ 13 ] = 0;
        this[ 14 ] = -( far * near * 2 ) / fn;
        this[ 15 ] = 0;
        return this;
    },
    perspective: function( fovy, aspect, near, far ) {
        var top = near * Math.tan( fovy * Math.PI / 360.0 );
        var right = top * aspect;
        return this.frustum( -right, right, -top, top, near, far );
    },
    ortho: function( left, right, bottom, top, near, far ) {
        var rl = ( right - left );
        var tb = ( top - bottom );
        var fn = ( far - near );
        this[ 0 ] = 2 / rl;
        this[ 1 ] = 0;
        this[ 2 ] = 0;
        this[ 3 ] = 0;
        this[ 4 ] = 0;
        this[ 5 ] = 2 / tb;
        this[ 6 ] = 0;
        this[ 7 ] = 0;
        this[ 8 ] = 0;
        this[ 9 ] = 0;
        this[ 10 ] = -2 / fn;
        this[ 11 ] = 0;
        this[ 12 ] = -( left + right ) / rl;
        this[ 13 ] = -( top + bottom ) / tb;
        this[ 14 ] = -( far + near ) / fn;
        this[ 15 ] = 1;
    },
    clone: function( dest ) {
        if ( !dest ) {
            dest = Matrix4();
        }
        return dest.set( this );
    }
};

Matrix4.prototype.__proto__ = Float32Array.prototype;
function Vector3( data ) {
    var ret = new Float32Array( 3 );
    ret.__proto__  = Vector3.prototype;
    if ( data ) {
        ret.set( data );
    }
    return ret;
}

Vector3.prototype = {
    set: function( data ) {
        this[ 0 ] = data[ 0 ];
        this[ 1 ] = data[ 1 ];
        this[ 2 ] = data[ 2 ];
        return this;
    },
    add: function( vector ) {
        this[ 0 ] += vector[ 0 ];
        this[ 1 ] += vector[ 1 ];
        this[ 2 ] += vector[ 2 ];
        return this;
    },
    subtract: function( vector ) {
        this[ 0 ] -= vector[ 0 ];
        this[ 1 ] -= vector[ 1 ];
        this[ 2 ] -= vector[ 2 ];
        return this;
    },
    negate: function() {
        this[ 0 ] = -this[ 0 ];
        this[ 1 ] = -this[ 1 ];
        this[ 2 ] = -this[ 2 ];
        return this;
    },
    scale: function( factor ) {
        this[ 0 ] *= factor;
        this[ 1 ] *= factor;
        this[ 2 ] *= factor;
        return this;
    },
    normalize: function() {
        var x = this[ 0 ], y = this[ 1 ], z = this[ 2 ];
        var len = Math.sqrt( x * x + y * y + z * z);
        
        if ( !len ) {
            this[ 0 ] = 0;
            this[ 1 ] = 0;
            this[ 2 ] = 0;
            return this;
        }
        
        len = 1 / len;
        this[ 0 ] = x * len;
        this[ 1 ] = y * len;
        this[ 2 ] = z * len;
        return this;
    },
    cross: function( vector ) {
        var x = this[ 0 ], y = this[ 1 ], z = this[ 2 ];
        var x2 = vector[ 0 ], y2 = vector[ 1 ], z2 = vector[ 2 ];
        
        this[ 0 ] = y * z2 - z * y2;
        this[ 1 ] = z * x2 - x * z2;
        this[ 2 ] = x * y2 - y * x2;
        return this;
    },
    length: function() {
        var x = this[ 0 ], y = this[ 1 ], z = this[ 2 ];
        return Math.sqrt( x * x + y * y + z * z);
    },
    length2: function() {
        var x = this[ 0 ], y = this[ 1 ], z = this[ 2 ];
        return x * x + y * y + z * z;
    },
    dot: function( vector ) {
        return this[ 0 ] * vector[ 0 ] + this[ 1 ] * vector[ 1 ] + this[ 2 ] * vector[ 2 ];
    },
    clone: function( dest ) {
        if ( !dest ) {
            dest = Vector3();
        }
        return dest.set( this );
    }
}

Vector3.prototype.__proto__ = Float32Array.prototype;
function Quaternion( data ) {
    var ret = new Float32Array( 4 );
    ret[ 3 ] = 1;

    ret.__proto__  = Quaternion.prototype;
    if ( data ) {
        ret.set( data );
    }
    return ret;
}

Quaternion.prototype = {
    set: function( data ) {
        this[ 0 ] = data[ 0 ];
        this[ 1 ] = data[ 1 ];
        this[ 2 ] = data[ 2 ];
        this[ 3 ] = data[ 3 ];
        return this;
    },
    setEuler: function( yaw, pitch, roll ) {
        yaw *= 0.5;
        pitch *= 0.5;
        roll *= 0.5;
        var cos = Math.cos;
        var sin = Math.sin;
        var cosYaw = cos( yaw );
        var sinYaw = sin( yaw );
        var cosPitch = cos( pitch );
        var sinPitch = sin( pitch );
        var cosRoll = cos( roll );
        var sinRoll = sin( roll );
        this[ 0 ] = cosRoll * sinPitch * cosYaw + sinRoll * cosPitch * sinYaw;
        this[ 1 ] = cosRoll * cosPitch * sinYaw - sinRoll * sinPitch * cosYaw;
        this[ 2 ] = sinRoll * cosPitch * cosYaw - cosRoll * sinPitch * sinYaw;
        this[ 3 ] = cosRoll * cosPitch * cosYaw + sinRoll * sinPitch * sinYaw;
        return this;
    },
    setAxisAngle: function( axis, angle ) {
        var a = TempVars.vec3a;
        a.set( axis ).normalize().scale( Math.sin( angle / 2 ) );
        this[ 0 ] = a[ 0 ];
        this[ 1 ] = a[ 1 ];
        this[ 2 ] = a[ 2 ];
        this[ 3 ] = Math.cos( angle / 2 );
        return this;
    },
    inverse: function() {
        this[ 0 ] = -this[ 0 ];
        this[ 1 ] = -this[ 1 ];
        this[ 2 ] = -this[ 2 ];
        return this;
    },
    multiply: function( quaternion ) {
        var qax = this[ 0 ], qay = this[ 1 ], qaz = this[ 2 ], qaw = this[ 3 ];
        var qbx = quaternion[ 0 ], qby = quaternion[ 1 ], qbz = quaternion[ 2 ], qbw = quaternion[ 3 ];
         
        this[ 0 ] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
        this[ 1 ] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
        this[ 2 ] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
        this[ 3 ] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
        
        return this;
    },
    multiplyVec3: function( vector ) {
        var x = vector[ 0 ], y = vector[ 1 ], z = vector[ 2 ];
        var qx = this[ 0 ], qy = this[ 1 ], qz = this[ 2 ], qw = this[ 3 ];

        // calculate this * vector
        var ix = qw * x + qy * z - qz * y;
        var iy = qw * y + qz * x - qx * z;
        var iz = qw * z + qx * y - qy * x;
        var iw = -qx * x - qy * y - qz * z;
        
        // calculate result * inverse this
        vector[ 0 ] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        vector[ 1 ] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        vector[ 2 ] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
        
        return vector;
    },
    toMatrix4: function( dest ) {
        if ( !dest ) {
            dest = Matrix4();
        }
        var x = this[ 0 ], y = this[ 1 ], z = this[ 2 ], w = this[ 3 ];

        var x2 = x + x;
        var y2 = y + y;
        var z2 = z + z;

        var xx = x * x2;
        var xy = x * y2;
        var xz = x * z2;

        var yy = y * y2;
        var yz = y * z2;
        var zz = z * z2;

        var wx = w * x2;
        var wy = w * y2;
        var wz = w * z2;

        dest[ 0 ] = 1 - ( yy + zz );
        dest[ 1 ] = xy - wz;
        dest[ 2 ] = xz + wy;
        dest[ 3 ] = 0;

        dest[ 4 ] = xy + wz;
        dest[ 5 ] = 1 - ( xx + zz );
        dest[ 6 ] = yz - wx;
        dest[ 7 ] = 0;

        dest[ 8 ] = xz - wy;
        dest[ 9 ] = yz + wx;
        dest[ 10 ] = 1 - ( xx + yy );
        dest[ 11 ] = 0;

        dest[ 12 ] = 0;
        dest[ 13 ] = 0;
        dest[ 14 ] = 0;
        dest[ 15 ] = 1;

        return dest;
    },
    clone: function( dest ) {
        if ( !dest ) {
            dest = Quaternion();
        }
        return dest.set( this );
    }
};

Quaternion.prototype.__proto__ = Float32Array.prototype;

/*Allocate some typed arrays in order to be used
  for temporary results. Creating new typed arrays
  in Javascript is slow but using them is faster
  than native arrays.
*/
var TempVars = {
    mat4a: Matrix4(),
    mat4b: Matrix4(),
    mat4c: Matrix4(),
    mat4d: Matrix4(),

//    mat3a: Matrix3(),
//    mat3b: Matrix3(),
//    mat3c: Matrix3(),

    vec3a: Vector3(),
    vec3b: Vector3(),
    vec3c: Vector3(),

    quat4a: Quaternion(),
    quat4b: Quaternion(),
    quat4c: Quaternion()
};
var UIDGenerator = function() {
    this.id = 0;
}

UIDGenerator.prototype = {
    get: function() {
        return this.id++;
    }
}
function Bounds() {
};

Bounds.prototype = { 
    findBoundingRectangle: function( vert ) { 
        var x,y;//x [ min, max ]
        x = [ 0, 0 ];
        y = [ 0, 0 ];
        for ( var i=0,l=vert.length;i<l;i++ ) {
            if ( vert[i] < x[0] ) {
                x[0] = vert[i];
            }
            if ( vert[i] > x[1] ) {
                x[1] = vert[i];
            }
            i++;
            if ( vert[i] < y[0] ) {
                y[0] = vert[i];
            }
            if ( vert[i] > y[1] ) {
                y[1] = vert[i];
            }

            i+=2;
        }
        return [ x[0], y[0], x[1], y[1] ];    
    },
    findBoundingBox : function( vert ) {
        var x,y,z;//x [ min, max ]
        x = [ 999999999999, -99999999999 ];
        y = [ 999999999999, -99999999999 ];
        z = [ 999999999999, -99999999999 ];
        
        for ( var i=0,l=vert.length;i<l;i++ ) {
            if ( vert[i] < x[0] ) {
                x[0] = vert[i];
            }
            if ( vert[i] > x[1] ) {
                x[1] = vert[i];
            }
            i++;
            if ( vert[i] < y[0] ) { 
                y[0] = vert[i];
            }
            if ( vert[i] > y[1] ) {
                y[1] = vert[i];
            }
            i++;
            if ( vert[i] < z[0] ) {
                z[0] = vert[i];
            }
            if ( vert[i] > z[1] ) {
                z[1] = vert[i];
            }
        }
        return [ [ x[0] , y[0],z[0] ], [ x[1], y[1], z[1] ] ];      
    },
    findBoundingSphere: function( vert ) {
        var maxd = 0,temp;
        for ( var i = 0, l = vert.length; i < l; i+=3 ) {
            temp = vec3.length2( [ vert[i], vert[i+1], vert[i+2] ] );
            if ( temp > maxd  ) {
                maxd = temp;        
            }
        }
        return Math.sqrt( maxd );//return radius   
    }
};

/*
 * Renderer is the central point of the graphics library.
 * It abrstacts the underlying API in some simple methods.
 * All the drawing should be made with calls to the renderer
 * and not directly. Also this is the only place that WebGL
 * calls should exist.
 */

var Renderer = function( canvas, width, height ) {
    /*
        As the renderer is running, several objects are copyied to the 
        GPU memory for fast rendering. But, as there isn't a way to know
        when the client-side objects are garbage collected we specify a
        decay time. If an object isn't used for this amount of time then
        it is destroyed.
        The decay time is specified in milliseconds.
    */
    this.decayTime = 5 * 1000;
    this.width = width || 640;
    this.height = height || 480;

    this.canvas = canvas || document.createElement( 'canvas' );
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    setInterval( this.decay.bind( this ), this.decayTime );

    /*
     * This should change to .getContext( 'webgl' ) at some point.
     */
    var gl = this.gl = this.canvas.getContext( 'experimental-webgl' );
    if ( this.gl == null ) {
        throw 'Could not initialize WebGL';
    }

    /*
     *  According to the OpenGL ES 2.0 reference, the second parameter
     *  of the functions glUniformMatrix*fv must always be false. So
     *  we are overriding the methods so that they are consistent with
     *  the paramerer format of the other uniform upload functions.
     *
     *  See http://www.khronos.org/opengles/sdk/2.0/docs/man/glUniform.xml
     */
      
    gl.mineUniformMatrix2fv = function( location, value ) { 
        gl.uniformMatrix2fv( location, false, value );
    }
    gl.mineUniformMatrix3fv = function( location, value ) { 
        gl.uniformMatrix3fv( location, false, value );
    }
    gl.mineUniformMatrix4fv = function( location, value ) { 
        gl.uniformMatrix4fv.call( gl, location, false, value );
    }
    
    /*These objects will hold references to the underlying API*/
    this.bufferObjects = {};
    this.textureObjects = {};
    this.programObjects = {};
    this.framebufferObjects = {};
    this.renderbufferObjects = {};

    this.currentShader = null;
	this.boundedBuffer = null;

    /*
     * This is the default Render state.
     */
    gl.viewport( 0, 0, this.width, this.height );
    gl.clearColor( 0, 0, 0, 1 );
    gl.clearDepth( 1 );
    gl.enable( gl.CULL_FACE );
    gl.enable( gl.DEPTH_TEST );
    gl.depthFunc( gl.LEQUAL );
    gl.enable( gl.BLEND );
    gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
};



Renderer.MAX_FRAGMENT_TEXTURE_UNITS = 1;
Renderer.MAX_VERTEX_TEXTURE_UNITS = 2;
Renderer.FLOAT_TEXTURE = 3;
    
Renderer.prototype = {
    getParameter: function( query ) {
        switch ( query ) {
            case Renderer.MAX_FRAGMENT_TEXTURE_UNITS:
                return this.gl.getParameter( this.gl.MAX_TEXTURE_IMAGE_UNITS );
            case Renderer.MAX_VERTEX_TEXTURE_UNITS:
                return this.gl.getParameter( this.gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS );
            case Renderer.FLOAT_TEXTURE:
                var ext = this.gl.getSupportedExtentions();
                for ( var i = 0; i < ext.length; i++ ) {
                    if ( ext[ i ] == 'OES_texture_float' ) {
                        return true;
                    }
                }
                return false;
        }
    },
    decay: function() {
        var now = Date.now();
        var decayTime = this.decayTime;
        var gl = this.gl;
        for ( object in this.bufferObjects ) {
            if ( now - this.bufferObjects[ object ].lastTimeUsed > decayTime ) {
                gl.deleteBuffer( this.bufferObjects[ object ] );
                delete this.bufferObjects[ object ];
            }
        }
        for ( object in this.textureObjects ) {
            if ( now - this.textureObjects[ object ].lastTimeUsed > decayTime ) {
                gl.deleteTexture( this.textureObjects[ object ] );
                delete this.textureObjects[ object ];
            }
        }
        for ( object in this.programObjects ) {
            if ( now - this.programObjects[ object ].lastTimeUsed > decayTime ) {
                gl.deleteProgram( this.programObjects[ object ] );
                delete this.programObjects[ object ];
            }
        }
    },
    /*
     * This method will create a GL buffer containing the data specified.
     * If no type is specified the buffer will be of type ARRAY_BUFFER.
     */
    createBuffer: function( buffer ) {
        var type, usage;
        switch ( buffer.type ) {
            case Buffer.ELEMENT_BUFFER:
                type = this.gl.ELEMENT_ARRAY_BUFFER;
                break;
            case Buffer.DATA_BUFFER:
                type = this.gl.ARRAY_BUFFER;
        }

        switch ( buffer.usage ) {
            case Buffer.DYNAMIC:
                usage = this.gl.DYNAMIC_DRAW;
                break;
            case Buffer.STREAM:
                usage = this.gl.STREAM_DRAW;
                break;
            case Buffer.STATIC:
                usage = this.gl.STATIC_DRAW;
                break;
        }

        var bufferObject = this.gl.createBuffer();
        this.gl.bindBuffer( type, bufferObject );
        this.gl.bufferData( type, buffer.data, usage );
        this.gl.bindBuffer( type, null );

        bufferObject.length = buffer.data.length;
        this.bufferObjects[ buffer.id ] = bufferObject;
    },
    /*
     * This method will delete a buffer previously made with createBuffer.
     * If the buffer is currently bound to some target it or there are
     * references to it it will be marked for deletion and will be deleted
     * when it is unbound and all the references are destroyed.
     */
    deleteBuffer: function( buffer ) {
        /*DEBUG*/
            //assert( !this.gl.isBuffer( this.bufferObjects[ buffer ] ), 'Illegal type. buffer must be a GL Buffer object.' );
        /*DEBUG_END*/
        this.gl.deleteBuffer( this.bufferObjects[ buffer.id ] );
        delete this.bufferObjects[ buffer.id ];
    },
	updateBuffer: function( buffer ) {
		/*DEBUG*/
            //assert( !this.gl.isBuffer( this.bufferObjects[ buffer ] ), 'Illegal type. buffer must be a GL Buffer object.' );
        /*DEBUG_END*/
		var bufferObject = this.bufferObjects[ buffer.id ];
		if ( typeof bufferObject == 'undefined' ) {
			this.createBuffer( buffer );
		}
		else if ( bufferObject.length != buffer.data.length ) {
			this.deleteBuffer( buffer );
			this.createBuffer( buffer );
		}
        else {
            var type;
            switch ( buffer.type ) {
                case Buffer.DATA_BUFFER:
                    type = this.gl.ARRAY_BUFFER;
                    break;
                case Buffer.ELEMENT_BUFFER:
                    type = this.gl.ELEMENT_BUFFER;
                    break;
            }
            this.gl.bindBuffer( type, this.bufferObjects[ buffer.id ] );
            this.gl.bufferSubData( type, 0, buffer.data );
            this.gl.bindbuffer( type, null );
        }
        buffer.needsUpdate = false;
	},
	bindBuffer: function( buffer ) {
        /*DEBUG*/
            //assert( !this.gl.isBuffer( buffer ), 'Illegal type. buffer must be a GL Buffer object.' );
        /*DEBUG_END*/
        if ( buffer.data == null ) {
            return;
        }
		var bufferObject, type;
		switch ( buffer.type ) {
			case Buffer.DATA_BUFFER:
				type = this.gl.ARRAY_BUFFER;
				break;
			case Buffer.ELEMENT_BUFFER:
				type = this.gl.ELEMENT_ARRAY_BUFFER;
				break;
		}
		
		if ( !this.bufferObjects[ buffer.id ] || buffer.needsUpdate ) {
			this.updateBuffer( buffer );
            this.boundedBuffer = null;
        }

        if ( this.boundedBuffer == buffer ) {
            return;
        }
        this.boundedBuffer = buffer;
        bufferObject = this.bufferObjects[ buffer.id ];
        this.gl.bindBuffer( type, bufferObject );
        bufferObject.lastTimeUsed = Date.now();
    },
    /*
     * This method  will create a texture object with the data passed to it.
     * The source of the texture can be a canvas, video or img element or
     * a pixel array. If it is a pixel array then width and height must be
     * specified. In every case they must be a power of 2.
     */
    createTexture: function( texture ) {
        /*DEBUG*/
            assert( texture.constructor == Texture, 'Invalid type. texture must be a Texture instance' );
            if ( !texture.width.isPowerOfTwo() || !texture.height.isPowerOfTwo() ) {
                debug_log( DEBUG_WARNING, 'Creating a texture which has non power of two dimentions.' );
                assert( generateMipmap, 'Cannot use mipmaps in a texture with non power of two dimentions.' );
            }
        /*DEBUG_END*/

        var gl = this.gl;
        var target;
        var textureObject = gl.createTexture();
        
        switch ( texture.origin ) {
            case texture.UPPER_LEFT_CORNER:
                gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
                break;
            case texture.LOWER_LEFT_CORNER:
                gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, false );
                break;
        }

        switch ( texture.type ) {
            case texture.TEXTURE2D:
                target = gl.TEXTURE_2D;
                gl.bindTexture( target, textureObject );
                if ( texture.source != null ) {
                    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture.source );
                }
                break;
            case texture.TEXTURE_CUBEMAP:
                target = gl.TEXTURE_CUBE_MAP;
                gl.bindTexture( target, textureObject );
                for( var i = 0; i < 6; ++i ) {
                    gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture.source[ i ] );
                }
                break;
        }

        switch ( texture.minFilter ) {
            case texture.NEAREST:
                gl.texParameteri( target, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
                break;
            case texture.LINEAR:
                gl.texParameteri( target, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
                break;
            case texture.NEAREST_MIPMAP_NEAREST:
                gl.texParameteri( target, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST );
                gl.generateMipmap( target );
                break;
            case texture.NEAREST_MIPMAP_LINEAR:
                gl.texParameteri( target, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
                gl.generateMipmap( target );
                break;
            case texture.LINEAR_MIPMAP_NEAREST:
                gl.texParameteri( target, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST );
                gl.generateMipmap( target );
                break;
            case texture.LINEAR_MIPMAP_LINEAR:
                gl.texParameteri( target, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
                gl.generateMipmap( target );
                break;
        }

        switch ( texture.maxFilter ) {
            case texture.NEAREST:
                gl.texParameteri( target, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
                break;
            case texture.LINEAR:
                gl.texParameteri( target, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
                break;
        }

        switch ( texture.wrapS ) {
            case texture.REPEAT:
                gl.texParameteri( target, gl.TEXTURE_WRAP_S, gl.REPEAT );
                break;
            case texture.MIRROR_REPEAT:
                gl.texParameteri( target, gl.TEXTURE_WRAP_S, gl.MIRROR_REPEAT );
                break;
            case texture.CLAMP:
                gl.texParameteri( target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
                break;
        }

        switch ( texture.wrapT ) {
            case texture.REPEAT:
                gl.texParameteri( target, gl.TEXTURE_WRAP_T, gl.REPEAT );
                break;
            case texture.MIRROR_REPEAT:
                gl.texParameteri( target, gl.TEXTURE_WRAP_T, gl.MIRROR_REPEAT );
                break;
            case texture.CLAMP:
                gl.texParameteri( target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
                break;
        }
        gl.bindTexture( target, null );
        
        this.textureObjects[ texture.id ] = textureObject;
    },
    updateTexture: function( texture ) {
        /*DEBUG*/
            assert( texture.constructor == Texture, 'Invalid type. texture must be a Texture instance' );
        /*DEBUG_END*/
        if ( typeof this.textureObjects[ texture.id ] == 'undefined' ) {
            this.createTexture( texture );
        }
        else if ( texture.flags & texture.DIMENTIONS ) {
            this.deleteTexture( texture );
            this.createTexture( texture );
        }
        else if ( texture.flags & texture.IMAGE ) {
            var textureObject = this.textureObjects[ texture.id ];
            var gl = this.gl;
            gl.texSubImage2D( gl.TEXTURE_2D, 0, 0, 0, texture.width, texture.height, gl.RGB, gl.UNSIGNED_BYTE, texture.source );
        }
        texture.ready = true;
        texture.flags = 0x0;
    },
    /*
     * This method binds a texture or a cubemap to the position specified.
     * If the texture needs updateing then it is automatically updated. 
     * The position must be a number between 0 and the MAX_FRAGMENT_TEXTURE_UNITS.
     */
    bindTexture: function( texture, position ) {
        /*DEBUG*/
            assert( texture.constructor == Texture, 'Invalid type. texture must be a Texture instance' );
            assert( position < 0 || position > this.getParameter( Renderer.MAX_FRAGMENT_TEXTURE_UNITS ), 'Texture bind position is out of bounds' );
        /*DEBUG_END*/
        if ( !this.textureObjects[ texture.id ] || texture.needsUpdate ) {
            this.updateTexture( texture );
        }
        var type, textureObject, gl;
        gl = this.gl;
        switch ( texture.type ) {
            case Texture.IMAGE:
                type = gl.TEXTURE_2D;
                break;
            case Texture.CUBEMAP:
                type = gl.TEXTURE_CUBEMAP;
                break;
        }

        textureObject = this.textureObjects[ texture.id ];
        textureObject.lastTimeUsed = Date.now();
        gl.activeTexture( this.gl.TEXTURE0 + position );
        gl.bindTexture( type, textureObject );
    },
    deleteTexture: function( texture ) {
        var textureObject = this.textureObjects[ texture.id ];
        if ( typeof textureObject != 'undefined' ) {
            this.gl.deleteTexture( textureObject );
            delete this.textureObjects[ texture.id ];
        }
    },
//    /*
//     * This method creates a framebuffer object with the specified
//     * dimentions. The color attachment of the framebuffer created
//     * is a texture and can be used as input to a shader. Also, the
//     * framebuffer created has a 16bit depth buffer.
//     */
//    createFramebuffer: function( width, height ) {
//        var gl = this.gl;
//        var fb = gl.createFramebuffer();
//        gl.bindFramebuffer( gl.FRAMEBUFFER, fb );
//
//        var colorTex = gl.createTexture();
//        gl.activeTexture( gl.TEXTURE0 );
//        gl.bindTexture( gl.TEXTURE_2D, colorTex );
//        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
//        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
//        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
//        gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTex, 0 );
//
//        var depthRB = gl.createRenderbuffer();
//        gl.bindRenderbuffer( gl.RENDERBUFFER, depthRB );
//        gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height );
//        gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRB );
//
//        gl.bindRenderbuffer( gl.RENDERBUFFER, null );
//
//        fb.colorAttachment = colorTex;
//        fb.depthAttachment = depthRB;
//        gl.bindFramebuffer( gl.FRAMEBUFFER, null );
//        fb.uid = this.uid.get();
//        return fb;
//    },
//    /*
//     * This method binds the passed framebuffer so that it becomes active.
//     * Any drawing calls following a framebuffer bind will cause the result
//     * of the calls being writted in the framebuffer. To return to the normal
//     * renderering to the screen bindFramebuffer must be called with null as
//     * its parameter.
//     */
//    bindFramebuffer: function( fb ) {
//        var gl = this.gl;
//        gl.bindFramebuffer( gl.FRAMEBUFFER, fb );
//    },
//    /*
//     * This method updated the dimentions of an already created framebuffer.
//     * The contents of the framebuffer immediatelly after this call are
//     * undefined.
//     */
//    updateFramebuffer: function( fb, width, height ) {
//        var gl = this.gl;
//        gl.activeTexture( gl.TEXTURE0 );
//        gl.bindTexture( gl.TEXTURE_2D, fb.colorAttachment );
//        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
//
//        gl.bindRenderbuffer( gl.RENDERBUFFER, fb.depthAttachment );
//        gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height );
//        
//        gl.bindRenderbuffer( gl.RENDERBUFFER, null );
//    },
    deleteShader: function( shader ) {
        var programObject, gl;
        gl = this.gl;
        programObject = this.programObjects[ shader.id ];

        if ( this.currentShader == shader ) {
            this.currentShader = null;
        }

        if ( programObject ) {
            gl.deleteShader( programObject.vertexShader );
            gl.deleteShader( programObject.fragmentShader );
            gl.deleteProgram( programObject );
            delete this.programObjects[ shader.id ];
        }
    },
    /*
     * This method creates a shader object from the two GLSL sources provided.
     * After compiling and linking the shaders it will search for all active
     * uniforms and attributes also finding their type.
     */
    createShader: function( shader ) {
        var gl, program, uniformCount, attributeCount, i, info, vertexShader, fragmentShader;
        gl = this.gl;

        vertexShader = gl.createShader( gl.VERTEX_SHADER );
        gl.shaderSource( vertexShader, shader.vertexSource );
        gl.compileShader( vertexShader );
        if ( !gl.getShaderParameter( vertexShader, gl.COMPILE_STATUS ) ) {
            throw 'Vertex Shader compile error: ' + gl.getShaderInfoLog( vertexShader );
        }

        fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );
        gl.shaderSource( fragmentShader, shader.fragmentSource );
        gl.compileShader( fragmentShader );
        if ( !gl.getShaderParameter( fragmentShader, gl.COMPILE_STATUS ) ) {
            throw 'Fragment Shader compile error: ' + gl.getShaderInfoLog( fragmentShader );
        }

        program = gl.createProgram();
        gl.attachShader( program, vertexShader );
        program.vertexShader = vertexShader;

        gl.attachShader( program, fragmentShader );
        program.fragmentShader = fragmentShader;

        gl.linkProgram( program );
        if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
            throw 'Program linking error: ' + gl.getProgramInfoLog( program );
        }


        uniformCount = gl.getProgramParameter( program, gl.ACTIVE_UNIFORMS );
        program.uniforms = {};
        while ( uniformCount-- ) {
            info = gl.getActiveUniform( program, uniformCount );

            program.uniforms[ info.name ] = {
                location: gl.getUniformLocation( program, info.name ),
                set: null
            }

            switch ( info.type ) {
                case gl.FLOAT:
                    program.uniforms[ info.name ].set = gl.uniform1f.bind( gl );
                    break;
                case gl.FLOAT_VEC2:
                    program.uniforms[ info.name ].set = gl.uniform2fv.bind( gl );
                    break;
                case gl.FLOAT_VEC3:
                    program.uniforms[ info.name ].set = gl.uniform3fv.bind( gl );
                    break;
                case gl.FLOAT_VEC4:
                    program.uniforms[ info.name ].set = gl.uniform4fv.bind( gl );
                    break
                case gl.INT:
                case gl.BOOL:
                case gl.SAMPLER_2D:
                case gl.SAMPLER_CUBE:
                    program.uniforms[ info.name ].set = gl.uniform1i.bind( gl );
                    break;
                case gl.INT_VEC2:
                case gl.BOOL_VEC2:
                    program.uniforms[ info.name ].set = gl.uniform2iv.bind( gl );
                    break;
                case gl.INT_VEC3:
                case gl.BOOL_VEC3:
                    program.uniforms[ info.name ].set = gl.uniform3iv.bind( gl );
                    break;
                case gl.INT_VEC4:
                case gl.BOOL_VEC4:
                    program.uniforms[ info.name ].set = gl.uniform4iv.bind( gl );
                    break;
                case gl.FLOAT_MAT2:
                    program.uniforms[ info.name ].set = gl.mineUniformMatrix2fv;
                    break;
                case gl.FLOAT_MAT3:
                    program.uniforms[ info.name ].set = gl.mineUniformMatrix3fv;
                    break;
                case gl.FLOAT_MAT4:
                    program.uniforms[ info.name ].set = gl.mineUniformMatrix4fv;
            }
        }
        
        attributeCount = gl.getProgramParameter( program, gl.ACTIVE_ATTRIBUTES );
        program.attributes = {};
        gl.useProgram( program );
        while ( attributeCount-- ) {
            gl.enableVertexAttribArray( attributeCount );
            info = gl.getActiveAttrib( program, attributeCount );
            program.attributes[ info.name ] = {
                location: gl.getAttribLocation( program, info.name )
            }
        }
        gl.useProgram( null );

        program.lastTimeUsed = Date.now();
        this.programObjects[ shader.id ] = program;
        shader.needsUpdate = false;
    },
    /*
     * This method is used to use the specified shader. All the values that are
     * currenly saved in the shader object will be uploaded to the GPU and the
     * appropriate buffers will be bound to the appropriate attributes.
     */
    useShader: function( shader ) {
        var programObject, u, uniform;
        if ( !this.programObjects[ shader.uid ] || shader.needsUpdate ) {
            this.deleteShader( shader );
            this.createShader( shader );
            this.currentShader = null;
        }

        programObject = this.programObjects[ shader.uid ];

        if ( this.currentShader != shader ) {
            this.gl.useProgram( programObject );
            this.currentShader = shader;
        }

        for ( uniform in programObject.uniforms ) {
            /*DEBUG*/
                assert( typeof shader.uniforms[ uniform ] != 'undefined', 'Uniform "' + uniform + '" is undefined! You must set a value.' );
            /*DEBUG_END*/
            u = programObject.uniforms[ uniform ];
            u.set( u.location, shader.uniforms[ uniform ] );
        }

        programObject.lastTimeUsed = Date.now();
    },
    /*
     * This method will resize the default framebuffer to the size specified.
     * It will not have any effect to custom framebuffers, if any is bounded.
     */
    setSize: function( width, height ) {
        this.canvas.width = this.width = width;
        this.canvas.height = this.height = height;
    },
    /*
     * This method is responsible for initializing the rendering buffer with
     * the current clear color and resets the depth buffer. Should be called
     * before drawing objects on the screen.
     */
    clear: function() {
        this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );
    },
    /*
     * This method takes an index buffer as a parameter and renders the indexed
     * vertices from the buffers binded when useShader() was called. An optional
     * paramter is the drawing method which defaults to TRIANGLES.
     */
    render: function( mesh ) {
		if ( !this.currentShader ) {
			/*DEBUG*/
				debug_log( 'ERROR', 'Tried to render without a shader. Call useShader() before rendering.' );
			/*DEBUG_END*/
			return;
		}
        var gl = this.gl;
		var mode;
		
        switch ( mesh.mode ) {
            case Mesh.POINTS:
                mode = gl.POINTS;
                break;
            case Mesh.LINES:
                mode = gl.LINES;
                break;
            case Mesh.LINE_STRIP:
                mode = gl.LINE_STRIP;
                break;
            case Mesh.LINE_LOOP:
                mode = gl.LINE_LOOP;
                break;
            case Mesh.TRIANGLES:
                mode = gl.TRIANGLES;
                break;
            case Mesh.TRIANGLE_STRIP:
                mode = gl.TRIANGLE_STRIP;
                break;
            case Mesh.TRIANGLE_LOOP:
                mode = gl.TRIANGLE_LOOP;
                break;
        }
		
		var shader = this.currentShader;
        this.useShader( this.currentShader );

		var program = this.programObjects[ shader.id ];
        program.lastTimeUsed = Date.now();
		
		for ( attribute in program.attributes ) {
			var vertexAttribute = mesh.vertexAttributes[ attribute ];
			var name = shader.attributes[ attribute ];

			this.bindBuffer( vertexAttribute.buffer );
			gl.vertexAttribPointer( program.attributes[ attribute ].location, vertexAttribute.size, gl.FLOAT, false, vertexAttribute.stride, vertexAttribute.offset );
		}

		this.bindBuffer( mesh.indexBuffer );
        gl.drawElements( mode, mesh.indexBuffer.data.length, gl.UNSIGNED_SHORT, 0 );
    }
}
function Buffer( type, usage ) {
    this.id = Buffer.uid++;
    this.data = null;
    this.length = 0;
    this.usage = usage || Buffer.STATIC;
    this.type = type || Buffer.DATA_BUFFER;
    this.needsUpdate = true;
}

Buffer.uid = 0;

Buffer.STATIC = 1;
Buffer.DYNAMIC = 2;
Buffer.STREAM = 3;
Buffer.DATA_BUFFER = 4;
Buffer.ELEMENT_BUFFER = 5;


Buffer.prototype = {
    setData: function( data ) {
        /*DEBUG*/
            assertIn( data.constructor, Array, Float32Array, Uint16Array, 'Invalid type. data must be an Array, Float32Array or Uint16Array' );
            switch ( this.type ) {
                case Buffer.ELEMENT_BUFFER:
                    assertIn( data.constructor, Array, Uint16Array, 'Invalid type. data must be an Array, Float32Array or Uint16Array' );
                    break;
                case Buffer.DATA_BUFFER:
                    assertIn( data.constructor, Array, Float32Array, 'Invalid type. data must be an Array, Float32Array or Uint16Array' );
                    break;
            }
        /*DEBUG_END*/
        if ( data.constructor == Array ) {
            switch ( this.type ) {
                case Buffer.ELEMENT_BUFFER:
                    if ( this.data && this.data.length == data.length ) {
                        this.data.set( data );
                    }
                    else {
                        data = new Uint16Array( data );

                    }
                    break;
                case Buffer.DATA_BUFFER:
                    if ( this.data && this.data.length == data.length ) {
                        this.data.set( data );
                    }
                    else {
                        data = new Float32Array( data );
                    }
                    break;
            }
        }
        this.needsUpdate = true;
        this.data = data;
        this.length = data.length;
    }
}
function VertexBuffer( semantic ) {
	this.semantic = semantic || '';
	this.stride = 0;
	this.size = 3;
	this.offset = 0;
    this.length = 0;
	this.buffer = null;
};

VertexBuffer.prototype = {
    getElement( n, dest ) {
        var s = this.size;
        if ( !dest ) {
            dest = new Float32Array( s );
        }
        var d = this.buffer.data;
        var stride = this.stride || this.size;
        for ( var i = 0; i < s; i++ ) {
            dest[ i ] = d[ offset + n * stride + i ];
        }
        return dest;
    },
    setBuffer: function ( buffer ) {
		/*DEBUG*/
			assert( buffer instanceof Buffer, 'Ivalid type. buffer must be an instance of Buffer' );
		/*DEBUG_END*/
		this.buffer = buffer;
        this.length = this.buffer.length / this.stride;
        return this;
	},
    clone: function() {
        var ret = new VertexBuffer( this.semantic );
        ret.stride = this.stride;
        ret.size = this.size;
        ret.offset = this.offset;
        ret.buffer = this.buffer;
        return ret;
    }
};
var Texture = function( type ) {
    /*DEBUG*/
        assertIn( type, Texture.IMAGE, Texture.CUBEMAP, 'Illegal value. type must be TEXTURE_2D or TEXTURE_CUBEMAP' );
    /*DEBUG_END*/
    this.id = Texture.uid++;
    this.name = 'Texture #' + this.id;
    this.width = 1;
    this.height = 1;
    this.minFilter = Texture.LINEAR_MIPMAP_LINEAR;
    this.maxFilter = Texture.LINEAR;

    this.wrapS = Texture.REPEAT;
    this.wrapT = Texture.REPEAT;

    this.origin = Texture.UPPER_LEFT_CORNER;

    this.source = null;

    this.needsUpdate = true;
}

Texture.uid = 0;
Texture.IMAGE = 1;
Texture.CUBEMAP = 2;

Texture.NEAREST = 1;
Texture.LINEAR = 2;

Texture.NEAREST_MIPMAP_NEAREST = 3;
Texture.LINEAR_MIPMAP_NEAREST = 4;

Texture.NEAREST_MIPMAP_LINEAR = 5;
Texture.LINEAR_MIPMAP_LINEAR = 6;

Texture.REPEAT = 1;
Texture.MIRROR_REPEAT = 2;
Texture.CLAMP_TO_EDGE = 3;

Texture.LOWER_LEFT_CORNER = 1;
Texture.UPPER_LEFT_CORNER = 2;

Texture.prototype = {
    setName: function( name ) {
        this.name = name || 'Texture #' + this.id;
    },
    setMinFilter: function( filter ) {
        /*DEBUG*/
            assertIn( filter, Texture.NEAREST, 
                              Texture.LINEAR, 
                              Texture.NEAREST_MIPMAP_NEAREST, 
                              Texture.NEAREST_MIPMAP_LINEAR, 
                              Texture.LINEAR_MIPMAP_NEAREST, 
                              Texture.LINEAR_MIPMAP_LINEAR, 
                              'Unsupported minification filtering. ' + filter 
            );
        /*DEBUG_END*/
        this.minFilter = filter;
    },
    setMaxFilter: function( filter ) {
        /*DEBUG*/
            assertIn( filter, Texture.NEAREST, Texture.LINEAR, 'Unsupported minification filtering. ' + filter  );
        /*DEBUG_END*/
        this.magFilter = filter;
    },
    setImage: function( source ) {
        /*DEBUG*/
            assertIn( source.constructor, Image, HTMLImageElement, HTMLCanvasElement, HTMLVideoElement, 'Unsupported type of source' );
        /*DEBUG_END*/
        /*TODO Race condition: A non loaded image is set to the texture, then an other loaded image is set.
               Then the previous pending callback must be canceled and only the most recent call should be
               valid.
        */
        if ( ( source.constructor == HTMLImageElement || source.constructor == Image ) && !source.complete ) {
            source.onload = this.setImage.bind( this, source );
            return;
        }
        this.source = source;
        this.setDimentions( this.source.width, this.source.height );
        this.needsUpdate = true;
    },
    setDimentions: function( width, height ) {
        if ( this.width != width || this.height != height ) {
            this.width = width;
            this.height = height;
        }
    }
}
var Mesh = function() {
    this.mode = Mesh.TRIANGLES;
    
    this.boundingVolume = null;
    this.vertexAttributes = {};
	this.indexBuffer = null;
}


Mesh.POINTS = 1;
Mesh.LINES = 2;
Mesh.LINE_LOOP = 3;
Mesh.LINE_STRIP = 4;
Mesh.TRIANGLES = 5;
Mesh.TRIANGLE_STRIP = 6;
Mesh.TRIANGLE_FAN = 7;

Mesh.prototype = {
    setVertexAttribute: function( vertexBuffer ) {
        this.vertexAttributes[ vertexBuffer.semantic ] = vertexBuffer;
    },
    setIndexBuffer: function( buffer ) {
        this.indexBuffer = buffer;
    },
    interleave: function() {
        /*DEBUG*/
            assert( this.isInterleaved, 'Tried to interleave an already interleaved Mesh' );
        /*DEBUG*/
        var interleavedBuffer, data, stride, attribute, buffer, attr, i, j;

        interleavedBuffer = new Buffer( Buffer.DATA_BUFFER, Buffer.STATIC );

        stride = 0;
        for ( attribute in this.vertexAttributes ) {
            attr = this.vertexAttributes[ attribute ] = this.vertexAttributes[ attribute ].clone();
            attr.offset = stride;
            stride += 4 * attr.size;
        }

        data = [];
        for ( attribute in this.vertexAttributes ) {
            attr = this.vertexAttributes[ attribute ];
            attr.stride = stride;
            buffer = attr.buffer;

            i = buffer.length / attr.size;
            while ( i-- ) {
                for ( j = 0; j < attr.size; j++ ) {
                    data[ attr.offset / 4 + i * stride / 4 + j ] = buffer.data[ attr.size * i + j ];
                }
            }
        }

        interleavedBuffer.setData( data );
        for ( attribute in this.vertexAttributes ) {
            this.vertexAttributes[ attribute ].setBuffer( interleavedBuffer );
        }
    },
    setMode: function( mode ) {
        /*DEBUG*/
            assertIn( mode, Mesh.POINTS, Mesh.LINES, Mesh.LINE_LOOP, Mesh.LINE_STRIP, Mesh.TRIANGLES, Mesh.TRIANGLE_STRIP, Mesh.TRIANGLE_FAN, 'Illegal value.' );
        /*DEBUG_END*/
        this.mode = mode;
    }
}
var Shader = function() {
    this.vertexSource = '';
    this.fragmentSource = '';
	
    this.uniforms = {};
	this.attributes = {};
    
    this.needsUpdate = false;
}

Shader.prototype = {
    setVertexSource: function( source ) {
        this.vertexSource = source;
        this.needsUpdate = true;
    },
    setFragmentSource: function( source ) {
        this.fragmentSource = source;
        this.needsUpdate = true;
    }
}
function BoundingVolume( points ) {
    Transform.call( this );
};

BoundingVolume.prototype = {
    set: function( points ) {
        //Abstract Method
    }
};

BoundingVolume.extend( Transform );
function BoundingSphere() {
    BoundingVolume.call( this );
    this.radius;
    this.type = 1;
};

BoundingSphere.prototype = {
    set: function( vertices ) {
        var center = TempVars.vec3a;
        var temp = TempVars.vec3b;


        var center.set( [ 0, 0, 0 ] );
        var l = vertices.length;
        while ( l-- ) {
            center.add( vertices[ l ] );
        }
        center.scale( 1 / vertices.length );
        this.setPosition( center );

        var maxRadius = 0;
        var l = vertices.length;
        while ( l-- ) {
            var radius = temp.set( center ).subtract( vertices[ l ] ).length2();
            if ( radius > maxRadius ) {
                maxRadius = radius;
            }
        }
        this.radius = Math.sqrt( radius );
        return this;
    },
    getRadius: function() {
        return this.radius;
    },
    collide: function( boundingVolume ) {
        if ( boundingVolume.type == 0 ) {
            return false;
        }
        else if ( this.type > boundingVolume.type ) {
            return boundingVolume.collide( this );
        }
        else {
            if ( boundingVolume.type == 1 ) {
                //sphere against sphere
                var temp = TempVars.vec3a;

                var distance = temp.set( this.position ).subtract( boundingVolume.position ).length();
                var R = this.radius + boundingVolume.radius;

                return dist <= R;
            }
            else if ( boundingVolume.type == 2 ) {
                //sphere against rectangle
                //TODO
            }
        }    
    }   
};

BoundingSphere.extend( BoundingVolume );
function BoundingBox() {
    BoundingVolume.call( this );
    this.points = [
        Vector3(), Vector3(), Vector3(), Vector3(), 
        Vector3(), Vector3(), Vector3(), Vector3()
    ];
};

BoundingBox.prototype = {
    set: function( vertices ) {
        var l = vertices.length - 1;
        var min = vertices[ l ].clone();
        var max = vertices[ l ].clone();
        
        while ( l-- ) {
            var point = vertices[ l ];
            var i = 3;
            while( i-- ) {
                if ( point[ i ] < min[ i ] ) {
                    min[ i ] = point[ i ];
                }
                if ( point[ i ] > max[ i ] ) {
                    max[ i ] = point[ i ];
                }
            }
        }

        this.points[ 0 ].set( [ min[ 0 ], min[ 1 ], min[ 2 ] ] );
        this.points[ 1 ].set( [ min[ 0 ], min[ 1 ], max[ 2 ] ] );
        this.points[ 2 ].set( [ min[ 0 ], max[ 1 ], min[ 2 ] ] );
        this.points[ 3 ].set( [ min[ 0 ], max[ 1 ], max[ 2 ] ] );
        this.points[ 4 ].set( [ max[ 0 ], min[ 1 ], min[ 2 ] ] );
        this.points[ 5 ].set( [ max[ 0 ], min[ 1 ], max[ 2 ] ] );
        this.points[ 6 ].set( [ max[ 0 ], max[ 1 ], min[ 2 ] ] );
        this.points[ 7 ].set( [ max[ 0 ], max[ 1 ], max[ 2 ] ] );
        return this.points;
    
    },
    getPoints: function() {
        var p = [];
        for ( var i = 0; i < 8; i++ ) {
            p[ i ] = this.points[ i ].clone();
        }
        return p;
    },
    collide: function( boundingVolume ) {
        if ( boundingVolume.type == 0 ) {
            return false;
        }
        else if ( this.type > boundingVolume.type ) {
            return boundingVolume.collide( this );
        }
        else {
            if ( boundingVolume.type == 2 ) {
                //rectangle against rectangle
                var res = ( new Rect() ).rectInterferenceArea( this.getPoints(), boundingVolume.getPoints() );
                return res;
            }
        }    
    }
};

BoundingBox.extend( BoundingVolume );
var Scene = function() {
    this.root = new Node();
}

Scene.prototype = {
    add: function( node ) {
        this.root.appendChild( node );
    }
}
/*
 * An abstract 3 dimentional object with a location in space
 */
function Node() {
    this.uuid = UUID();
    this.worldTransform = new Transform();
    this.parent = Node.Origin;
    this.children = [];
    this.name = '';
    Transform.call( this );
};

Node.prototype = {
    getAbsolutePosition: function( dest ) {
        if ( !dest ) {
            dest = Vector3();
        }
        if ( this.needsUpdate ) {
            this.update();
        }
        return dest.set( this.worldTransform.position );
    },
    setAbsolutePosition: function( position ) {
        this.worldTransform.setPosition( position );

        var p = this.parent;
        var q = p.getAbsoluteOrientation( TempVars.quat4a );
        var v = p.getAbsolutePosition( TempVars.vec3a );
        var s = p.getAbsoluteScale();

        this.position.set( q.inverse().multiplyVector3( position.subtract( v ) ) );
        if ( s != 1 ) {
            this.position.scale( 1 / s );
        }
        this.invalidate();
        return this;
    },
    getAbsoluteOrientation: function( dest ) {
        return this.worldTransform.getOrientation( dest );
    },
    setAbsoluteOrientation: function( orientation ) {
        this.worldTransform.setOrientation( orientation );
        this.orientation.set( this.parent.getAbsoluteOrientation( TempVars.quat4a ).inverse().multiply( orientation ) );
        return this;
    },
    getAbsoluteScale: function() {
        return this.worldTransform.getScale();
    },
    setAbsoluteScale: function( scale ) {
        this.worldTransform.setScale( scale );
        this.scale = scale / this.parent.getAbsoluteScale();

        return this;
    },
    appendChild: function( node ) {
        node.parent = this;
        this.children.push( node );
        return this;
    },
    removeChild: function( node ) {
        var children = this.children;
        var l = children.length;
        while ( l-- ) {
            if ( children[ l ] == node ) {
                node.parent = null;
                children.splice( l, 1 );
                return;
            }
        }
        return this;
    },
    getAbsoluteMatrix: function( dest ) {
        if ( !dest ) {
            dest = Matrix4();
        }
        if ( this.needsUpdate ) {
            this.update();
        }
        return dest.set( this.worldMatrix );
    },
    update: function() {
        if ( this.needsUpdate ) {
            this.Transform_update();
            var parent = this.parent;
            if ( parent.needsUpdate ) {
                parent.update();
            }
            this.worldTransform.set( parent.worldTransform ).combineWith( this );
        }
        return this;
    },
    invalidate: function() {
        this.needsUpdate = true;
        var l = this.children.length;
        while ( l-- ) {
            this.children[ l ].invalidate();
        }
        return this;
    }
};

Node.extend( Transform );

Node.Origin = new Node();
function Camera() {
    Node.call( this );

    this.width = 1;
    this.height = 1;
    this.ratio = 1;
    this.zNear = 0.1;
    this.zFar = 1000;

    this.fieldOfView = 55;
    this.tanFieldOfView = Math.tan( ( this.fieldOfView / 2 ) * ( Math.PI / 180 ) );
    this.cosFieldOfView = Math.cos( ( this.fieldOfView / 2 ) * ( Math.PI / 180 ) );
    this.horizontalTanFieldOfView = this.tanFieldOfView;
    this.horizontalCosFieldOfview = Math.cos( Math.atan( this.tanFieldOfView ) );

    this.projectionMatrix = Matrix4();
}
 
Camera.prototype = {
    setPerspective: function () {
        this.projectionMatrix.perspective( this.FOV, this.w / this.h, this.zNear, this.zFar );
        this.ratio = this.w / this.h;
        this.horizCosFOV = Math.cos( Math.atan( this.tanFOV * this.ratio ) );
        this.horizTanFOV = this.tanFOV * this.ratio;
    }
}

Camera.extend( Node );
function Drawable() {
    Node.call( this );
    this.mesh = null;
}

Drawable.prototype = {
    onBeforeRender: function( camera ) {
        
    }
}

Drawable.extend( Node );
function Material() {
    this.uuid = UUID();

    this.libraries = [];
    this.defines = {};
    this.vertexShader = '';
    this.fragmentShader = '';
    this.parameters = {};
    this.engineParamaters = {};
    this.shaderCache = null;
    this.validShader = false;
}

Material.prototype = {
    define: function( name, value ) {
        if ( this.defines[ name ] != value ) {
            this.defines[ name ] = value;
            this.validShader = false;
        }
    },
    setParameter: function( name, value ) {
        this.parameters[ name ] = value;
    },
    getShader: function() {
        if ( !this.validShader ) {
            this.validShader = true;

            var vertexShader = '';
            var fragmentShader = '';

            for ( define in this.defines ) {
                vertexShader += '#define ' + define + ' ' + this.defines[ define ] + '\n';
                fragmentShader += '#define ' + define + ' ' + this.defines[ define ] + '\n';
            }

            var l = this.libraries.length;
            for ( var i = 0; i < l; i++ ) {
                vertexShader += this.libraries[ i ].vertexShader + '\n';
                fragmentShader += this.libraries[ i ].fragmentShader + '\n';
            }
            vertexShader += this.vertexShader;
            fragmentShader += this.fragmentShader;

            this.shaderCache = new Shader();
            this.shaderCache.setVertexShader( vertexShader );
            this.shaderCache.setFragmentShader( fragmentShader );
        }
        for ( parameterName in this.parameters ) {
            this.shaderCache.uniforms[ parameterName ] = this.parameters;
        }
        return this.shaderCache;
    },
    clone: function() {
        var ret = new Material();
        ret.shaderCache = this.shaderCache;
        this.validShader = true;
        for ( define in this.defines ) {
            ret.defines[ define ] = this.defines[ define ];
        }
        for ( parameter in this.parameters ) {
            ret.parameters[ parameter ] = this.parameters[ parameter ];
        }
        var l = this.libraries.length;
        while ( l-- ) {
            ret.libraries[ l ] = this.libraries[ l ];
        }
        ret.vertexShader = this.vertexShader;
        ret.fragmentShader = this.fragmentShader;
    },
    getExportData: function( exporter ) {
        var ret = {};
        ret.shader = this.shader.uuid;
        ret.parameters = {};
        for ( parameter in this.parameters ) {
            switch( typeof this.parameters[ parameter ] ) {
                case 'number':
                    ret[ parameter ] = this.parameters[ parameter ];
                    break;
                case 'object':
                    ret[ parameter ] = '' ;
            }
        }
    },
    setImportData: function( importer ) {


    }
}
function Cube() {
    Drawable.call( this );
    var vertices = new Buffer( Buffer.DATA_BUFFER, Buffer.STATIC );
    vertices.setData( [
        // front
        0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5,
        -0.5, -0.5, 0.5,
        
        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,
        
        // back
        -0.5, -0.5, -0.5,
        -0.5, 0.5, -0.5,
        0.5, 0.5, -0.5,
        
        0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,
        -0.5, -0.5, -0.5,
        
        // left
        -0.5, 0.5, 0.5,
        -0.5, 0.5, -0.5,
        -0.5, -0.5, -0.5,
        
        -0.5, -0.5, -0.5,
        -0.5, -0.5, 0.5,
        -0.5, 0.5, 0.5,
        
        // right
        0.5, -0.5, -0.5,
        0.5, 0.5, -0.5,
        0.5, 0.5, 0.5,
        
        0.5, 0.5, 0.5,
        0.5, -0.5, 0.5,
        0.5, -0.5, -0.5,
        
        // top
        0.5, 0.5, -0.5,
        -0.5, 0.5, -0.5,
        -0.5, 0.5, 0.5,
        
        -0.5, 0.5, 0.5,
        0.5, 0.5, 0.5,
        0.5, 0.5, -0.5,
        
        // bottom
        -0.5, -0.5, 0.5,
        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,
        
        0.5, -0.5, -0.5,
        0.5, -0.5, 0.5,
        -0.5, -0.5, 0.5
    ] );

    var uvcoords = new Buffer( Buffer.DATA_BUFFER, Buffer.STATIC );
    uvcoords.setData( [
        // front
        1, 1,
        0, 1,
        0, 0,
        
        0, 0,
        1, 0,
        1, 1,
        
        // back
        0, 0,
        0, 1,
        1, 1,
        
        1, 1,
        1, 0,
        0, 0,
        
        // left
        1, 1,
        0, 1,
        0, 0,
        
        0, 0,
        1, 0,
        1, 1,
        
        // right
        1, 0,
        1, 1,
        0, 1,
        
        0, 1,
        0, 0,
        1, 0,
        
        // top
        1, 1,
        0, 1,
        0, 0,
        
        0, 0,
        1, 0,
        1, 1,
        
        // bottom
        0, 0,
        0, 1,
        1, 1,
        
        1, 1,
        1, 0,
        0, 0
    ] );


    var verticesVB = new VertexBuffer( 'Position' );
    verticesVB.setBuffer( vertices );

    var uvcoordsVB = new VertexBuffer( 'UVCoord' );
    uvcoordsVB.setBuffer( uvcoords );

    var indices = new Buffer( Buffer.ELEMENT_BUFFER, Buffer.STATIC );
    var indicesArray = [];
    for ( var i = 0; i < vertices.length / 3; ++i ) {
        indicesArray.push( i );
    }
    indices.setData( indicesArray );

    var m = new Mesh();
    m.setVertexAttribute( verticesVB );
    m.setVertexAttribute( uvcoordsVB );
    m.setIndexBuffer( indices );
    
    this.mesh = m;
}

Cube.extend( Drawable );
function TextureManager() {
    this.cache = {};
}


TextureManager.prototype = {
    load: function ( url ) {
        if ( this.cache[ url ] )  {
            return this.cache[ url ];
        }

        var texture = new Texture( url.split( '/' ).pop() );

        var img = new Image();
        img.onload = function() {
            texture.setImage( img );
        }
        img.src = url;

        this.cache[ url ] = texture;

        return texture;
    }
}
function ShaderManager(){
    this.cache = {};
}

ShaderManager.prototype = {
    load: function( url ) {
        var vSource, fSource, v, f, waiter, shader;

        if ( this.cache[ url ] ) {
            return this.cache[ url ];
        }
        
        shader = new Shader();

        Request.get( url + '/vertex.c', function( vertexSource ) {
            shader.setVertexSource( vertexSource );
        } );

        Request.get( url + '/fragment.c', function( fragmentSource ) {
            shader.setFragmentSource( fragmentSource );
        } );

        this.cache[ url ] = shader;
        return shader;
    }
}
function RenderManager() {
    this.renderer = new Renderer();
    this.textureManager = new TextureManager();
    this.shaderManager = new ShaderManager();
    
    this.globalUniformCache = {
        Time: Date.now(),
        ProjectionMatrix: Matrix4(),
        ViewMatrix: Matrix4(),
        WorldMatrix: Matrix4(),
        ViewProjectionMatrix: Matrix4(),
        WorldViewMatrix: Matrix4(),
        WorldViewProjectionMatrix: Matrix4()
    };
}


RenderManager.prototype = {
    getParameter: function( name ) {
        var g = this.globalUniformCache;
        switch ( name ) {
            case 'Time':
                if ( g.Time ) {
                    return g.Time;
                }
                return g.Time = Date.now();
            case 'ProjectionMatrix':
                return g.ProjectionMatrix;
            case 'ViewMatrix':
                return g.ViewMatrix;
            case 'WorldMatrix':
                return g.WorldMatrix;
            case 'ViewProjectionMatrix':
                if ( g.
                return g.ViewProjectionMatrix.set( camera.projectionMatrix ).multiply( g.ViewMatrix );
                break;
            case 'WorldViewMatrix':
            g.WorldViewMatrix.set( g.ViewMatrix ).multiply( g.WorldMatrix );
                break;
            case 'WorldViewProjectionMatrix':
            g.WorldViewProjectionMatrix.set( g.ProjectionMatrix ).multiply( g.WorldViewMatrix );
                break;
        }
    },
    renderScene: function( scene, camera ) {
        var g = this.globalUniformCache;
        g.ProjectionMatrix.set( camera.projectionMatrix );
        camera.getInverseMatrix( g.ViewMatrix );

        function fillDrawBucket( node ) {
            if ( node.mesh ) {
                bucket.push( node );
            }
            var l = node.children.length;
            while ( l-- ) {
                fillDrawBucket( node.children[ l ] );
            }
        }
        var bucket = [];
        fillDrawBucket( scene.root );

        var l = bucket.length;
        while ( l-- ) {
            var currentDrawable = bucket[ l ];

            currentDrawable.onBeforeRender( camera );
            currentDrawable.getMatrix( g.WorldMatrix );
            
            var material = currentDrawable.material;
            for ( engineParameter in material.engineParameters ) {
                material.set( engineParameter, this.getParameter( engineParameter ) );
            }

            this.renderer.useShader( material.getShader() );
            this.renderer.render( currentDrawable.mesh );
        }
    }
}
function Application() {
    this.renderManager = new RenderManager();
    this.scene = new Scene();
    this.camera = new Camera();

    this.scene.root.appendChild( this.camera );
    //this.camera.move( 0, 0, 10 );
}

Application.prototype = {
    start: function() {
        setTimeout( function() {
            this.renderManager.renderScene( this.scene, this.camera );
        }.bind( this ), 3000 );
        return this;
    }
}
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
