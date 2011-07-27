<?php
    $nodePath = 'node';
    echo exec( "$nodePath build.js" );
    header( 'Content-type: text/javascript' );
    echo file_get_contents( 'GFX.js' );
?>
