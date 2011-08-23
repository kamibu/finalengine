<?php
    echo "Hello";
    file_put_contents( 'exporter.log', "Parsing JSON\n", FILE_APPEND );
    $json = json_decode( $_POST[ 'data' ], true );
    file_put_contents( 'exporter.log', "Done\n", FILE_APPEND );
    foreach ( $json[ 'library' ] as $name => $object ) {
        $file = array( 'library' => array( $name => $object ), 'object' => $name );
        file_put_contents( 'exporter.log', "Writing file $name\n", FILE_APPEND );
        file_put_contents( $name . '.json', json_encode( $file ) );
        file_put_contents( 'exporter.log', "OK\n", FILE_APPEND );
    }
?>
