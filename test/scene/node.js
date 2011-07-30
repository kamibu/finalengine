testcase = new Testcase();

// simple checks on getters
// (assume setters are correct)

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
    this.assertEquals( n1.parent, null, 'child parent null after removing from father' );

    root.removeChild( n2 );
    this.assertEquals( root.children.length, 0, 'children length after all children removed' );
};

testcase.getAbsolutePosition = function() {
    var node = new Node();
    this.assertArrayEquals( node.getAbsolutePosition(), [ 0, 0, 0 ], 'getAbsolutePosition on new node' );

    node.setAbsolutePosition( [ 10, 0, 5 ] ); 
    node.assertArrayEquals( node.getAbsolutePosition(), [ 10, 0, 5 ], 'getAbsolutePosition after setAbsolutePosition' );

    node.setAbsolutePosition( [ 0, 0, 0 ] );
    var m = new Vector3();
    node.getAbsolutePosition( m );
    node.assertArrayEquals( m, [ 0, 0, 0 ], 'getAbsoltePosition after setting back to origin' );
};

testcase.getAbsoluteOrientation = function() {
};

testcase.getAbsoluteScale = function() {
};

// now check for the changes of setters on getMatrix
// (assume getMatrix is correct)

testcase.setAbsolutePosition = function() {
};

testcase.setAbsoluteOrientation = function() {
};

testcase.setAbsoluteScale = function() {
};

testcase.getAbsoluteMatrix = function() {
};
