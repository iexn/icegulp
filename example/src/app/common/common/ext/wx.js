const wx = (function() {
    const wx = {};

    wx.open_loading = false;

    wx.loading = function(loading_text) {
        if (!wx.open_loading) {
            return {
                hide(callback) {
                    callback && callback();
                }
            };
        }

        return weui.loading(loading_text || '加载中');
    };

    const loader = function(callback) {
        const loading = wx.loading('加载中');

        require(['wx'], function(wxsdk) {
            loading.hide(function() {
                callback && callback(wxsdk);
            });
        });
    };

    wx.init = function(access, options, callback) {
        options = Object.assign({
            apiList: [
                'checkJsApi',
                'onMenuShareTimeline',
                'onMenuShareAppMessage',
                'onMenuShareQQ',
                'onMenuShareWeibo',
                'onMenuShareQZone',
                'hideMenuItems',
                'showMenuItems',
                'hideAllNonBaseMenuItem',
                'showAllNonBaseMenuItem',
                'translateVoice',
                'startRecord',
                'stopRecord',
                'onVoiceRecordEnd',
                'playVoice',
                'onVoicePlayEnd',
                'pauseVoice',
                'stopVoice',
                'uploadVoice',
                'downloadVoice',
                'chooseImage',
                'previewImage',
                'uploadImage',
                'downloadImage',
                'getLocalImgData',
                'getNetworkType',
                'openLocation',
                'getLocation',
                'hideOptionMenu',
                'showOptionMenu',
                'closeWindow',
                'scanQRCode',
                'chooseWXPay',
                'openProductSpecificView'
            ]
        }, options);

        loader(function(wxsdk) {
            const loading = wx.loading('加载中');

            wxsdk.hideAllNonBaseMenuItem();
            wxsdk.showMenuItems({
                menuList: ['menuItem:copyUrl']
            });
            wxsdk.config({
                beta     : true,
                debug    : false,
                appId    : access.appId,
                timestamp: access.timestamp,
                nonceStr : access.nonceStr,
                signature: access.signature,
                jsApiList: options.apiList
            });

            wxsdk.ready(function() {
                loading.hide(function() {
                    callback && callback(wxsdk);
                });
            });

            wxsdk.error(function(res) {
                loading.hide(function() {
                    console.log('error');
                });
            });
        });
    };

    wx.uploadImage = function(options = {}, callback, listener = {}) {
        options = Object.assign({
            count     : 9,
            sizeType  : ['compressed'], // 可以指定是原图original还是压缩图compressed，默认二者都有
            sourceType: ['album'] // 可以指定来源是相册album还是相机camera，默认二者都有
        }, options);

        const files = [];

        const local2base64 = function(localIds, callback, index = 0) {
            if (localIds[index]) {
                const localId = localIds[index];

                loader(function(wxsdk) {
                    wxsdk.getLocalImgData({
                        localId: localId,
                        success: function(res) {
                            const imagebase64 = res.localData;
                            const imageblob = util.base642Blob(imagebase64);
                            const file = util.blob2File(imageblob, 'wx_' + util.getCalendarDate().timestamp + index + '.' + util.defaults(util.defaults(imageblob.type, '').split('/')[1], 'jpg'), { type: imageblob.type });
                            files.push(file);
                            callback(localIds, callback, index + 1);
                        }
                    });
                });
            } else {
                callback && callback(files);
            }
        };

        const local2Remote = function(localIds, callback, fail, index = 0) {
            if (localIds[index]) {
                const localId = localIds[index];

                loader(function(wxsdk) {
                    wxsdk.uploadImage({
                        localId,
                        // 1.2.1：临时调整微信8.0.7调用bug
                        isShowProgressTips: 1,
                        // isShowProgressTips: 0,
                        success           : res => {
                            const serverId = res.serverId;
                            files.push(serverId);
                            local2Remote(localIds, callback, fail, index + 1);
                        },
                        fail: function(error) {
                            fail(error);
                        }
                    });
                });
            } else {
                callback && callback(files);
            }
        };

        options.success = function(res) {
            listener.beforeUpload && listener.beforeUpload();
            local2Remote(res.localIds, function(files) {
                callback && callback(files);
            });
        };

        loader(function(wxsdk) {
            wxsdk.chooseImage(options);
        });
    };

    /**
     * 打开图片预览
     * @param {array} images 图片预览列表
     * @param {number|string} currentIndex 图片列表中的位置号或图片地址
     */
    wx.imagePreview = function(images = [], currentIndex = 0) {
        let current;
        if (typeof currentIndex == 'string') {
            current = currentIndex;
        } else {
            current = images[currentIndex];
        }

        WeixinJSBridge.invoke('imagePreview', {
            current: current,
            urls   : images
        }, function(res) {
            console.log(res.err_msg);
        });
    };

    return wx;
})();
