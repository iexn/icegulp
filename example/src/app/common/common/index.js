(function Common(root, factory) {
    if (typeof exports === 'object' && typeof module === 'object') { module.exports = factory(); } else if (typeof define === 'function' && define.amd) { define(['template'], factory); } else if (typeof exports === 'object') { exports['common'] = factory(); } else { root['common'] = factory(); }
})(this, function(template) {
    // = include ./ext/polyfill.js
    // = include ./ext/const.js
    // = include ./ext/util.js
    // = include ./ext/cache.js
    // = include ./ext/api.js
    // = include ./ext/component.js
    // = include ./ext/wx.js

    template.defaults.imports.CONST = CONST;

    return {
        util,
        cache,
        api,
        component,
        wx,
        const: CONST
    };
});
