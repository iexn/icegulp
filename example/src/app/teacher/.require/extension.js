function extension(callback) {
    if (util.isEmpty(config.USER.TOKEN)) {
        const loading = weui.loading('加载中');
        getUserLoginBaseInfoOfOpenid(__query__.openid, __query__.org_id, __query__.identity, function(data) {
            cache.set('baseUser', data, CONST.SESSION_STORAGE);
            config.reset(data);

            // 初始化执行
            // api.jssdkRegister({}, function() {
            loading.hide(function() {
                callback({});
            });
            // });
        }, true);
    } else {
        // 初始化执行
        // api.jssdkRegister({}, function() {
        // loading.hide(function() {
        callback({});
        // });
        // });
    }
}
