const { join } = require('path');
const { existsSync } = require('fs');
const gulp = require('gulp');
const apps = require('./apps').getApps();

exports.start = function (app) {
    // 整体打包用任务名称
    // 固定打包名称为   [应用名]:build
    const bins = [];

    /**
     * 注册已识别的应用任务
     */
    for (const name in apps) {
        if (app && name != app) {
            continue;
        }
        
        const dir = apps[name];
        const configPath = join(dir, '.appconfig');
        const gulpfilePath = join(configPath, 'gulpfile.js');

        if (existsSync(gulpfilePath)) {
            bins.push(require(gulpfilePath));
        }
    }

    // 注册整体打包任务
    gulp.task('build', gulp.series(gulp.parallel(...bins)));
}

exports.app = function () {
    return require('./app');
}