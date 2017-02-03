'use strict';

const config = require('./config.js');
const logger = require('./logger.js');

function db() {
    const dynasty = require('dynasty')({
        accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
        region: config.get('AWS_REGION')
    });

    logger.info('setting up DynamoDB connection');

    //setup table connection
    return dynasty.table(config.get('AWS_DYNAMO_DB_TABLE'));

}

module.exports = new db();
