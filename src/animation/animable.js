// extern
var Drawable, Node;

function Animable(){
    Drawable.call( this );
    this.skeleton = null;
    this.animations = null;

    this.activeAnimation = null;
    this.started = 0;
}

Animable.prototype = {
    constructor: Animable,
    playAnimation: function( name ) {
        this.activeAnimation = this.animations[ name ];
        this.started = Date.now();
    },
    onBeforeRender: function( camera ) {
        var skeleton = this.skeleton;
        var animation = this.activeAnimation;
        if ( animation ) {
            var keyframe = ( ( ( Date.now() - started ) / animation.duration ) * animation.keyframes ) % animation.keyframes;
            keyframe |= 0;

            var l = animation.matrices.length;
            TempVars.lock();
            var q = TempVars.getQuaternion();
            while ( l-- ) {
                var m = animation.matrices[ l ][ keyframe ];

                q.fromMatrix3( m );
                d.skeleton.jointSlots[ l ].setOrientation( q );
                d.skeleton.jointSlots[ l ].setScale( Math.sqrt( m[ 0 ] * m[ 0 ] + m[ 1 ] * m[ 1 ] + m[ 2 ] * m[ 2 ] ) );
            }
            TempVars.release();
        }

        skeleton.updateJointUniforms();
        this.material.setParameter( 'JointPositionsAndScales', skeleton.jointPositionsAndScales );
        this.material.setParameter( 'JointOrientations', skeleton.jointOrientations );
    },
    getExportData: function( exporter ) {
        var ret = {};
        ret.parent = this.Drawable_getExportData();

    },
    setImportData: function( importer, data ) {
        this.Drawable_setImportData( importer, data );

    }
};

Animable.extend( Drawable );
