/*
getMatrix after position, rotation, scale

transformations on node tree with depth >= 5

getAbsolute(Orientation|Position|Rotation)
*/

testcase = new Testcase();

// assumes getPosition works correctly
testcase.setPosition = function() {
    var transform = new Transform();
    this.assertArrayEquals( transform.getPosition(), [ 0, 0, 0 ], 'getPosition on new transform' );

    transform.setPosition( [ 2, -3, 1 ] );
    this.assertArrayEquals( transform.getPosition(), [ 2, -3, 1 ], 'getPosition after setPosition' );
};

testcase.getMatrix = function() {
    var transform = new Transform();

    transform.setPosition( [ 10, -2, 3 ] );
    var m = Matrix4().identity();
    m[ 12 ] = 10;
    m[ 13 ] = -2;
    m[ 14 ] = 3;
    this.assertArrayEquals( transform.getMatrix(), m, 'getMatrix after setPosition' );
};
