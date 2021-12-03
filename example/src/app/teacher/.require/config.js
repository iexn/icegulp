const originUrl = '<!-- @echo config.originUrl -->' || '/';

const STATIC_PATH = '<!-- @echo config.publicPath -->/';
const LIB_PATH = STATIC_PATH + 'lib/';

require.config({
    urlArgs: 'v=2021120202',
    baseUrl: './',
    paths  : {
        jquery         : LIB_PATH + 'jquery.min',
        weui           : LIB_PATH + 'weui/weui.custom.min',
        mobilebone     : LIB_PATH + 'mobilebone/mobilebone',
        swiper         : LIB_PATH + 'swiper_6.1.2/swiper.min',
        tablet         : LIB_PATH + 'Tablet-1.0.min',
        SparkMD5       : LIB_PATH + 'spark-md5.min',
        migrate        : LIB_PATH + 'jquery-migrate.min',
        template       : LIB_PATH + 'template-web',
        createComponent: originUrl + 'shijiwxy/weixin/common/createComponent/index',
        wx             : originUrl + 'shijiwxy/static/jweixin-1.6.0',
        common         : '../common/common.min',
        list          : './assets/list.min',
    },
    map : { '*': { 'css': '../../static/lib/require/css.min.js' }},
    shim: {
        weui           : { deps: ['css!' + LIB_PATH + '/weui/weui.min'] },
        mobilebone     : { deps: ['css!' + LIB_PATH + '/mobilebone/mobilebone'] },
        swiper         : { deps: ['css!' + LIB_PATH + '/swiper_6.1.2/swiper.min'] },
        common         : { deps: ['css!../common/common.min', 'template'] },
        tablet         : { deps: ['jquery'] },
        migrate        : { deps: ['jquery'] },
        createComponent: { deps: ['jquery', 'css!' + originUrl + 'shijiwxy/weixin/common/createComponent/style'] },
        list          : { deps: ['css!./assets/list.min'] },
    },
    waitSeconds: 0
});
