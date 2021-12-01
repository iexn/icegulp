const fs = require('fs');
const { join, resolve } = require('path');

/**
 * 获取所有可用项目端
 * 一个文件夹视为一个项目端，不包含以 . 或 _ 开头的文件夹
 */
exports.getApps = function getApps() {
    const appsDir = join(resolve('./'), '/src/app/');
    const appMap = {};
    
    if (fs.existsSync(appsDir)) {
        const dirs = fs.readdirSync(appsDir);
    
        dirs.map(appName => {
            const appPath = join(appsDir, appName);
            const fileStat = fs.statSync(appPath);
    
            // 是文件夹才视为子项目
            if (fileStat.isDirectory()) {
                if (!/^(\.|\_)/.test(appName) && fs.existsSync(join(appPath, '.appconfig'))) {
                    appMap[appName] = appPath;
                }
            }
        });
    }

    return appMap;
}
