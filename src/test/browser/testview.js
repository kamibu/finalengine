function TestView( testcase ) {
    $( document.body ).append( '<div id="test"><span onclick="$( \"#test\" ).hide(); style="color: white; text-decoration: underline; font-weight: bold; position: absolute; right: 10%; "></span><ul class="runs"></ul></div>' );
    
    for ( var i in testcase.reports ) {
        var run = testcase.reports[ i ];
        this.printReport( run );
    }
}

TestView.prototype.printReport = function( run ) {
    if ( run.pass ) {
        $( '#test ul.runs' ).append( '<li class="success"><div style="padding: 5px;">' + run.name + ': ' + 'SUCCESS (' + run.asserts.length + ')</div></li>' );
        return;
    }
    $( '#test ul.runs' ).append( '<li class="fail"><div style="padding: 5px;">' + run.name + ': FAIL</div><ul class="assertions">' );
    for ( var i in run.asserts ) {
        var assertion = run.asserts[ i ];
        var listNode = $( '#test ul.assertions:last' );
        listNode.append( '<li></li>' );
        var assertionNode = listNode.find( 'li:last' );
        if ( assertion.result ) {
            assertionNode.append( '<div style="padding: 5px;">SUCCESS: ' + assertion.description + '</div>' );
        }
        else {
            assertionNode.append( '<div style="padding: 5px;">FAIL: ' + assertion.description + '</div>' );
            for ( var j in assertion.data ) {
                assertionNode.append( '<div style="overflow: hidden; width: 600px;">' + j + ' : ' + assertion.data[ j ] + '</div>' );
            }
        }
    }
    $( '#test' ).append( '</ul></li>' );
};
