function SoundAsset( data ) {
    this.uid = SoundAsset.uid++;
    this.data = data;
    /*
    this.tag = document.createElement( 'audio' );
    var sourceTag = document.createElement( 'source' );
    sourceTag.src = src;
    sourceTag.type = 'audio/mp3';
    this.tag.appendChild( sourceTag );
    */
}

SoundAsset.uid = 0;

