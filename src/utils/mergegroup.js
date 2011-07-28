//define( [ 'libs/math', 'models/mesh' ], function( math, Mesh ) {
//    var tetra = math.tetra;
//
//    var MergeGroup = function() {
//        this.objectList = [];
//    }
//
//    MergeGroup.prototype = {
//        add: function( drawable ) {
//            this.objectList.push( drawable );
//        },
//        merge: function( autodestroy ) {
//            if( autodestroy === undefined ) {
//                autodestroy = true;
//            }
//            var objectsByMaterial = {};
//            var currentMaterial;
//            
//            function createMaterialList( material ) {
//                objectsByMaterial[ material.id ] = {
//                    vertices: [],
//                    indices: [],
//                    normals: [],
//                    uvcoords: [],
//                    material: material
//                }
//            }
//            
//            
//            var vertexCount, d, i, mat, quat;
//            for ( var d = 0; d < this.objectList.length; ++d ) {        
//                if ( objectsByMaterial[ this.objectList[ d ].material.id ] === undefined ) {
//                    createMaterialList( this.objectList[ d ].material );
//                }
//                currentMaterial = objectsByMaterial[ this.objectList[ d ].material.id ];
//                mat = this.objectList[ d ].getMatrix();
//                quat = tetra.lookAt( -mat[ 8 ], -mat[ 9 ], - mat[ 10 ] );
//                vertexCount = currentMaterial.vertices.length / 3;
//                for( i = 0; i < this.objectList[ d ].mesh.vertices.length / 3; ++i ) {
//                    Array.prototype.push.apply( currentMaterial.vertices, mat4.multiplyVec3( mat, [
//                        this.objectList[ d ].mesh.vertices[ 3 * i ],
//                        this.objectList[ d ].mesh.vertices[ 3 * i + 1 ],
//                        this.objectList[ d ].mesh.vertices[ 3 * i + 2 ]
//                    ] ) );
//                    if ( this.objectList[ d ].normals !== undefined ) {
//                        Array.prototype.push.apply( currentMaterial.normals, tetra.multiplyVec3( quat, [
//                            this.objectList[ d ].normals[ 3 * i ],
//                            this.objectList[ d ].normals[ 3 * i + 1 ],
//                            this.objectList[ d ].normals[ 3 * i + 2 ]
//                        ] ) );
//                    }
//                    else {
//                        currentMaterial.normals.push( 0, 0, 1 );
//                    }
//                }
//                Array.prototype.push.apply( currentMaterial.uvcoords, this.objectList[ d ].uvcoords );
//                Array.prototype.push.apply( currentMaterial.indices, this.objectList[ d ].mesh.indices.map( function( element ) {
//                    return element + vertexCount;
//                } ) );
//            }
//            
//            var ret = [];
//            
//            for( i in objectsByMaterial ){
//                var center = [ 0, 0, 0 ];
//                var verts = objectsByMaterial[ i ].vertices;
//                for ( var j = 0; j < verts.length / 3; ++j ) {
//                    center = dian3.add( [ verts[ j * 3 ], verts[ j * 3 + 1 ], verts[ j * 3 + 2 ] ], center );
//                }
//                center = dian3.scale( center, 1 / ( verts.length / 3 ) );
//                for ( var j = 0; j < verts.length / 3; ++j ) {
//                    verts[ j * 3 ] -= center[ 0 ];
//                    verts[ j * 3 + 1 ] -= center[ 1 ];
//                    verts[ j * 3 + 2 ] -= center[ 2 ];
//                }
//                var foo = this.objectList[ 0 ].renderer.createDrawable( {
//                    mesh: new Mesh( objectsByMaterial[ i ].vertices, objectsByMaterial[ i ].indices ),
//                    uvcoords: objectsByMaterial[ i ].uvcoords,
//                    normals: objectsByMaterial[ i ].normals,
//                    material: objectsByMaterial[ i ].material
//                } );
//                foo.moveTo.apply( foo, center );
//                ret.push( foo );
//            }
//            return ret;
//        }
//    }
//    
//    return MergeGroup;
//} );
