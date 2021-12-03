const WebsiteCurrent = cache.get('website_current', CONST.SESSION_STORAGE) || {};
let user = {};
try {
    user = JSON.parse(sessionStorage.getItem('thisOrguser')) || {};
} catch (e) {}

const config = {
    /* 基本信息 */
    // 默认头像
    DEFAULT_AVATAR: '/shijiwxy/weixin/images/defaultHead.jpg',
    // 请求域名
    API_HOST      : '<!-- @echo ORIGIN_URL -->' || window.BaseWTDomain || window.domain || '',
    // 请求路径
    API_PATH      : '',

    /* 用户信息 */
    USER: {
        // token
        TOKEN     : sessionStorage.getItem('token'),
        // udid
        UDID      : sessionStorage.getItem('udid'),
        // user_id
        USER_ID   : sessionStorage.getItem('user_id'),
        // tech_id
        TEACHER_ID: sessionStorage.getItem('tech_id'),
        // org_id
        ORG_ID    : sessionStorage.getItem('org_id') || user.org_id,
        // rilds
        RILDS     : (sessionStorage.getItem('rlids') || '').split(',').filter(rild => rild !== ''),
        // 终端version
        VERSION   : '0',
        // identity
        IDENTITY  : sessionStorage.getItem('identity') || user.identity
    },

    APP: {
        ID  : 'M',
        TYPE: {
            STUDENT: '4',
            ESCROW : '5',
            TEACHER: '6'
        }
    },

    ERROR_IMAGE: '/accesscontrol/static/assets/images/not-found-image.png',

    /* 站点信息 */
    SITE: {
        ID  : WebsiteCurrent.siteId,
        NAME: WebsiteCurrent.siteName,
        KEY : WebsiteCurrent.siteKey,
        HOST: WebsiteCurrent.siteAddress
    }
};

// // 系统管理员
// config.USER.IS_SYSTEM_ADMIN = config.USER.IDENTITY == 99;
// // 管理员 （系统管理员、管理员、校长/分校长、考勤管理员）
// config.USER.IS_ADMIN = config.USER.IS_SYSTEM_ADMIN || config.USER.RILDS.includes('1') || config.USER.RILDS.includes('2') || config.USER.RILDS.includes('10') || config.USER.RILDS.includes('19');
// // 小权限1：年级组长
// config.USER.IS_GRADEGB = config.USER.RILDS.includes('5');
// // 小权限2：班主任
// config.USER.IS_CLASSGB = config.USER.RILDS.includes('4');

// 系统管理员
config.USER.IS_SYSTEM_ADMIN = config.USER.IDENTITY == 99;
// 管理员
config.USER.IS_ADMIN = config.USER.RILDS.indexOf('1') != -1 || config.USER.RILDS.indexOf('41') != -1;

// 版本信息
Object.defineProperties(config, {
    DEBUG: {
        value   : true,
        writable: false
    },
    VERSION: {
        value   : '2.1.0',
        writable: false
    }
});
