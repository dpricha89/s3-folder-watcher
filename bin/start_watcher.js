const watcher = require('./s3_watcher.js');
const s3_folders = require('../utls/s3_folders.js');
const Pool = require('multiprocessing').Pool;
const logger = require('../utls/logger.js');

module.exports = new function() {
    // get the s3 folders in the s3 bucket location
    return s3_folders.get()
        .then(folders => {
            // get the cpu count of the machine
            const cpuCount = require('os').cpus().length;
            // set the pool size to cpuCount * 2
            const pool = new Pool(cpuCount * 2);
            logger.info(`starting the thread pools`);
            pool.map(folders, __dirname + '/s3_watcher.js');
        })
        .catch(err => {
            logger.err(err);
        });
}
