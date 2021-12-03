'use strict';

require(['jquery', 'weui', 'common'], function($, weui, common) {
    'use strict';
    console.debug(common);
    const { util, api, cache, const: CONST, component, wx } = common;
    const __query__ = Object.assign(util.getQuery(), util.getQuery(location.hash));
    const ND = util.getCalendarDate();

    // = include @app/config.js

    ;(function(factory) {
        document.body.className = 'on';
        // = include @app/.require/extension.js

        extension(function(_config) {
            Object.assign(config, _config);
            factory();
        });
    })(function() {
        const __body__ = component.create(document.body);

        // 加载模块
        // = block:main
    });
});
