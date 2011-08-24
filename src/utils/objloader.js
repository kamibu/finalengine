var EventWaiter, Importer, Texture, Node, Buffer, VertexBuffer, Drawable, Mesh;

function OBJLoader() {
    this.ready = false;
    var self = this;
    var im = new Importer( 'resources' );
    var waiter = new EventWaiter();
    waiter.waitMore();
    this.texturedMaterial = null;
    
    im.load( 'textured', function( textured ) {
        self.texturedMaterial = textured;
        waiter.waitLess();
    } );
    waiter.on( 'complete', function() {
        self.ready = true;
        if ( self.pending.length > 0 ) {
            self.loadOBJ.apply( self, self.pending.pop() );
        }
    } );
    this.mtlCache = {};
    this.objCache = {};
    this.pending = [];
}

OBJLoader.prototype = {
    constructor: OBJLoader,
    loadMtl: function( url, callback ) {
        var that = this;
        
        if ( this.mtlCache[ url ] !== undefined ) {
            // cache hit
            callback( this.mtlCache[ url ] );
            return;
        }
        
        /*Find the base url in order to construct the path for the texture maps*/
        var baseUrl = url.substring( 0, url.lastIndexOf( '/' ) + 1 );
        
        var matReq = new XMLHttpRequest();
        matReq.open( 'GET', url );
        matReq.onreadystatechange = function() {
            if ( matReq.readyState == 4 ) {
                //This map will hold an object for each material found in the mtl file
                var materials = {};
                
                /*Get the response and put each line in an array*/
                var lines = matReq.responseText.split( '\n' );
                
                var i, line, l = lines.length, currentMaterial;
                
                /*Parse the file line by line*/
                for ( i = 0; i < l; i++ ) {
                    /*Trim each line and split it in parts with whitespace as separator*/
                    line = lines[ i ].trim().split( /\s+/ );
                    switch ( line[ 0 ] ){
                        /*A new material definition starts here.*/
                        case 'newmtl':
                            /*Every line following this one will this material definion
                             *Keep the current material name*/
                            currentMaterial = line[ 1 ];
                            /*Make a new object in which the material parameters will be saved*/
                            materials[ currentMaterial ] = {};
                            break;
                        case 'map_Kd':
                            /*A diffuse texture map. Store the url pointing to the image*/
                            materials[ currentMaterial ].diffuseTexture = baseUrl + line[ 1 ];
                            break;
                        case 'Ka':
                            /*The material's ambient color*/
                            materials[ currentMaterial ].ambient = [ line[ 1 ], line[ 2 ], line[ 3 ] ];
                            break;
                        case 'Kd':
                            /*The material's diffuse color*/
                            materials[ currentMaterial ].diffuse = [ line[ 1 ], line[ 2 ], line[ 3 ] ];
                            break;
                        case 'Ks':
                            /*The material's specular color*/
                            materials[ currentMaterial ].specular = [ line[ 1 ], line[ 2 ], line[ 3 ] ];
                            break;
                        case 'bump':
                            /*A bump map. Store the url pointing to the image*/
                            materials[ currentMaterial ].bumpTexture = baseUrl + line[ 1 ];
                            break;
                    }
                }
                var textureCache = {};

                for ( var material in materials ) {
                    if ( materials[ material ].diffuseTexture !== undefined ) {
                        var texture = materials[ material ].diffuseTexture;
                        materials[ material ] = that.texturedMaterial.clone();
                        materials[ material ].name = material;
                        
                        var tex;
                        if ( textureCache[ texture ] ) {
                            tex = textureCache[ texture ];
                        }
                        else {
                            var img = new Image();
                            img.src = texture;
                            tex = textureCache[ texture ] = new Texture().setImage( img );
                        }

                        materials[ material ].setParameter( 'texture', tex );
                    }
                    else {
                        materials[ material ] = that.texturedMaterial.clone();
                        materials[ material ].name = material;
                        materials[ material ].setParameter( 'texture', new Texture() );
                    }
                }
                that.mtlCache[ url ] = materials; // memoize
                callback( materials );
            }
        };
        matReq.send();
    },
    loadOBJ: function( url, callback ) {
        /*WRAPPER FUNCTIONS*/
            if ( !this.ready ) {
                this.pending.push( arguments );
                return;
            }
            var myCallback = callback;
            callback = function( objectsByMaterial ) {
                var node = new Node();
                for ( var material in objectsByMaterial ) {
                    var d = new Drawable();
                    var obj = objectsByMaterial[ material ];

                    var vertices = new Buffer( Buffer.DATA_BUFFER, Buffer.STATIC );
                    vertices.setData( obj.vertices );

                    var uvcoords = new Buffer( Buffer.DATA_BUFFER, Buffer.STATIC );
                    uvcoords.setData( obj.uvcoords );

                    var normals = new Buffer( Buffer.DATA_BUFFER, Buffer.STATIC );
                    normals.setData( obj.normals );

                    var verticesVB = new VertexBuffer( 'Position' );
                    verticesVB.setBuffer( vertices );

                    var normalsVB = new VertexBuffer( 'Normal' );
                    normalsVB.setBuffer( normals );

                    var uvcoordsVB = new VertexBuffer( 'UVCoord' );
                    uvcoordsVB.size = 2;
                    uvcoordsVB.setBuffer( uvcoords );

                    var indices = new Buffer( Buffer.ELEMENT_BUFFER, Buffer.STATIC );
                    indices.setData( obj.indices );

                    var m = new Mesh();
                    m.setVertexAttribute( verticesVB );
                    m.setVertexAttribute( normalsVB );
                    m.setVertexAttribute( uvcoordsVB );
                    m.setIndexBuffer( indices );

                    d.mesh = m;
                    d.setMaterial( obj.material );
                    m.name = material + '_mesh';
                    d.name = material + '_drawable';
                    node.appendChild( d );
                }
                myCallback( node );
            };
        /*----*/
        var that = this;
        
        if ( this.objCache[ url ] !== undefined ) {
            // cache hit
            callback( this.objCache[ url ] );
            return;
        }
        
        var baseUrl = url.substring( 0, url.lastIndexOf( '/' ) + 1 );
        var vReq = new XMLHttpRequest();
        vReq.open( 'GET', url );
        vReq.onreadystatechange = function() {
            if ( vReq.readyState == 4 ) {
                var data = vReq.responseText;
                var lines = data.split( "\n" );
                var i, j, line, activeMaterial, indicesIndex;
                
                var vList = [];
                var nList = [];
                var tList = [];
                
                var ret = {};
                var materialsLoaded = true;
                var materialCallback = function( materials ) {
                    for ( var material in ret ) {
                        if ( material === 'default' ) {
                            continue;
                        }
                        ret[ material ].material = materials[ material ];
                    }
                    that.objCache[ url ] = ret; // memoize
                    callback( ret );
                };
                
                ret[ 'default' ] = {
                    vertices: [],
                    normals: [],
                    uvcoords:[],
                    indices: [],
                    material: 'solid',
                    indexIndex: 0 //lol
                };
                activeMaterial = ret[ 'default' ];
                
                var lineCount = lines.length, hit;
                for ( i = 0; i < lineCount; ++i ){
                    line = lines[ i ].trim().split( /\s+/ );
                    switch ( line[ 0 ] ) {
                        case 'mtllib':
                            materialsLoaded = false;
                            that.loadMtl( baseUrl + line[ 1 ], materialCallback );
                            break;
                        case 'usemtl': //Group Data
                            var materialName = line[ 1 ];
                            if ( ret[ materialName ] === undefined ) {
                                ret[ materialName ] = {
                                    vertices: [],
                                    normals: [],
                                    uvcoords:[],
                                    indices: [],
                                    uberObject: {},
                                    indexIndex: 0 //lol
                                };
                            }
                            activeMaterial = ret[ materialName ];
                            break;
                        case 'v': //Vertex Data
                            vList.push( line[ 1 ], line[ 2 ], line[ 3 ] );
                            break;
                        case 'vn': //Normal Data
                            nList.push( line[ 1 ], line[ 2 ], line[ 3 ] );
                            break;
                        case 'vt': //Normal Data
                            tList.push( line[ 1 ], line[ 2 ] );
                            break;
                        case 'f': //Face definition
                            var vertexIndex, uvIndex, normalIndex, words;
                            for ( j = 1; j <= 3; ++j ) {
                                words = line[ j ].split( '/' );
                                vertexIndex = ( words[ 0 ] - 1 ) * 3;
                                uvIndex = ( words[ 1 ] - 1 ) * 2;
                                normalIndex = ( words[ 2 ] - 1 ) * 3;
                                
                                hit = activeMaterial.uberObject[ line[ j ] ];
                                if ( hit ) {
                                    activeMaterial.indices.push( hit );
                                }
                                else {
                                    activeMaterial.vertices.push( vList[ vertexIndex ], vList[ vertexIndex  + 1 ], vList[ vertexIndex  + 2 ] );
                                    activeMaterial.uvcoords.push( tList[ uvIndex ], tList[ uvIndex  + 1 ] );
                                    activeMaterial.normals.push( nList[ normalIndex ], nList[ normalIndex + 1 ], nList[ normalIndex + 2 ] );
                                    activeMaterial.indices.push( activeMaterial.indexIndex );

                                    activeMaterial.uberObject[ line[ j ] ] = activeMaterial.indexIndex++;
                                }
                                
                            }
                            if ( line[ 4 ] !== undefined ) {
                                vertexIndex = ( line[ 3 ].split( '/' )[ 0 ] - 1 ) * 3;
                                uvIndex = ( line[ 3 ].split( '/' )[ 1 ] - 1 ) * 2;
                                normalIndex = ( line[ 3 ].split( '/' )[ 2 ] - 1 ) * 3;

                                hit = activeMaterial.uberObject[ line[ 3 ] ];
                                if ( hit ) {
                                    activeMaterial.indices.push( hit );
                                }
                                else {
                                    activeMaterial.vertices.push( vList[ vertexIndex ], vList[ vertexIndex  + 1 ], vList[ vertexIndex  + 2 ] );
                                    activeMaterial.uvcoords.push( tList[ uvIndex ], tList[ uvIndex  + 1 ] );
                                    activeMaterial.normals.push( nList[ normalIndex ], nList[ normalIndex + 1 ], nList[ normalIndex + 2 ] );
                                    activeMaterial.indices.push( activeMaterial.indexIndex );

                                    activeMaterial.uberObject[ line[ j ] ] = activeMaterial.indexIndex++;
                                }
                                
                                vertexIndex = ( line[ 4 ].split( '/' )[ 0 ] - 1 ) * 3;
                                uvIndex = ( line[ 4 ].split( '/' )[ 1 ] - 1 ) * 2;
                                normalIndex = ( line[ 4 ].split( '/' )[ 2 ] - 1 ) * 3;

                                hit = activeMaterial.uberObject[ line[ 4 ] ];
                                if ( hit ) {
                                    activeMaterial.indices.push( hit );
                                }
                                else {
                                    activeMaterial.vertices.push( vList[ vertexIndex ], vList[ vertexIndex  + 1 ], vList[ vertexIndex  + 2 ] );
                                    activeMaterial.uvcoords.push( tList[ uvIndex ], tList[ uvIndex  + 1 ] );
                                    activeMaterial.normals.push( nList[ normalIndex ], nList[ normalIndex + 1 ], nList[ normalIndex + 2 ] );
                                    activeMaterial.indices.push( activeMaterial.indexIndex );

                                    activeMaterial.uberObject[ line[ j ] ] = activeMaterial.indexIndex++;
                                }
                                
                                vertexIndex = ( line[ 1 ].split( '/' )[ 0 ] - 1 ) * 3;
                                uvIndex = ( line[ 1 ].split( '/' )[ 1 ] - 1 ) * 2;
                                normalIndex = ( line[ 1 ].split( '/' )[ 2 ] - 1 ) * 3;

                                hit = activeMaterial.uberObject[ line[ 1 ] ];
                                if ( hit ) {
                                    activeMaterial.indices.push( hit );
                                }
                                else {
                                    activeMaterial.vertices.push( vList[ vertexIndex ], vList[ vertexIndex  + 1 ], vList[ vertexIndex  + 2 ] );
                                    activeMaterial.uvcoords.push( tList[ uvIndex ], tList[ uvIndex  + 1 ] );
                                    activeMaterial.normals.push( nList[ normalIndex ], nList[ normalIndex + 1 ], nList[ normalIndex + 2 ] );
                                    activeMaterial.indices.push( activeMaterial.indexIndex );

                                    activeMaterial.uberObject[ line[ j ] ] = activeMaterial.indexIndex++;
                                }
                            }
                    }
                }
                for ( i in ret ) {
                    if ( ret[ i ].indices.length === 0 ) {
                        delete ret[ i ];
                    }
                }
                if ( materialsLoaded ) {
                    that.objCache[ url ] = ret; // memoize
                    callback( ret );
                }
            }
        };
        vReq.send();
    }
};
