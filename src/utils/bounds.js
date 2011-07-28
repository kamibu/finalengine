function Bounds() {
}

Bounds.prototype = { 
    findBoundingRectangle: function( vert ) { 
        var x,y;//x [ min, max ]
        x = [ 0, 0 ];
        y = [ 0, 0 ];
        for ( var i=0,l=vert.length;i<l;i++ ) {
            if ( vert[i] < x[0] ) {
                x[0] = vert[i];
            }
            if ( vert[i] > x[1] ) {
                x[1] = vert[i];
            }
            i++;
            if ( vert[i] < y[0] ) {
                y[0] = vert[i];
            }
            if ( vert[i] > y[1] ) {
                y[1] = vert[i];
            }

            i+=2;
        }
        return [ x[0], y[0], x[1], y[1] ];    
    },
    findBoundingBox : function( vert ) {
        var x,y,z;//x [ min, max ]
        x = [ 999999999999, -99999999999 ];
        y = [ 999999999999, -99999999999 ];
        z = [ 999999999999, -99999999999 ];
        
        for ( var i=0,l=vert.length;i<l;i++ ) {
            if ( vert[i] < x[0] ) {
                x[0] = vert[i];
            }
            if ( vert[i] > x[1] ) {
                x[1] = vert[i];
            }
            i++;
            if ( vert[i] < y[0] ) { 
                y[0] = vert[i];
            }
            if ( vert[i] > y[1] ) {
                y[1] = vert[i];
            }
            i++;
            if ( vert[i] < z[0] ) {
                z[0] = vert[i];
            }
            if ( vert[i] > z[1] ) {
                z[1] = vert[i];
            }
        }
        return [ [ x[0] , y[0],z[0] ], [ x[1], y[1], z[1] ] ];      
    },
    findBoundingSphere: function( vert ) {
        var maxd = 0,temp;
        for ( var i = 0, l = vert.length; i < l; i+=3 ) {
            temp = vec3.length2( [ vert[i], vert[i+1], vert[i+2] ] );
            if ( temp > maxd  ) {
                maxd = temp;        
            }
        }
        return Math.sqrt( maxd );//return radius   
    }
};
