// extern
var Drawable, Node;

function Animable(){
    Drawable.call( this );
    this.skeleton = null;
}

Animable.prototype = {
    constructor: Animable,
    onBeforeRender: function( camera ) {
        this.skeleton.updateJointUniforms();
        //Βαγγέλης Νικολουδάκης
        this.material.setParameter( 'JointPositionsAndScales', this.skeleton.jointPositionsAndScales );
        this.material.setParameter( 'JointOrientations', this.skeleton.jointOrientations );
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
