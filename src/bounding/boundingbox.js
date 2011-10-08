/*global
    TempVars  :  false,
    Vector3   :  false
*/


/**
 * @constructor
 */
function BoundingBox() {
    this.halfExtent = new Vector3();
}

BoundingBox.prototype = {
    constructor: BoundingBox,
    calculateFromVertices: function( positionAttribute ) {
        TempVars.lock();
        var temp = TempVars.getVector3();
        var halfExtent = this.halfExtent;

        var l = positionAttribute.length;
        while ( l-- ) {
            positionAttribute.getElement( l, temp ).absolute();
            if ( temp[ 0 ] < halfExtent[ 0 ] ) {
                halfExtent[ 0 ] = temp[ 0 ];
            }
            if ( temp[ 1 ] < halfExtent[ 1 ] ) {
                halfExtent[ 1 ] = temp[ 1 ];
            }
            if ( temp[ 2 ] < halfExtent[ 2 ] ) {
                halfExtent[ 2 ] = temp[ 2 ];
            }
        }
        return this;
    }
};
