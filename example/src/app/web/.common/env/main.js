'use strict';

(function() {
    // = include @/common/plugins/template-web.js
    // = include @/app/common/common/ext/const.js

    template.defaults.imports.CONST = CONST;

    // = include @/app/common/common/ext/util.js
    // = include @/app/common/common/ext/cache.js
    // = include @app/config.js
    // = include @app/common.js
    // = include @/app/common/common/ext/api.js
    // = include @/app/common/common/ext/component.js

    // 不是管理员不能进入系统
    // if (!config.USER.IS_ADMIN && !config.USER.IS_SYSTEM_ADMIN) {
    //     location.href = "#";
    //     return false;
    // }

    (function(factory) {
        /**
         * 创建包
         */
        const Package = {
        // 依赖 jQuery
            $: jQuery
        };

        layui.use(['layer'], function() {
            if (!cache.get('website', CONST.SESSION_STORAGE)) {
                api.request('/schoolweb/manage/webSite/getSites', {}, {
                    done(result) {
                        const sites = result.data;
                        cache.set('website', sites, CONST.SESSION_STORAGE);
                        if (!cache.get('website_current', CONST.SESSION_STORAGE)) {
                            cache.set('website_current', sites[0] || {}, CONST.SESSION_STORAGE);
                        }
                        factory(Package);
                    },
                    fail(e) {
                        layui.layer.alert(e.message, { icon: 2, closeBtn: 0 });
                    }
                });
            } else {
                factory(Package);
            }

            // factory(Package);
        });
    })(function(Package) {
        const $ = Package.$;
        const __body__ = component.create(document.body);
        const __self__ = component.create(document.getElementById('APP_FRAME'));
        const __query__ = util.getQuery(location.hash);

        // 加载模块
        // = include @app/.common/extend.js
        // = include @app/.common/skeleton.js
        // = block:main
    });
})();
