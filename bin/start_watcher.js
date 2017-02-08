const watcher = require( './s3_watcher.js' );
const s3_folders = require( '../utls/s3_folders.js' );
const Pool = require( 'multiprocessing' ).Pool;
const logger = require( '../utls/logger.js' );
const config = require( '../utls/config.js' );

function analyze_folders() {
    // Get the s3 folders in the s3 bucket location
    return s3_folders.get()
        .then( folders => {

            // Get the cpu count of the machine
            const cpuCount = require( 'os' ).cpus().length;

            // Set the pool size to cpuCount * 2
            const pool = new Pool( cpuCount * 2 );
            logger.info( `starting the thread pools` );

            return pool.map( folders, __dirname + '/s3_watcher.js' );
        })
        .catch( err => {
            logger.err( err );
        });
}

module.exports = new function() {

    // Analyze the folder size once
    analyze_folders();

    // Check the folders on schedule
    setInterval(function() {
          analyze_folders();
      }, config.get( 'CHECK_INTERVAL' ) * 1000 );
};
