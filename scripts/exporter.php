<?php
    $json = json_decode( $_POST[ 'data' ], true );
    foreach ( $json[ 'library' ] as $name => $object ) {
        $file = array( 'library' => array( $name => $object ), 'object' => $name );
        file_put_contents( $name . '.js', json_encode( $file ) );
    }
?>
