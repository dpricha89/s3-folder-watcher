'use strict';

const db = require('../utls/db.js');


module.exports = function (app) {
    app.get('/api/folders', function (req, res) {
        return db.scan()
            .then(results => {
                res.status(200).json(results);
            });
    });
};
