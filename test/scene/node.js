testcase = new Testcase();

// test that after appendChild and removeChild 
// parent-child relations are correct

testcase.appendChild = function() {
    var root = new Node();

    var n1 = new Node();
    root.appendChild( n1 );

    this.assertEquals( root.children.length, 1, 'children length after appendChild' );
    this.assertEquals( root.children[ 0 ], n1, 'first child after first appendChild' );

    var n2 = new Node();
    root.appendChild( n2 );

    this.assertEquals( root.children.length, 2, 'children length after second appendChild' );
    this.assertEquals( root.children[ 1 ], n2, 'second child after second appendChild' );
};

testcase.removeChild = function() {
    var root = new Node();

    var n1 = new Node();
    root.appendChild( n1 );

    var n2 = new Node();
    root.appendChild( n2 );

    root.removeChild( n1 );
    this.assertEquals( root.children.length, 1, 'children length after removeChild' );
    this.assertEquals( root.children[ 0 ], n2, 'first child after removeChild' );
    this.assertEquals( n1.parent, Node.Origin, 'child parent null after removing from father' );

    root.removeChild( n2 );
    this.assertEquals( root.children.length, 0, 'children length after all children removed' );
};

// test that getters are correct on scenes

testcase.getAbsolutePosition = function() {
    var root = new Node();
    this.assertArrayEquals( root.getAbsolutePosition(), [ 0, 0, 0 ], 'getAbsolutePosition on new node' );

    root.setPosition( [ 10, -2, 3 ] );
    this.assertArrayEquals( root.getAbsolutePosition(), [ 10, -2, 3 ], 'getAbsolutePosition after setPosition' );

    var n1 = new Node();
    root.appendChild( n1 );
    this.assertArrayEquals( n1.getAbsolutePosition(), [ 10, -2, 3 ], 'getAbsolutePosition on child' );

    n1.setPosition( [ -9, 1, -2 ]  );
    this.assertArrayEquals( n1.getAbsolutePosition(), [ 1, -1, 1 ], 'getAbsolutePosition after setPosition on child' );

    var n2 = new Node();
    n2.getAbsolutePosition();  // test invalidation bug
    n1.appendChild( n2 );
    this.assertArrayEquals( n2.getAbsolutePosition(), [ 1, -1, 1 ], 'getAbsolutePosition on child after invalidating with getAbsolutePosition' );

    root.removeChild( n1 );
    this.assertArrayEquals( n1.getAbsolutePosition(), [ -9, 1, -2 ], 'getAbsolutePosition of child after removing grandfather' );
};

testcase.getAbsoluteOrientation = function() {
    var root = new Node();
    this.assertArrayEquals( root.getAbsoluteOrientation(), [ 0, 0, 0, 1 ], 'getAbsoluteOrientation on new node' );

    root.setOrientation( [ 0.5, 0.5, 0.5, 0.5 ] );
    this.assertArrayEquals( root.getAbsoluteOrientation(), [ 0.5, 0.5, 0.5, 0.5 ], 'getAbsoluteOrientation after setOrientation' );

    var n1 = new Node();
    root.appendChild( n1 );
    this.assertArrayEquals( n1.getAbsoluteOrientation(), [ 0.5, 0.5, 0.5, 0.5 ], 'getAbsoluteOrientation on child' );

    n1.setOrientation( [ 0.5, 0.5, 0.5, 0.5 ]  );
    this.assertArrayEquals( n1.getAbsoluteOrientation(), [ 0.5, 0.5, 0.5, -0.5 ], 'getAbsoluteOrientation after setOrientation on child' );

    var n2 = new Node();
    n2.getAbsoluteOrientation();  // test invalidation bug
    n1.appendChild( n2 );
    this.assertArrayEquals( n2.getAbsoluteOrientation(), [ 0.5, 0.5, 0.5, -0.5 ], 'getAbsoluteOrientation on child after invalidating with getAbsoluteOrientation' );

    root.removeChild( n1 );
    this.assertArrayEquals( n1.getAbsoluteOrientation(), [ 0.5, 0.5, 0.5, 0.5 ], 'getAbsoluteOrientation of child after removing grandfather' );
};

testcase.getAbsoluteScale = function() {
    var root = new Node();
    this.assertEquals( root.getAbsoluteScale(), 1, 'getAbsoluteScale on new node' );

    root.setScale( 2 );
    this.assertEquals( root.getAbsoluteScale(), 2, 'getAbsoluteScale after setScale' );

    var n1 = new Node();
    root.appendChild( n1 );
    this.assertEquals( n1.getAbsoluteScale(), 2, 'getAbsoluteScale on child' );

    n1.setScale( 0.1 );
    this.assertEquals( n1.getAbsoluteScale(), 0.2, 'getAbsoluteScale on child after setScale' );
};


// test that setters work on scenes
testcase.setAbsolutePosition = function() {
    var node = new Node();

    node.setAbsolutePosition( [ 10, 0, 5 ] ); 
    this.assertArrayEquals( node.getAbsolutePosition(), [ 10, 0, 5 ], 'basic setAbsolutePosition' );

    node.setAbsolutePosition( [ 0, 0, 0 ] );
    this.assertArrayEquals( node.getAbsolutePosition(), [ 0, 0, 0 ], 'setAbsolutePosition back to origin' );
};

testcase.setAbsoluteOrientation = function() {
    var node = new Node();

    node.setAbsoluteOrientation( [ 0.5, 0.5, 0.5, 0.5 ] );
    this.assertArrayEquals( node.getAbsoluteOrientation(), [ 0.5, 0.5, 0.5, 0.5 ], 'basic setAbsoluteOrientation' );
};

testcase.setAbsoluteScale = function() {
    var node = new Node();

    node.setAbsoluteScale( 2 );
    this.assertEquals( node.getAbsoluteScale(), 2, 'basic setAbsoluteScale' );
};

// finally test getAbsoluteMatrix after various calls

testcase.getAbsoluteMatrix = function() {
};
