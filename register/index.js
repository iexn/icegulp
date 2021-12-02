const Model = require('./model');
const argv = require('./argv');

exports.getApp = function (appName) {
    return new Model(appName, argv);
}
