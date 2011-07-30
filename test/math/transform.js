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
    var transform = new Transform();

    transform.setIdentity();
    this.assertArrayEquals( transform.getMatrix(), [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ], 'setIdentity on new transform' );

    transform.setPosition( [ -2, 3, 4 ] );
    transform.setOrientation( [ 0.5, 0.5, 0.5, 0.5 ] );
    transform.setScale( 2 );
    transform.setIdentity();
    this.assertArrayEquals( transform.getMatrix(), [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ], 'setIdentity after setters' );

    // BUG: setIdentity does not invalidate matrix
    transform.setPosition( [ -2, 3, 4 ] );
    transform.setOrientation( [ 0.5, 0.5, 0.5, 0.5 ] );
    transform.setScale( 2 );
    transform.getMatrix();
    transform.setIdentity();
    this.assertArrayEquals( transform.getMatrix(), [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ], 'setIdentity after getMatrix' );
};

testcase.set = function() {
    var t1 = new Transform();

    var t2 = new Transform();
    t2.set( t1 );

    this.assertArrayEquals( t2.getMatrix(), Matrix4().identity(), 'set transformation to an empty transformation' );
};

// check getMatrix after multiple setters
// (assume setters are correct)

testcase.getMatrix = function() {
    var transform = new Transform();

    this.assertArrayEquals( transform.getMatrix(), Matrix4().identity(), 'getMatrix on new transformation' );

    transform.setPosition( [ 10, -2, 3 ] );
    var m = Matrix4().identity();

    m[ 12 ] = 10;
    m[ 13 ] = -2;
    m[ 14 ] = 3;

    this.assertArrayEquals( transform.getMatrix(), m, 'getMatrix after setPosition' );

    transform.setOrientation( [ 0.5, 0.5, 0.5, 0.5 ] );

    m[ 0 ] = 0;
    m[ 1 ] = 0;
    m[ 2 ] = 1;
    m[ 3 ] = 0;

    m[ 4 ] = 1;
    m[ 5 ] = 0;
    m[ 6 ] = 0;
    m[ 7 ] = 0;

    m[ 8 ] = 0;
    m[ 9 ] = 1;
    m[ 10 ] = 0;
    m[ 11 ] = 0;

    this.assertArrayEquals( transform.getMatrix(), m, 'getMatrix after setPosition and setOrientation' );

    transform.setScale( 2 );

    m[ 2 ] = 2;
    m[ 4 ] = 2;
    m[ 9 ] = 2;

    this.assertArrayEquals( transform.getMatrix(), m, 'getMatrix after having changed position, orientation and scale' ); 
};

testcase.getInverseMatrix = function() {
    var t = new Transform();
    this.assertArrayEquals( t.getInverseMatrix(), Matrix4().identity(), 'getInverseMatrix on new transformation' );

    t.setIdentity();
    this.assertArrayEquals( t.getInverseMatrix(), Matrix4().identity(), 'getInverseMatrix after setIdentity' );

    t.setPosition( [ 0.5, 2, 1 ] );
    var m1 = t.getMatrix();
    var m2 = t.getInverseMatrix();
    this.assertArrayEquals( m1.multiply( m2 ), Matrix4().identity(), 'getInverseMatrix after setting position' );
};


// at last, check combined transformations
testcase.combineWith = function() {
    var root = new Transform();
    root.setIdentity();
    
    var p1 = new Transform(); 
    p1.setPosition( [ 2, -4, 1 ] );
    var m1 = p1.getMatrix();
    p1.combineWith( root );
    
    this.assertArrayEquals( p1.getMatrix(), m1, 'combine position transformation with identity' );

    var p2 = new Transform();
    p2.setPosition( [ -1.5, 5, -1 ] );
    var m2 = p2.getMatrix();
    p2.combineWith( p1 );

    m2[ 12 ] = 0.5;
    m2[ 13 ] = 1;
    m2[ 14 ] = 0;

    this.assertArrayEquals( p2.getMatrix(), m2, 'combine position transformations' );

    var o1 = new Transform();
    o1.setOrientation( [ 0.5, 0.5, 0.5, 0.5 ] );
    var m3 = o1.getMatrix();
    o1.combineWith( root );

    this.assertArrayEquals( o1.getMatrix(), m3, 'combine orientation transformation with identity' );

    var o2 = new Transform();
    o2.setOrientation( [ 0.5, 0.5, 0.5, 0.5 ] );
    o2.combineWith( o1 );

    this.assertArrayEquals( o2.getMatrix(), 
                            [ 0, 1, 0, 0,
                              0, 0, 1, 0,
                              1, 0, 0, 0,
                              0, 0, 0, 1 ],
                            'combine orientation transformations' );

    var c1 = new Transform();
    c1.set( o2 );
    c1.combineWith( p2 );

    this.assertArrayEquals( c1.getMatrix(), 
                            [ 0, 1, 0, 0,
                              0, 0, 1, 0,
                              1, 0, 0, 0,
                              1, 0, 0.5, 1 ],
                            'combine orientation transformations with position transformations' );

    var c2 = new Transform();
    c2.setScale( 2 );
    c2.combineWith( c1 );

    this.assertArrayEquals( c2.getMatrix(), 
                            [ 0, 2, 0, 0,
                              0, 0, 2, 0,
                              2, 0, 0, 0,
                              2, 0, 1, 1 ],
                            'combine all transformations' );
};
