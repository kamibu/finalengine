function Exporter( resourcePath ) {
    if ( resourcePath[ resourcePath.length - 1 ] !== '/'  ){
        resourcePath += '/';
    }
    this.resourcePath = resourcePath;
}

Exporter.prototype = {
    save: function( object ) {
        var data = { library: {}, object: object.name };
        data.library[ object.name ] = {
            'class': object.constructor.name,
            'data': object.getExportData( this )
        };
        Request.post( this.resourcePath + 'exporter.php', { data: JSON.stringify( data ) } );
    },
    alsoSave: function( object ) {
        this.save( object );
    }
};
