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
    var listSceneNode = $( '#test ul.assertions:last' );
    for ( var i in run.asserts ) {
        var assertion = run.asserts[ i ];
        var assertionSceneNode = listNode.append( '<li></li>' );
        if ( assertion.result ) {
            assertionSceneNode.append( '<div style="padding: 5px;">SUCCESS: ' + assertion.description + '</div>' );
        }
        else {
            assertionSceneNode.append( '<div style="padding: 5px;">FAIL: ' + assertion.description + '</div>' );
            for ( var j in assertion.data ) {
                assertionSceneNode.append( '<div style="overflow: hidden; width: 600px;">' + j + ' : ' + assertion.data[ j ] + '</div>' );
            }
        }
    }
    if ( run.exception ) {
        var li = listSceneNode.append( '<li><li>' );
        li.append( '<div style="padding: 5px;">EXCEPTION: ' + run.exception + '<br />(see console for complete log)</div></div>' );
        console.log( run.exception.stack ); // this provides a better view (links to the files, etc)
    }
    $( '#test' ).append( '</ul></li>' );
};
