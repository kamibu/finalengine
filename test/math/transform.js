/*
getMatrix after position, rotation, scale

transformations on node tree with depth >= 5

getAbsolute(Orientation|Position|Rotation)
*/

testcase = new Testcase();

// simple checks on getters
// (assume setters are correct)

testcase.getPosition = function() {
    var transform = new Transform();
    this.assertArrayEquals( transform.getPosition(), [ 0, 0, 0 ], 'getPosition on new transform' );

    transform.setPosition( [ 2, -3, 1 ] );
    this.assertArrayEquals( transform.getPosition(), [ 2, -3, 1 ], 'getPosition after setPosition' );

    var vec3 = new Vector3();
    transform.getPosition( vec3 );
    this.assertArrayEquals( vec3, [ 2, -3, 1 ], 'getPosition with destination' );

    transform.setPosition( [ 0, 0, 0 ] );
    this.assertArrayEquals( transform.getPosition(), [ 0, 0, 0 ], 'getPosition after 0, 0, 0 setPosition' );

};

testcase.getOrientation = function() {
    var transform = new Transform();
    this.assertArrayEquals( transform.getOrientation(), [ 0, 0, 0, 1 ], 'getOrientation on new transform' );

    transform.setOrientation( [ 0.5, 0.5, 0.5, 0.5 ] );
    this.assertArrayEquals( transform.getOrientation(), [ 0.5, 0.5, 0.5, 0.5 ], 'getOrientation after setOrientation' );

    var q = new Quaternion();
    transform.getOrientation( q );
    this.assertArrayEquals( q, [ 0.5, 0.5, 0.5, 0.5 ], 'getOrientation with destination' );
};

testcase.getScale = function() {
    var transform = new Transform();
    this.assertEquals( transform.getScale(), 1, 'getScale on new transform' );

    transform.setScale( 0.2 );
    this.assertEquals( transform.getScale(), 0.2, 'getScale after setScale' );

    transform.setScale( 0 );
    this.assertEquals( transform.getScale(), 0, 'getScale after 0 setScale' );

    // what happens on negative scale?
};

// now check for the changes of setters on getMatrix
// (assume getMatrix is correct)

testcase.setPosition = function() {
    var transform = new Transform();

    transform.setPosition( [ -4, 3, 2 ] );
    this.assertArrayEquals( transform.getMatrix().subarray( 12, 15 ), [ -4, 3, 2 ], 'setPosition' );

    transform.setPosition( [ 0, 0, 0 ] );
    this.assertArrayEquals( transform.getMatrix().subarray( 12, 15 ), [ 0, 0, 0 ], 'setPosition back to origin' );
};

testcase.setOrientation = function() {
    var transform = new Transform();

    transform.setOrientation( [ 0.5, 0.5, 0.5, 0.5 ] );
    this.assertArrayEquals( transform.getMatrix().subarray( 0, 12 ), 
                            [ 0, 0, 1, 0, 
                              1, 0, 0, 0, 
                              0, 1, 0, 0 ], 
                              'setOrientation' );

    transform.setOrientation( [ 0, 0, 0, 1 ] );
    this.assertArrayEquals( transform.getMatrix().subarray( 0, 12 ), [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0 ], 'setOrientation back to 0, 0, 0, 1' );
};

testcase.setScale = function() {
    var transform = new Transform();

    transform.setOrientation( [ 0.5, 0.5, 0.5, 0.5 ] );
    transform.setScale( 2 );
    this.assertArrayEquals( transform.getMatrix().subarray( 0, 12 ),
                            [ 0, 0, 2, 0,
                              2, 0, 0, 0,
                              0, 2, 0, 0 ],
                              'setScale after setOrientation' );

    transform.setScale( 0.5 );
    this.assertArrayEquals( transform.getMatrix().subarray( 0, 12 ),
                            [ 0, 0, 0.5, 0,
                              0.5, 0, 0, 0,
                              0, 0.5, 0, 0 ],
                              'setScale after setOrientation' );

    transform.setScale( 0 );
    this.assertArrayEquals( transform.getMatrix().subarray( 0, 12 ), [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], 'setScale to 0' );
};

testcase.setIdentity = function() {
};

// check getMatrix after multiple setters
// (assume setters are correct)

testcase.getMatrix = function() {
    var transform = new Transform();

    transform.setPosition( [ 10, -2, 3 ] );
    var m = Matrix4().identity();
    m[ 12 ] = 10;
    m[ 13 ] = -2;
    m[ 14 ] = 3;
    this.assertArrayEquals( transform.getMatrix(), m, 'getMatrix after setPosition' );
};

testcase.getInverseMatrix = function() {
};

testcase.set = function() {
};


// at last, check combined transformations

testcase.combineWith = function() {
};
