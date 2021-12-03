const Model = require('./model');
const argv = require('./argv');

exports.getApp = function (appName, optionConfig = {}) {
    return new Model(appName, argv, optionConfig);
}
