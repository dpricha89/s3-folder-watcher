'use strict';

const Promise = require('bluebird');
const config = require('./config.js');
const AWS = require('aws-sdk');
const _ = require('underscore');
const logger = require('./logger.js');
const s3 = Promise.promisifyAll(new AWS.S3({
    region: config.get('AWS_REGION')
}));
const BUCKET = config.get('AWS_S3_BUCKET');


class S3Size {

    get(prefix, marker) {

        const self = this;

        let params = {
            Bucket: BUCKET,
            Prefix: prefix
        };

        if (marker) {
            params.StartAfter = marker;
        }

        return s3.listObjectsV2Async(params)
            .then(response => {
                //set size
                let size = 0;
                // make sure response has contents keys
                if (response.hasOwnProperty('Contents')) {
                    size = self.calculateObjectsSize(response.Contents, prefix);
                }
                // if data is not truncated then return the size
                if (!response.IsTruncated) {
                    return size;
                }
                marker = response.Contents[response.Contents.length - 1].Key;
                return self.get(prefix, marker)
                    .then(nsize => {
                        return size + nsize;
                    });
            });
    }

    calculateObjectsSize(keys, folder) {
        logger.debug(`Getting objects in s3-size function. Folder: ${folder} Length: ${keys.length}`);
        return _.pluck(keys, 'Size').reduce((a, b) => a + b, 0);
    }

}

module.exports = new S3Size();
