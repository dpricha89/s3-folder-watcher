'use strict';

// Local depends
const s3_size = require( '../utls/s3_size.js' );
const db = require( '../utls/db.js' );
const logger = require( '../utls/logger.js' );
const config = require( '../utls/config.js' );

// Vendor
const moment = require( 'moment' );
const _ = require( 'underscore' );

module.exports = function( folder ) {

    function percentCalculation( uploaded, total ) {
        const c = ( parseFloat( uploaded ) / parseFloat( total ) ) * 100;
        return parseFloat( c );
    }

    function runningFolder( folder_obj, uploaded_size ) {

        logger.info( `${folder_obj.path} - running folder` );

        let status = 'running';
        let difference_size = 0;
        let difference_time = 0;
        let message = 'Folder upload is in progress';
        let upload_rate = 'N/A';
        let variable_updates = {};

        if ( folder_obj.last_uploaded_size ) {
            difference_size = folder_obj.uploaded_size - folder_obj.last_uploaded_size;
        }

        if ( folder_obj.last_updated ) {
            difference_time = moment().diff( moment( folder_obj.last_updated ), 'seconds' );
        }

        if ( uploaded_size === folder_obj.last_uploaded_size ) {
            status = 'stopped';
            message = 'Folder upload has stopped';
        }

        if ( ! folder_obj.uploaded_size_array ) {
            folder_obj.uploaded_size_array = [uploaded_size];
            variable_updates.uploaded_size_array = folder_obj.uploaded_size_array;
        } else if ( folder_obj.uploaded_size_array.length > 0 &&
            folder_obj.uploaded_size_array.indexOf( uploaded_size ) < 0 ) {

            // Add new uploaded_size value if it does not already exist in array
            folder_obj.uploaded_size_array.push( uploaded_size );
            variable_updates.uploaded_size_array = folder_obj.uploaded_size_array;
        }

        // Determine rate
        if ( difference_time && difference_size ) {
            upload_rate = difference_size / difference_time;
        }

        return db.update( folder_obj.path, _.extend( variable_updates, {
            status: status,
            last_updated: moment().toISOString(),
            message: message,
            difference: difference_time,
            difference_size: difference_size,
            upload_rate: upload_rate,
            uploaded_size: uploaded_size,
            last_uploaded_size: folder_obj.uploaded_size || 0
        }) );

    }

    function staleFolder( folder ) {
        logger.error( `${folder.path} - check_folder` );
        return db.update( folder.path, {
            status: 'stopped',
            last_updated: moment().toISOString(),
            message: 'Folder upload has stopped'
        });
    }

    function waitingFolder( folder ) {
        logger.warn( `${folder.path} - waiting folder` );
        return db.update( folder.path, {
            status: 'waiting',
            last_updated: moment().toISOString(),
            upload_rate: 'N/A',
            message: 'Folder upload has not started yet'
        });
    }

    function checkFolder( folder_obj, uploaded_size ) {
        if ( ! uploaded_size || uploaded_size < 1 ) {
            return waitingFolder( folder_obj );
        } else if ( uploaded_size > 1 ) {
            return runningFolder( folder_obj, uploaded_size);
        } else {
            return staleFolder(folder_obj);
        }
    }

    // try to add up all the objects in the folder to get the folder size
    function getFolderSize(folder_obj) {
        return s3_size.get(folder_obj.path)
            .then(size => {
                logger.debug(`Size returned for folder: ${folder_obj.path} size: ${size}`);
                return checkFolder(folder_obj, size);
            });
    }

    // try to find the folder in the database
    return db.find(folder)
        .then(folder_obj => {
              // get the size of the directory
              logger.debug(`Getting size for folder ${folder}`);
              folder_obj = folder_obj || {
                  path: folder
              };
              return getFolderSize(folder_obj);
        });
};
