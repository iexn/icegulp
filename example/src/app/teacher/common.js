// = include @/common/plugins/dropload.js

/**
 * 扩展方法[weui.js]：弹出提示
 */
function weuialert(text, callback = function() {}) {
    weui.alert(text, callback, {
        isAndroid: false
    });
}

/**
 * 扩展方法[weui.js]：确认提示
 */
function weuiconfirm(text, callback = function() {}) {
    weui.confirm(text, callback, {
        isAndroid: false
    });
}

/**
 * 扩展方法[weui.js]：自定义提示
 */
function weuiconfirmoption(text, options = {}) {
    options.isAndroid = false;
    weui.confirm(text, options);
}

component.loading = function(text = '加载中') {
    return weui.loading(text);
};

const __self__ = component.appoint('body');

component.scroll = function(DOM, options = {}) {
    options = Object.assign({
        refer     : options.refer || window,
        onRefresh : function(done) { done(); },
        onContinue: function(done) { done(); }
    }, options);

    const DOMdropload = $(DOM).dropload({
        scrollArea: options.refer,
        loadDownFn: function(me) {
            me.lock('up');
            options.onContinue(function(noData = false) {
                me.unlock();
                me.noData(noData);
                me.resetload();
            });
        },
        loadUpFn: function(me) {
            me.lock('down');
            options.onRefresh(function(noData = false) {
                me.unlock();
                me.noData(noData);
                me.resetload();
            });
        }
    });

    return DOMdropload;
};
