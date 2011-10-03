/*global
    BoundingSphere  :  false,
    Matrix4         :  false,
    Quaternion      :  false,
    TempVars        :  false,
    Transform       :  false,
    UUID            :  false,
    Vector3         :  false
*/

/**
 * @class
 * <p>An abstract 3 dimensional object with a location in space and a tree-like structure.</p>
 *
 * <p>Inherited position, orientation and scale from Transform represent transformations in local coordinates, relative to the parent node. All transformations applied to a node are recursively applied to its children too.</p>
 *
 * @extends Transform
 */
function Node() {
    /**
     * @public
     * @see UUID
     */
    this.uuid = UUID.generateCanonicalForm();

    /**
     * @public
     * @default Node.Origin
     * */
    this.parent = Node.Origin;

    /**
     * @public
     * @default []
     */
    this.children = [];

    this.worldTransform = new Transform();
    this.name = this.uuid;
    this.boundingVolume = new BoundingSphere();
    Transform.call( this );
}

Node.prototype = {
    constructor: Node,
    /**
     * @param {Vector3} [dest]
     * @returns dest if specfied, a new Vector3 otherwise.
     */
    getAbsolutePosition: function( dest ) {
        if ( !dest ) {
            dest = new Vector3();
        }
        this.update();
        return dest.set( this.worldTransform.position );
    },
    /**
     * @param {Vector3} position
     * @returns this
     */
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
    /**
     * @param {Quaternion} [dest] Alter dest instead of creating new quaternion.
     * @returns dest if specified, new quaternion otherwise.
     */
    getAbsoluteOrientation: function( dest ) {
        if ( !dest ) {
            dest = new Quaternion();
        }
        this.update();
        return this.worldTransform.getOrientation( dest );
    },
    /**
     * @param {Quaternion} orientation
     * @returns this
     */
    setAbsoluteOrientation: function( orientation ) {
        TempVars.lock();
        this.worldTransform.setOrientation( orientation );
        this.orientation.set( this.parent.getAbsoluteOrientation( TempVars.getQuaternion() ).inverse().preMultiply( orientation ) );
        TempVars.release();
        return this.invalidate();
    },
    /**
     * @returns {Number} scale
     */
    getAbsoluteScale: function() {
        this.update();
        return this.worldTransform.getScale();
    },
    /**
     * @param {Number} scale
     * @returns this
     */
    setAbsoluteScale: function( scale ) {
        this.worldTransform.setScale( scale );
        this.scale = scale / this.parent.getAbsoluteScale();
        return this.invalidate();
    },
    /**
     * Rotates node around itself or another object.
     * @param {Array} axis A 3-element vector representing the axis.
     * @param {Number} angle Angle to rotate in radians.
     * @param {Node} [node] If specified, rotate around this node.
     * @returns this
     */
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
    /**
     * Moves node relative to its current position or the position of another node.
     * @param {Vector3} vector The position transformation vector.
     * @param {Node} [node] Move relatively to node instead of the current position.
     * @returns this
     */
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
    /**
     * Override this method to process the addition of a node anywhere in the tree below this node.
     * @params {Node} node The node that was added to the tree.
     */
    onChildAdded: function( node ) {
        if ( this !== Node.Origin ) {
            this.parent.onChildAdded( node );
        }
    },
    /**
     * Removes child from list of children and reset child's parent reference to Node.Origin
     * @param {Node} node The node to remove.
     * @returns this */
    removeChild: function( node ) {
        var children = this.children;
        var l = children.length;

        node.parent = Node.Origin;
        node.invalidate();
        children.splice( children.indexOf( node ), 1 );
        this.onChildRemoved( node, this );

        return this;
    },
    /**
     * Override this method to process the removal of a node anywhere in the tree below this node.
     * @params {Node} node The node that wars removed from the tree.
     * @params {Node} parentNode The previous parent of the node.
     */
    onChildRemoved: function( node, parentNode ) {
        if ( this !== Node.Origin ) {
            this.parent.onChildRemoved( node, parentNode );
        }
    },
    /**
     * Returns world-coordinate transformation matrix.
     * @param {Matrix4} [dest] Alter dest instead of creating a new matrix.
     * @returns {Matrix4} dest if specified, a new matrix otherwise.
     */
    getAbsoluteMatrix: function( dest ) {
        if ( !dest ) {
            dest = new Matrix4();
        }
        this.update();
        return dest.set( this.worldTransform.getMatrix() );
    },
    /**
     * Returns the inverse of world-coordinate transformation matrix.
     * @param {Matrix4} [dest] Alter dest instead of creating a new matrix.
     * @returns {Matrix4} dest if specified, a new matrix otherwise.
     */
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
        ret.position = this.getPosition() + '';
        ret.orientation = this.getOrientation() + '';
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
        this.setPosition( new Vector3( data.position ) );
        this.setOrientation( new Vector3( data.orientation ) );
        this.setScale( data.scale );
        var l = data.children.length;
        while( l-- ) {
            importer.load( data.children[ l ], this.appendChild.bind( this ) );
        }
    }
};

Node.extend( Transform );

Node.Origin = new Node();
Node.Origin.parent = Node.Origin; // god
