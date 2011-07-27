define( [ './drawable' ], function( Drawable ) {
    var Animable = function ( data, renderer ) {
        if ( data.boneweights !== undefined ) { 
            this.BoneWeights = this.makeBuffer( data.boneweights, renderer );
        }
        if ( data.boneindices !== undefined ) {
            this.BoneIndices = this.makeBuffer( data.boneindices, renderer );
        }
        if ( data.skeleton !== undefined ) {
            this.skeleton = data.skeleton;
        }
    }.extend( Drawable );

    
    Animable.prototype = Drawable.prototype;
    Animable.prototype.parentRender = Animable.prototype.render;
    /*Animable.prototype.render = function() {
        this.material.set( 'm4BoneMatrices[0]', this.skeleton.calculateMatrices() );
        this.parentRender();
    }*/

    return Animable;
} );
