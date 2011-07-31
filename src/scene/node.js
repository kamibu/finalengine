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
}

Node.prototype = {
    getAbsolutePosition: function( dest ) {
        if ( !dest ) {
            dest = Vector3();
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
        this.invalidate();
        TempVars.release();
        return this;
    },
    getAbsoluteOrientation: function( dest ) {
        return this.worldTransform.getOrientation( dest );
    },
    setAbsoluteOrientation: function( orientation ) {
        TempVars.lock();
        this.worldTransform.setOrientation( orientation );
        this.orientation.set( this.parent.getAbsoluteOrientation( TempVars.getQuaternion() ).inverse().multiply( orientation ) );
        TempVars.release();
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
        node.invalidate();
        return this;
    },
    removeChild: function( node ) {
        var children = this.children;
        var l = children.length;
        while ( l-- ) {
            if ( children[ l ] == node ) {
                node.parent = Node.Origin;
                node.invalidate();
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
        this.update();
        return dest.set( this.worldMatrix );
    },
    update: function() {
        if ( this.needsUpdate ) {
            this.Transform_update();
            var parent = this.parent;
            parent.update();
            this.worldTransform.set( parent.worldTransform ).combineWith( this );
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
    }
};

Node.extend( Transform );

Node.Origin = new Node();
Node.Origin.parent = Node.Origin;
