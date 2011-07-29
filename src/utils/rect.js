function Rect() {
};

Rect.prototype = {
    rectInterfere : function( rect1, rect2  ) {
        return !( rect1[1] > rect2[3] || //1bottom > 2top 
                  rect2[1] > rect1[3] || //2bottom > 1top
                  rect1[0] > rect2[2] || //1left > 2right
                  rect2[0] > rect1[2] ); // 2left > 1right
    },
    rectInterferenceArea : function( rect1, rect2 ) {
        if( !rectInterfere( rect1, rect2 ) ) {
            return false;
        }

        var top = Math.min( rect1[3], rect2[3] ),
        left = Math.max( rect1[0], rect2[0] ),
        bottom = Math.max( rect1[1], rect2[1] ),
        right = Math.min( rect1[2], rect2[2] );

        return ( [ [left,bottom], [right, top] ] );
    },
    parallepipedInterfere : function( box1, box2, pos1, pos2 ) {
        var i, p1 = [], p2 = [], ind;
        ind = [ 0,1,2,
                1,2,3,
                0,1,4,
                1,4,5,
                0,2,4,
                2,4,6,
                2,3,6,
                3,6,7,
                4,5,6,
                5,6,7,
                1,3,5,
                3,5,7 ];//parallepiped indices
        for ( i = 0; i < box1.length; i++ ) { //box1 real points
            p1.push( [ box1[i][0] + pos1[0], box1[i][1] + pos1[1], box1[i][2] + pos1[2] ] );
        }
        for ( i = 0; i < box2.length; i++ ) { //box2 real points
            p2.push( [ box2[i][0] + pos2[0], box2[i][1] + pos2[1], box2[i][2] + pos2[2] ] );
        }
        for ( i = 0; i < ind.length; i += 6 ) {
            if ( this.isSeperatingPlane( [ p1[ ind[i+0] ], p1[ ind[i+1] ], p1[ ind[i+2] ] ], p1, p2 ) ) {
                return false;
            }
        }
        for ( i = 0; i < ind.length; i += 6 ) {
            if ( this.isSeperatingPlane( [ p2[ ind[i+0] ], p2[ ind[i+1] ], p2[ ind[i+2] ] ], p1, p2 ) ) {
                return false;
            }
        }
        return true;
    },
    parallepipedInterfereArea : function( box1, box2, pos1, pos2 ) {
	    var i, p1 = [], p2 = [], 
        ind = [ 0,1,2,
                1,2,3,
                0,1,4,
                1,4,5,
                0,2,4,
                2,4,6,
                2,3,6,
                3,6,7,
                4,5,6,
                5,6,7,
                1,3,5,
                3,5,7 ];//parallepiped indices
        for ( i = 0; i < box1.length; i++ ) { //box1 real points
            p1.push( [ box1[i][0] + pos1[0], box1[i][1] + pos1[1], box1[i][2] + pos1[2] ] );
        }
        for ( i = 0; i < box2.length; i++ ) { //box2 real points
            p2.push( [ box2[i][0] + pos2[0], box2[i][1] + pos2[1], box2[i][2] + pos2[2] ] );
        }
        for ( i = 0; i < ind.length; i += 3 ) {
		    for ( var u = 0; u < ind.length; u += 3 ) {
			    if ( areTriesColliding( [ p1[ ind[i+0] ], p1[ ind[i+1] ], p1[ ind[i+2] ] ],
								    [ p2[ ind[u+0] ], p2[ ind[u+1] ], p2[ ind[u+2] ] ] ) ) {
				    return [ [ p1[ ind[i+0] ], p1[ ind[i+1] ], p1[ ind[i+2] ] ], 
						     [ p2[ ind[u+0] ], p2[ ind[u+1] ], p2[ ind[u+2] ] ] ];
			    }
		    }
        }
	    return false;
    },
    areTriesColliding : function( tri1, tri2 ) {
	    if ( tri1.length  != 3 || tri2.length != 3 ) {
		    return false;
	    }		
	    var allPoints = [];
	    allPoints = tri1.concat( tri2 );
	    for( var i = 0; i < 6; i++  ) {
		    for ( var u = i+1; u < 6; u++ ) {
			    for ( var j = u+1; j < 6; j++ ) {
				    if ( this.isSeperatingPlane( [ allPoints[ i ], allPoints[ u ], allPoints[ j ] ], tri1, tri2 ) ) {
					    return false;
				    }	
			    }
		    }
	    }
	    return true;
    },
    isSeperatingPlane : function( tri, points1, points2 ) {
       var normal = dian3.cross( dian3.subtract( tri[0], tri[1] ), dian3.subtract( tri[0], tri[2] ) );

       var checkDotProductSign = function( points ) {
            var sign = 0;
            for ( var i = 0; i < points.length; ++i ) {
                var prod = dian3.dot( normal, dian3.subtract( points1[i], tri[0] ) );
                if ( !prod ) {
                    continue; // cannot decide sign yet
                }
                if ( !sign ) { // we didn't have sign decided, so this is the element that decides it
                    sign = prod;
                    continue; // sign decided, go on checking next dot products
                }
                if ( sign * prod < 0 ) { // if different signs
                    return 0; // not a separating plane
                }
            }
            return sign; // may be a separating plane if the other has opposite sign
        };

        var sign1 = checkDotProductSign( points1 );
        if ( !sign1 ) { // no need to compute next product
            return false;
        }

        var sign2 = checkDotProductSign( points2 );

        return ( sign1 * sign2 < 0 );
    }
};
