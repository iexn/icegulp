// 获取执行参数
const argv = Object.assign({
    env: 'development'
}, require('minimist')(process.argv.slice(2)));

if (argv.env != 'production') {
    argv.env = 'development';
}

argv.debug = argv.env != 'production';

if (!argv.dir) {
    if (argv.env == 'production') {
        argv.dir = 'dist';
    } else {
        argv.dir = 'site';
    }
}

module.exports = argv;