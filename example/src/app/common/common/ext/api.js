const api = (function() {
    const api = {};
    let config = {};

    let _xhrFields = {};
    // 处理请求前xhr，每次请求完毕后还原为 {}
    Object.defineProperty(api, 'xhrFields', {
        enumerable: false,
        get() {
            return _xhrFields;
        },
        set() {
            _xhrFields = {};
            return _xhrFields;
        }
    });

    /**
     * 获取请求参数
     */
    function requestParams(params = {}, method = CONST.AJAX_PARAMS_MATHOD_JSON, takeCommonQuery = true) {
        const query = Object.assign({
            // 新增参数from_src 用于区分 当前运行环境是企业微信还是微校云
            from_src: sessionStorage.isFromQYWX == '1' ? 'qywx' : 'fwh'
        }, params);

        if (takeCommonQuery) {
            Object.assign(query, {
                token  : config.USER.TOKEN,
                udid   : config.USER.UDID,
                user_id: config.USER.USER_ID,
                version: config.USER.VERSION,
                orgId  : config.USER.ORG_ID,
                siteId : config.SITE.ID,
                appKey : config.SITE.KEY
            });
        }

        switch (method) {
            case CONST.AJAX_PARAMS_MATHOD_JSON:
                return query;
            case CONST.AJAX_PARAMS_MATHOD_FORMDATA:
                const fd = new FormData();
                for (const i in query) {
                    fd.append(i, query[i]);
                }
                return fd;
            case CONST.AJAX_PARAMS_MATHOD_STRINGIFY:
                const s = [];
                for (const i in query) {
                    s.push(i + '=' + query[i]);
                }
                return s.join('&');
        }
    }

    function post(url, data, options = {}) {
        return $.ajax({
            url        : url,
            type       : 'POST',
            data       : requestParams(data, CONST.AJAX_PARAMS_MATHOD_FORMDATA, true),
            dataType   : 'json',
            cache      : false,
            processData: false,
            contentType: false,
            crossDomain: true,
            headers    : Object.assign(requestParams(), options.headers),
            xhrFields  : Object.assign(api.xhrFields, options.xhrFields)
        });
    }

    function get(url, data, options = {}) {
        return $.ajax({
            url        : url,
            type       : 'GET',
            data       : requestParams(data, CONST.AJAX_PARAMS_MATHOD_STRINGIFY, true),
            dataType   : 'json',
            cache      : false,
            processData: false,
            contentType: false,
            crossDomain: true,
            headers    : Object.assign(requestParams(), options.headers),
            xhrFields  : Object.assign(api.xhrFields, options.xhrFields)
        });
    }

    function jsonp(url, data, options = {}) {
        return $.ajax({
            url        : url,
            type       : 'JSONP',
            data       : Object.assign(requestParams(data, CONST.AJAX_PARAMS_MATHOD_STRINGIFY), options.headers),
            dataType   : 'json',
            cache      : false,
            processData: false,
            contentType: false,
            crossDomain: true,
            xhrFields  : Object.assign(api.xhrFields, options.xhrFields)
        });
    }

    /**
     * 执行请求
     */
    api.request = function(url, data = {}, options = {}) {
        if (util.isEmpty(url)) {
            throw '未指定请求地址';
        }

        if (url.indexOf('http') !== 0) {
            url = config.API_HOST + '' + url;
        }

        const invalidGroupReg = new RegExp('(?<!\:)\/\/', 'g');

        url = url.replace(invalidGroupReg, '/');

        options = Object.assign({
            method : 'POST',
            loading: true,
            headers: {},
            done   : function() {},
            fail   : function() {}
        }, options);

        setTimeout(() => {
            // 针对系统vconsole页面加载不启动问题
            console.log(options.method + ' ' + url.replace('https://', ''), data);
        }, 200);

        let loading = {
            hide: function(callback) { callback && callback(); }
        };
        if (options.loading) {
            loading = component.loading();
        }

        let request;
        if (options.method == CONST.AJAX_REQUEST_GET) {
            request = get(url, data, options);
        } else if (options.method == CONST.AJAX_REQUEST_JSONP) {
            request = jsonp(url, data, options);
        } else {
            request = post(url, data, options);
        }

        return request
            .done(function(result) {
                loading.hide(() => {
                    // 如果请求成功，但接口返回失败，提示错误
                    if (result.code !== 200) {
                        options.fail && options.fail({
                            code    : result.code,
                            message : result.message,
                            data    : result.data,
                            response: request
                        });
                        return;
                    }
                    options.done && options.done(result, true);
                });
            })
            .fail(function(e) {
                loading.hide(() => {
                    // 如果是手动中断，不弹出提示
                    if (e.statusText == 'abort') {
                        return false;
                    }
                    options.fail && options.fail({
                        code    : -1,
                        message : '服务器繁忙，请重试',
                        data    : {},
                        response: e
                    });
                });
            });
    };

    /**
     * 使用之前挂载config数据
     */
    api.init = function (userConfig) {
        config = Object.assign({}, userConfig);
    }

    // = block:main

    return api;
})();
