/**
 * @class
 * @constructor
 */
function SoundAsset( url ) {
    this.uid = SoundAsset.uid++;
    this.url = url;

    /*
    if ( data instanceof ArrayBuffer ) {
        this.data = data;
    }
    else if ( data instanceof HTMLElement ) {
        this.tag = data;
    }
    */

    /*
    this.tag = document.createElement( 'audio' );
    var sourceTag = document.createElement( 'source' );
    sourceTag.src = src;
    sourceTag.type = 'audio/mp3';
    this.tag.appendChild( sourceTag );
    */
}

SoundAsset.uid = 0;

