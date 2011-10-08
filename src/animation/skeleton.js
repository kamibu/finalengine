/*global
    Joint  : false,
    SceneNode      : false,
    Transform : false
*/

/**
 * @constructor
 */
function Skeleton() {
    SceneNode.call( this );
    this.jointPositionsAndScales = [];
    this.jointOrientations = [];

    this.jointSlots = [];
    this.tempTransform = new Transform();
    this.tempTransform2 = new Transform();
}

Skeleton.prototype = {
    constructor: Skeleton,
    updateJointUniforms: function() {
        var joint, pos, slots = this.jointSlots,
            l = slots.length,
            trans = this.tempTransform,
            trans2 = this.tempTransform2;

        if ( this.jointOrientations.length !== 4 * l ) {
            this.jointOrientations = new Float32Array( 4 * l );
            this.jointPositionsAndScales = new Float32Array( 4 * l );
        }

        var jointPositionsAndScales = this.jointPositionsAndScales;
        var jointOrientations = this.jointOrientations;

        while ( l-- ) {
            joint = slots[ l ];
            joint.getAbsolutePosition( trans.position );
            joint.getAbsoluteOrientation( trans.orientation );
            trans.setScale( joint.getAbsoluteScale() );

            trans2.set( joint.inverseBindTransform ).combineWith( trans );

            jointPositionsAndScales[ l * 4 + 0 ] = trans2.position[ 0 ];
            jointPositionsAndScales[ l * 4 + 1 ] = trans2.position[ 1 ];
            jointPositionsAndScales[ l * 4 + 2 ] = trans2.position[ 2 ];
            jointPositionsAndScales[ l * 4 + 3 ] = trans2.scale;
        
            jointOrientations[ l * 4 + 0 ] = trans2.orientation[ 0 ];
            jointOrientations[ l * 4 + 1 ] = trans2.orientation[ 1 ];
            jointOrientations[ l * 4 + 2 ] = trans2.orientation[ 2 ];
            jointOrientations[ l * 4 + 3 ] = trans2.orientation[ 3 ];
        }
    },
    findJoints: function( node ) {
        var bucket = [];
        function fillBucket( node ) {
            if ( node instanceof Joint ) {
                bucket.push( node );
            }
            var children = node.children;
            var l = children.length;
            while ( l-- ) {
                fillBucket( children[ l ] );
            }
        }
        fillBucket( node );
        return bucket;
    },
    /**
     * @override
     */
    onChildAdded: function( nodeAdded ) {
        this.SceneNode_onChildAdded( nodeAdded );
        var joints = this.findJoints( nodeAdded );
        var l = joints.length;
        while ( l-- ) {
            this.jointSlots[ l ] = joints[ l ];
        }
    },
    /**
     * @override
     */
    onChildRemoved: function( nodeRemoved ) {
        this.SceneNode_onChildRemoved( nodeRemoved );
        var joints = this.findJoints( nodeRemoved );
        var l = joints.length;
        while ( l-- ) {
            this.jointSlots.splice( this.jointSlots.indexOf( joints[ l ] ), 1 );
        }
    },
    getExportData: function( exporter ) {
        

    },
    setImportData: function( importer, data ) {

    }
};

Skeleton.extend( SceneNode );
