let base = {};
try {
    base = JSON.parse(sessionStorage.getItem('baseUser')) || {};
    base.orguser = base.orguser || { teacher: {}};
} catch (e) {}

const config = (function() {
    function getConfig(base) {
        const _config = {
            /* 基本信息 */
            // 默认头像
            DEFAULT_AVATAR: '/shijiwxy/weixin/images/defaultHead.jpg',
            // 请求域名
            API_HOST      : window.BaseWTDomain || window.domainName || 'https://t.shijiwxy.5tree.cn',
            // 请求路径
            API_PATH      : '',

            /* 用户信息 */
            USER: {
                // token
                TOKEN     : base.token || '',
                // udid
                UDID      : base.udid || '',
                // user_id
                USER_ID   : base.orguser.user_id || '',
                // tech_id
                TEACHER_ID: base.orguser.teacher.tech_id || '',
                // org_id
                ORG_ID    : base.orguser.org_id || '',
                // rilds
                RILDS     : (base.orguser.rlids || '').split(',').filter(rild => rild !== ''),
                // 终端version
                VERSION   : '3',
                // identity
                IDENTITY  : base.orguser.identity || ''
            },

            APP: {
                TYPE: {
                    STUDENT: '4',
                    ESCROW : '5',
                    TEACHER: '6'
                }
            },

            ERROR_IMAGE: '/accesscontrol/static/assets/images/not-found-image.png'
        };

        // 系统管理员
        _config.USER.IS_SYSTEM_ADMIN = _config.USER.IDENTITY == 99;
        // 管理员 （系统管理员、管理员、校长/分校长、考勤管理员）
        _config.USER.IS_ADMIN = _config.USER.IS_SYSTEM_ADMIN || _config.USER.RILDS.includes('1') || _config.USER.RILDS.includes('2') || _config.USER.RILDS.includes('10') || _config.USER.RILDS.includes('19');
        // 小权限1：年级组长
        _config.USER.IS_GRADEGB = _config.USER.RILDS.includes('5');
        // 小权限2：班主任
        _config.USER.IS_CLASSGB = _config.USER.RILDS.includes('4');

        // 版本信息
        Object.defineProperties(_config, {
            DEBUG: {
                value   : true,
                writable: false
            },
            VERSION: {
                value   : '1.4.2',
                writable: false
            }
        });

        return _config;
    }

    const _config = getConfig(base);
    _config.reset = function(base) {
        Object.assign(_config, getConfig(base));
    };

    return _config;
})();

