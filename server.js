'use strict';

const express = require( 'express' );
const app = express();
const path = require( 'path' );
const logger = require( './utls/logger.js' );
const morgan = require( 'morgan' );
const cluster = require( 'cluster' );
const listenPort = process.env.WATCHER_PORT || 3000;

if ( cluster.isMaster ) {

    // Count the machine's CPUs
    var cpuCount = require( 'os' ).cpus().length;
    logger.info( 'cpu count:', cpuCount );

    // Start the s3 folder watcher
    require( './bin/start_watcher.js' );

    // Create a worker for each CPU
    for ( var i = 0; i < cpuCount; i += 1 ) {
        cluster.fork();
    }

} else {

    // Setup static folder for frontend assets
    app.use( express.static( path.join( __dirname, 'public' ) ) );
    app.listen( listenPort, 'localhost' );

    // Add api endpoints
    require( './api/main.js' )( app );
    app.use( morgan( 'combined', {
        'stream': logger.stream
    }) );
    logger.info( `Application running at port ${listenPort}` );

}
