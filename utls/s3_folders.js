'use strict';

const config = require('./config.js');
const Promise = require('bluebird');
const _ = require('underscore');
const AWS = require('aws-sdk');
const logger = require('./logger');
const s3 = Promise.promisifyAll(new AWS.S3({
    region: config.get('AWS_REGION')
}));



class S3Folders {

    get() {
        const bucket = config.get('AWS_S3_BUCKET');
        const prefix = config.get('AWS_S3_PREFIX');
        logger.debug(`Checking for folders in bucket: ${bucket} with ${prefix}`);
        return s3.listObjectsV2Async({
                Bucket: bucket,
                Prefix: prefix,
                Delimiter: '/'
            })
            .then(results => {
                logger.debug(`Returned ${results.CommonPrefixes.length} folders`);
                return _.pluck(results.CommonPrefixes, 'Prefix');
            });
    }
}

module.exports = new S3Folders();
