const cache = (function () {
    const cache = {};
    const appStorage = {};

    let timeKeySuffix = "~overdueTime";
    

    cache.get = function (key, type = CONST.APP_STORAGE) {
        let time = util.getCalendarDate(new Date);
        let timeKey = key + timeKeySuffix;

        // 过期时间
        let storageTime;
        // 数据
        let storageValue;

        // 获取数据及过期时间
        switch (type) {
            case CONST.APP_STORAGE:
                let ase = appStorage[key];
                if (util.isEmpty(ase)) {
                    ase = {
                        storageTime: null,
                        storageValue: null
                    };
                }
                storageTime  = ase.storageTime;
                storageValue = ase.storageValue;
                break;
            case CONST.SESSION_STORAGE:
                storageTime  = sessionStorage.getItem(timeKey);
                storageValue = sessionStorage.getItem(key);

                break;
            case CONST.LOCAL_STORAGE:
                storageTime  = localStorage.getItem(timeKey);
                storageValue = localStorage.getItem(key);
        }

        // 未获取到时
        if (storageValue === null || storageTime === null) {
            return null;
        }

        // json字符串转为object
        try {
            storageValue = JSON.parse(storageValue);
        } catch(e) {}

        // 如果有过期时间，检测是否已过期
        if (~~storageTime > 0) {
            if (storageTime < time.timestamp) {
                sessionStorage.removeItem(timeKey);
                sessionStorage.removeItem(key);
                storageValue = null;
            }
        }

        return storageValue;
    };

    /** 
     * 缓存数据
     */
    cache.set = function (key, value, type = CONST.APP_STORAGE, overdueSecond = null) {
        let time = util.getCalendarDate(new Date);
        let timeKey = key + timeKeySuffix;

        // 过期时间，0表示不设置过期
        let overdueTime = 0;

        if (overdueSecond !== null) {
            overdueTime = time.timestamp + ~~overdueSecond * 1000;
        }

        // 获取数据及过期时间
        switch (type) {
            case CONST.APP_STORAGE:
                if (value === null) {
                    delete appStorage[key];
                    return;
                }
                
                appStorage[key] = {
                    storageTime: overdueTime,
                    storageValue: value
                };

                break;
            case CONST.SESSION_STORAGE:
                if (value === null) {
                    sessionStorage.removeItem(timeKey);
                    sessionStorage.removeItem(key);
                    return;
                }
                sessionStorage.setItem(timeKey, overdueTime);
                try {
                    sessionStorage.setItem(key, JSON.stringify(value));
                } catch (e) {
                    sessionStorage.setItem(key, value);
                }

                break;
            case CONST.LOCAL_STORAGE:
                if (value === null) {
                    localStorage.removeItem(timeKey);
                    localStorage.removeItem(key);
                    return;
                }
                localStorage.setItem(timeKey, overdueTime);
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                } catch (e) {
                    localStorage.setItem(key, value);
                }
        }
    };

    return cache;
})();