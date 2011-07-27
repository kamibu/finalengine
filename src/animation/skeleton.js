define( [ 'libs/math' ], function( math ) {

    var Skeleton = function() {
        this.root = null;
        this.animations;
        this.nextId = 0;
    }
  
    var tetra = math.tetra;
    
    Skeleton.prototype = {
        calculateMatrices: function() {
            var mats = [];
            
            function traverseTree( root ) {
                mats[ root.id ] = calcNodeMatrix( mat4.identity( [] ), root.getPosition(), root.getOrientation() );
                traverseNode( root );
                
                var l = mats.length;
                for( var i = 0; i < l; ++i ) {
                    mats.push.apply( mats, mats.shift() );
                }
            }
            
            function calcNodeMatrix( parentMat, position, orientation ) {
                var T, R, result;
                T = [];
                mat4.identity( T );
                T[ 12 ] -= position[ 0 ];
                T[ 13 ] -= position[ 1 ];
                T[ 14 ] -= position[ 2 ];
                R = tetra.rotMatrix( orientation );
                mat4.multiply( R, T );
                R[ 12 ] += position[ 0 ];
                R[ 13 ] += position[ 1 ];
                R[ 14 ] += position[ 2 ];
                result = [];
                mat4.multiply( parentMat, R, result );
                return result;
            }
            
            function traverseNode( node ) {
                var id, i, T, R, result, l, pos, child;
                l = node.children.length;
                for( i = 0; i < l; ++i ) {
                    child = node.children[ i ];
                    mats[ child.id ] = calcNodeMatrix( mats[ node.id ], child.getPosition(), child.getOrientation() );
                    traverseNode( child );
                }            
            }
            
            traverseTree( root );
            
            return new Float32Array( mats );
        }
    }
    return Skeleton;
} );