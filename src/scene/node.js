// extern
var Matrix4, Quaternion, TempVars, Transform, UUID, Vector3;

/*
 * An abstract 3 dimensional object with a location in space and a tree-like structure
 */
function Node() {
    this.uuid = UUID();
    this.worldTransform = new Transform();
    this.parent = Node.Origin;
    this.children = [];
    this.name = this.uuid;
    Transform.call( this );
}

Node.prototype = {
    constructor: Node,
    getAbsolutePosition: function( dest ) {
        if ( !dest ) {
            dest = new Vector3();
        }
        this.update();
        return dest.set( this.worldTransform.position );
    },
    setAbsolutePosition: function( position ) {
        TempVars.lock();
        this.worldTransform.setPosition( position );
        position = TempVars.getVector3().set( position );
        var p = this.parent;
        var q = p.getAbsoluteOrientation( TempVars.getQuaternion() );
        var v = p.getAbsolutePosition( TempVars.getVector3() );
        var s = p.getAbsoluteScale();

        this.position.set( q.inverse().multiplyVector3( position.subtract( v ) ) );
        if ( s != 1 ) {
            this.position.scale( 1 / s );
        }
        TempVars.release();
        return this.invalidate();
    },
    getAbsoluteOrientation: function( dest ) {
        if ( !dest ) {
            dest = new Quaternion();
        }
        this.update();
        return this.worldTransform.getOrientation( dest );
    },
    setAbsoluteOrientation: function( orientation ) {
        TempVars.lock();
        this.worldTransform.setOrientation( orientation );
        this.orientation.set( this.parent.getAbsoluteOrientation( TempVars.getQuaternion() ).inverse().preMultiply( orientation ) );
        TempVars.release();
        return this.invalidate();
    },
    getAbsoluteScale: function() {
        this.update();
        return this.worldTransform.getScale();
    },
    setAbsoluteScale: function( scale ) {
        this.worldTransform.setScale( scale );
        this.scale = scale / this.parent.getAbsoluteScale();
        return this.invalidate();
    },
    rotate: function( axis, angle, node ) {
        TempVars.lock();

        //Remap angle to the range 0..2 * Math.PI
        angle -= 2 * Math.PI * Math.floor( angle / 2 / Math.PI );

        //Calculate the quaternion that describes the rotation we want to do
        var rot = TempVars.getQuaternion().setAxisAngle( axis, angle );

        /*
         * If node is undefined then we are rotating around ourself and our position
         * remains unchanged. If it is a node a new position is calculated.
         */
        if ( node ) {
            //Get the absolute position of the node being rotated
            var newPos = this.getAbsolutePosition( TempVars.getVector3() );

            //If we are rotating around Node.Origin things are simple
            if ( node === Node.Origin ) {
                //Rotate our absolute position around the origin
                rot.multiplyVector3( newPos );
            }
            /*
             * If we are rotating around an arbitrary node we need to transform the
             * system so that the node we are rotation around becomes the Node.Origin.
             * We then do the rotation and transform the system back to it's original
             * state.
             */
            else {
                //Get the absolute position of the node around which we are rotating
                var pivotPos = node.getAbsolutePosition( TempVars.getVector3() );
                //Get the absolute orientation of the node around which we are rotating
                var pivotRot = node.getAbsoluteOrientation( TempVars.getQuaternion() );

                /*
                 * Move the rotation point at the origin and apply the inverse rotation of the
                 * node we are rotating around.
                 */
                pivotRot.inverse().multiplyVector3( newPos.subtract( pivotPos ) );

                //Do the rotation as if we where rotating around Node.Origin
                rot.multiplyVector3( newPos );

                //Move back to the original rotation and position
                pivotRot.inverse().multiplyVector3( newPos ).add( pivotPos );
            }
            //Set the position calculated to the node
            this.setAbsolutePosition( newPos );
        }

        //The orientation change is always the same whether we rotate around ourselfs or around a node
        this.orientation.preMultiply( rot );

        TempVars.release();
        return this.invalidate();
    },
    move: function( vector, node ) {
        if ( node ) {
            if ( node == Node.Origin ) {
                TempVars.lock();
                var newPos = this.getAbsolutePosition( TempVars.getVector3() ).add( vector );
                this.setAbsolutePosition( newPos );
                TempVars.release();
                //We don't have to invalidate again. setAbsolutePosition just did it.
                return this;
            }
            else {
                throw 'Not yet implemented';
            }
        }
        else {
            this.position.add( vector );
        }
        return this.invalidate();
    },
    appendChild: function( node ) {
        if ( node.parent !== Node.Origin ) {
            node.parent.removeChild( node );
        }

        node.parent = this;
        this.children.push( node );
        node.invalidate();

        this.onChildAdded( this, node );
        return this;
    },
    onChildAdded: function( node, nodeAdded ) {
        if ( this !== Node.Origin ) {
            this.parent.onChildAdded( node, nodeAdded );
        }
    },
    removeChild: function( node ) {
        var children = this.children;
        var l = children.length;

        node.parent = Node.Origin;
        node.invalidate();
        children.splice( children.indexOf( node ), 1 );
        this.onChildRemoved( this, node );

        return this;
    },
    onChildRemoved: function( node, nodeRemoved ) {
        if ( this !== Node.Origin ) {
            this.parent.onChildRemoved( node, nodeRemoved );
        }
    },
    getAbsoluteMatrix: function( dest ) {
        if ( !dest ) {
            dest = new Matrix4();
        }
        this.update();
        return dest.set( this.worldTransform.getMatrix() );
    },
    getAbsoluteInverseMatrix: function( dest ) {
        if ( !dest ) {
            dest = new Matrix4();
        }
        this.update();
        return dest.set( this.worldTransform.getInverseMatrix() );
    },
    update: function() {
        if ( this.needsUpdate ) {
            this.Transform_update();
            var parent = this.parent;
            parent.update();
            this.worldTransform.set( this ).combineWith( parent.worldTransform );
        }
        return this;
    },
    invalidate: function() {
        this.Transform_invalidate();
        var l = this.children.length;
        while ( l-- ) {
            this.children[ l ].invalidate();
        }
        return this;
    },
    getExportData: function( exporter ) {
        var ret = {};
        ret.position = this.getPosition().setTo( [] );
        ret.orientation = this.getOrientation().setTo( [] );
        ret.scale = this.getScale();
        ret.name = this.name;
        ret.children = [];
        var l = this.children.length;
        while ( l-- ) {
            var child = this.children[ l ];
            ret.children.push( child.name );
            exporter.alsoSave( child );
        }
        return ret;
    },
    setImportData: function( importer, data ) {
        this.name = data.name;
        this.setPosition( data.position );
        this.setOrientation( data.orientation );
        this.setScale( data.scale );
        var l = data.children.length;
        while( l-- ) {
            importer.alsoLoad( data.children[ l ], this.appendChild.bind( this ) );
        }
    }
};

Node.extend( Transform );

Node.Origin = new Node();
Node.Origin.parent = Node.Origin; // god
