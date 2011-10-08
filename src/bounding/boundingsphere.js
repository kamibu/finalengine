/*global
    BoundingVolume  :  false,
    TempVars        :  false
*/

/**
 * @constructor
 */
function BoundingSphere() {
    this.radius = 1;
}

BoundingSphere.prototype = {
    constructor: BoundingSphere,
    calculateFromVertices: function( positionAttribute ) {
        TempVars.lock();
        var temp = TempVars.getVector3();

        var maxRadius = 0;
        var radius;
        var l = positionAttribute.length;
        while ( l-- ) {
            radius = positionAttribute.getElement( l, temp ).length2();
            if ( radius > maxRadius ) {
                maxRadius = radius;
            }
        }
        this.radius = Math.sqrt( maxRadius );
        TempVars.release();
        return this;
    }
};
