var Billboard = function() {
};

var square = utils.makeSquare( 0, 0, 1, 1 );
Billboard.mesh = new Mesh( square.vertices, square.indices ); 


Billboard.prototype.setText = function( text ) {
    var textHeight = 10;
    var TEXTURE_WIDTH = 512;
    //measurement canvas - used nowhere else
    var c = document.createElement( 'canvas' );
    c.height = textHeight;
    var sc = c.getContext( '2d' );
    sc.textBaseline = 'top';
    sc.font = 'bold ' + textHeight + 'px "Helvetica"';
    var textWidth = sc.measureText( text ).width;
    
    var c2 = document.createElement( 'canvas' );
    c2.width = TEXTURE_WIDTH;
    c2.height = TEXTURE_WIDTH;
    var s = c2.getContext( '2d' );

    s.textBaseline = sc.textBaseline;
    s.font = 'bold ' + Math.floor( TEXTURE_WIDTH * textHeight / textWidth ) + 'px "Helvetica"'; // sc.font; //same font style as the measurement canvas
    s.lineJoin = 'miter';

    //background
    s.fillStyle = 'rgba( 1, 0, 0, 1 )';
    s.fillRect( 0, 0, c2.width, c2.height );
    
    //text fill
    s.fillStyle = 'white';
    s.fillText( text, 3, 0 );

    var texture = this.renderer.gl.createTexture();
    this.renderer.gl.bindTexture( this.renderer.gl.TEXTURE_2D, this.texture );
    this.renderer.gl.texParameteri( this.renderer.gl.TEXTURE_2D, this.renderer.gl.TEXTURE_MAG_FILTER, this.renderer.gl.LINEAR );
    this.renderer.gl.texImage2D( this.renderer.gl.TEXTURE_2D, 0, this.renderer.gl.RGB, this.renderer.gl.RGB, this.renderer.gl.UNSIGNED_BYTE, c2 );
    this.renderer.gl.texParameteri( this.renderer.gl.TEXTURE_2D, this.renderer.gl.TEXTURE_MIN_FILTER, this.renderer.gl.LINEAR_MIPMAP_NEAREST );
    this.renderer.gl.generateMipmap( this.renderer.gl.TEXTURE_2D );
    this.renderer.gl.bindTexture( renderer.gl.TEXTURE_2D, null );
    this.material.inputs.s2texture = texture;
}
