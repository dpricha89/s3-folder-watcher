'use strict';

const nconf = require('nconf');
const _ = require('underscore');
const path = require('path');
const SETTINGS_FILE = 'settings.json';


// load the settings file
nconf.file(SETTINGS_FILE);

class Config {

    get(key) {
        const value = nconf.get(key);
        if (_.isUndefined(value)) {
            console.log(`nconf key not found: ${key}. Ensure the key is in your settings.json file.`);
        }
        return value;
    }
}

module.exports = new Config();
