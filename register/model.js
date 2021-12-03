const fs = require('fs');
const { join, extname, resolve, relative, basename } = require('path');
const gulp = require('gulp');
const preprocess = require('gulp-preprocess');
const include = require('gulp-include-extend');
const { load } = require('js-yaml');
const gulpStream = require('gulp-virtual-stream');
const Log = require('./log');

const baseUrl = process.cwd();

function pathResolve(url, ...urls) {
    return resolve(baseUrl, url, ...urls);
}

function assignDeep(target, ...sources) {
    // 1. 参数校验
    if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
    }

    // 2. 如果是基本类型数据转为包装对象
    let result = Object(target);
    
    // 3. 缓存已拷贝过的对象，解决引用关系丢失问题
    if (!result['__hash__']) {
        result['__hash__'] = new WeakMap();
    }
    let hash  = result['__hash__'];

    sources.forEach(v => {
        // 4. 如果是基本类型数据转为对象类型
        let source = Object(v);
        // 5. 遍历原对象属性，基本类型则值拷贝，对象类型则递归遍历
        Reflect.ownKeys(source).forEach(key => {
            // 6. 跳过自有的不可枚举的属性
            if (!Object.getOwnPropertyDescriptor(source, key).enumerable) {
                return;
            }
            if (typeof source[key] === 'object' && source[key] !== null) {
                // 7. 属性的冲突处理和拷贝处理
                let isPropertyDone = false;
                if (!result[key] || !(typeof result[key] === 'object') 
                    || Array.isArray(result[key]) !== Array.isArray(source[key])) {
                    // 当 target 没有该属性，或者属性类型和 source 不一致时，直接整个覆盖
                    if (hash.get(source[key])) {
                        result[key] = hash.get(source[key]);
                        isPropertyDone = true;
                    } else {
                        result[key] = Array.isArray(source[key]) ? [] : {};
                        hash.set(source[key], result[key]);
                    }
                }
                if (!isPropertyDone) {
                    result[key]['__hash__'] = hash;
                    assignDeep(result[key], source[key]);
                }
            } else {
                Object.assign(result, {[key]: source[key]});
            }
        });
    });

    delete result['__hash__'];
    return result;
}

/**
 * 获取环境配置
 */
function envConfig(argv, optionConfig) {
    // 获取项目配置参数
    let config = load(fs.readFileSync(pathResolve('.env.' + argv.env))) || {};

    config = assignDeep(config, optionConfig);
    config.NODE_ENV = argv.env;
    config.argv     = argv;

    const pkg = require(process.cwd() + '/package.json');
    config.version = pkg.version;
    
    return config;
}

class Model {
    constructor(appName, argv, optionConfig) {
        this.name = appName;
        this.tasks = {};
        this.config = envConfig(argv, optionConfig);
    }

    _getAppPath() {
        return join(baseUrl, 'src/app', this.name);
    }
    
    /**
     * 获取所有待处理页面名
     */
    _getPages(name) {
        const appPath = this._getAppPath();
        const dirs = fs.readdirSync(appPath);
        const pages = [];
    
        /** 
         * 获取应用所有页面（以app下文件夹为项目，每个子文件夹为独立的页面；特殊排除common以及. _开头的文件夹）
         */
        dirs.map(dirName => {
            let fileStat = fs.statSync(join(appPath, dirName));
            if (!fileStat.isDirectory()) {
                return;
            }
        
            if (/^(\.|\_)/.test(dirName)) {
                return;
            }
            
            /**
             * 增加环境配置 自定义配置排除文件名
             */
            if (this.config.ignore && this.config.ignore.pages.includes(dirName)) {
                return;
            }
    
            if (name !== undefined && name != dirName) {
                return;
            }
        
            pages.push(dirName);
        });
    
        return Promise.resolve(pages);
    }
    
    /** 
     * 异步获取文件内容并同步返回
     */
    _getFileContent(dir) {
        return new Promise((resolve, reject) => {
            // 读取模板文件
            const fileReadStream = fs.createReadStream(dir);
        
            fileReadStream.on("data", function (dataChunk) {
                resolve(dataChunk.toString());
            });
    
            fileReadStream.on("error", function(e) {
                reject(e);
            });
        });
    }
    
    /**
     * 获取待处理流文件入口
     */
    _getEntryStream(name, page) {
        const ext = extname(name);
        return this._getFileContent(join(process.cwd(), `/src/app/${this.name}/.appconfig/entry/${name}`))
            .then(content => {
                const SC = gulpStream.createStreamsContainer();
        
                return this._getPages(page).then(pages => {
                    pages.map(page => {
                        SC.add(content, `${page}${ext}`);
                    });
    
                    return SC.stream;
                });
            })
            .catch(e => Log.error('entryTemplateContentError: ', e.message));
    }
    
    _installTask(taskType, page) {
        return this._getEntryStream(`index.${taskType}`, page)
            .then(stream => {
                return stream
                    .pipe(preprocess({
                        context: this
                    }))
                    .pipe(include({
                        includePaths: {
                            '@'    : pathResolve('src'),
                            '@app' : pathResolve('src/app/' + this.name),
                            '@page': pathResolve('src/app/' + this.name + '/[page]')
                        },
                        includeTrim(includePath, filePath) {
                            if (/\[page\]/.test(includePath + '')) {
                                const name = basename(filePath);
                                const ext = extname(name);
                                const page = name.slice(0, name.length - ext.length);
                                includePath = join(includePath).replace(/\[page\]/g, page);
                            }
    
                            return includePath;
                        }
                    }))
                    .pipe(preprocess({
                        context: this
                    }));
            })
            .catch(e => Log.error('runCommonTaskError', e.message));
    }
    
    build() {
        Object.values(this.tasks).map(task => task());
    }
    
    register(name, task) {
        this.tasks[name] = page => {
            return this._installTask(name, page)
                .then(stream => task(stream))
                .catch(e => Log.error('runRegisterTaskError', e.message));
        };
    }
    
    transTask(overallName = 'build') {
        const tasks = [];
    
        for (const name in this.tasks) {
            if (Object.prototype.hasOwnProperty.call(this.tasks, name)) {
                const taskName = this.name + ':' + name;
                const task = this.tasks[name];
    
                gulp.task(taskName, done => {
                    task(this.config.argv.page).then(() => done());
                });
    
                tasks.push(taskName);
            }
        }
        
        const taskName = this.name + ':' + overallName;
        
        gulp.task(taskName, gulp.series(gulp.parallel(...tasks)));
    
        return taskName;
    }
    
    /**
     * 输出流到指定位置
     */
    destTask(stream, src = '') {
        if (Array.isArray(this.config.dest)) {
            this.config.dest.map(rootSrc => {
                stream = stream.pipe(gulp.dest(pathResolve(rootSrc, this.config.buildSrc, src)));
            });
        }
    
        return stream;
    }
}

module.exports = Model;
