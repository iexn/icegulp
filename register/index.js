const Model = require('./model');

exports.getApp = function (appName) {
    return new Model(appName);
}