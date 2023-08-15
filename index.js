const { join, relative, extname } = require('path');
const { existsSync } = require('fs');
const gulp = require('gulp');
const wpage = require('wpage');
const apps = require('./apps').getApps();
const argv = require('./register/argv');
const Log = require('./register/log');

/**
 * 创建文件监听
 */
function buildWatcher(modelsMap) {
    const compile = path => {
        let filePath = relative('./src', path).replace(/\\/g, '/');

        // 查询是否在页面中
        const reg = /^app\/([a-zA-Z_-]+)\/([a-zA-Z_-]+(\/[a-zA-Z_-]+)*)\//;

        const fileMatch = filePath.match(reg);

        let page = undefined;
        let app = undefined;
        let mode = undefined;

        if (!fileMatch) {
            return;
        }

        Log.print('文件编译中');
        
        app = fileMatch[1];
        mode = modelsMap[app];
        
        if (!(mode.config.ignore && mode.config.ignore.pages.includes(fileMatch[2]))) {
            page = fileMatch[2];
        }

        // 相关文件转录
        const aliasType = Object.assign({
            'scss': 'css'
        }, mode.config.fileType);

        // 查询需刷新文件类型
        let type = extname(filePath).slice(1);

        if (Object.prototype.hasOwnProperty.call(aliasType, type)) {
            type = aliasType[type];
        }
        
        mode.tasks[type] 
            && mode.tasks[type](page)
                .then((stream => {
                    stream.on('finish', () => {
                        Log.print('编译完成');
                    });
                }))
                .catch(e => Log.error('watcherCompileError:', e.message));
    }

    const debounce = function (func, wait, immediate) {
        let timer;

        return function () {
            let context = this;
            let args = arguments;

            clearTimeout(timer);
            
            if (immediate) {
                var callNow = !timer;
                timer = setTimeout(() => {
                    timer = null;
                }, wait)
                if (callNow) func.apply(context, args)
            } else {
                timer = setTimeout(() => {
                    func.apply(context, args)
                }, wait);
            }
        }
    }

    const watcher = gulp.watch([
        './src/**/*.*'
    ]);

    let compileDebounce = debounce(compile, 300, false);

    watcher.on('change', compileDebounce);
    watcher.on('add', compileDebounce);
    watcher.on('uinlink', compileDebounce);
}

const customTaskNames = [];

/**
 * 注册执行完成自定义事件（与文件流无关）
 */
exports.registerTask = function (name, task) {
    customTaskNames.push(name);

    gulp.task(name, function (done) {
        if (!task) {
            done();
        }

        return task && task(done);
    });
}

exports.start = function (port = 8080) {
    // 整体打包用任务名称
    // 固定打包名称为   [应用名]:build
    const bins = [];

    const modelsMap = {};

    // 仅允许的app
    app = argv.app || undefined;

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
            const model = require(gulpfilePath);
            modelsMap[name] = model;
            bins.push(model.transTask());
        }
    }

    // 注册整体打包任务
    gulp.task('build', gulp.series(gulp.parallel(...bins), ...customTaskNames));

    const task = {
        watcher() {
            buildWatcher(modelsMap);
            wpage.start(port);
        }
    };

    gulp.task('serve', done => {
        task.watcher();
        done();
    });

    return task;
}
