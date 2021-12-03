const util = (function() {
    const util = {};
    const toString = Object.prototype.toString;
    const slice = Array.prototype.slice;

    /**
     * 获取当前设备类型
     */
    util.device = function() {
        var userAgentInfo = navigator.userAgent;
        var Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
            }
        }

        // 如果未找到以上标识，视为pc端
        if (flag) {
            return 'pc';
        }

        // 安卓
        if (userAgentInfo.indexOf('Android') > -1 || userAgentInfo.indexOf('Linux') > -1) {
            return 'android';
        }

        // iOS
        if (userAgentInfo.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
            return 'ios';
        }

        return 'unknown';
    };

    util.isWechatDevice = function() {
        var ua = window.navigator.userAgent.toLowerCase();
        return !!(ua.match(/MicroMessenger/i) == 'micromessenger');
    };

    /**
     * 下载文件
     * url：下载文件的远程地址
     */
    util.download = function(url, name = '') {
        if (window.document) {
            const a = document.createElement('a');
            a.href = url;

            // 支持download时使用download，不支持时使用a标签跳转
            if ('download' in a) {
                a.setAttribute('download', name);
            } else {
                a.setAttribute('target', '_blank');
            }

            a.click();
        } else {
            window.open(url);
        }
    };

    /**
     * 判断传入的变量是否是一个dom对象
     */
    util.isDom = function(dom) {
        return (typeof HTMLElement === 'object')
            ? (dom instanceof HTMLElement)
            : (dom && typeof dom === 'object' && dom.nodeType === 1 && typeof dom.nodeName === 'string');
    };

    /**
     * 判断数据的具体类型
     */
    util.type = function(mixin) {
        if (mixin == null) {
            return mixin + '';
        }

        const class2type = {
            '[object Boolean]' : 'boolean',
            '[object Number]'  : 'number',
            '[object String]'  : 'string',
            '[object Function]': 'function',
            '[object Array]'   : 'array',
            '[object Date]'    : 'date',
            '[object RegExp]'  : 'regexp',
            '[object Object]'  : 'object',
            '[object Error]'   : 'error',
            '[object Symbol]'  : 'symbol',
            '[object File]'    : 'file'
        };

        const mixin_type = typeof mixin;

        if (mixin_type === 'undefined') {
            return 'undefined';
        }

        if (mixin_type === 'object' || mixin_type === 'function') {
            const _type = class2type[toString.call(mixin)];
            if (!_type) {
                return util.isDom(mixin) ? 'dom' : 'object';
            } else {
                return _type;
            }
        }

        return mixin_type;
    };

    /**
     * 是否为空值，不包括0
     */
    util.isEmpty = function(mixin) {
        const _type = util.type(mixin);
        if (_type == 'number' && isNaN(mixin)) {
            return true;
        }
        if (['null', 'undefined'].includes(_type)) {
            return true;
        }
        if (_type == 'boolean' && mixin == false) {
            return true;
        }
        if (_type == 'array' && mixin.length == 0) {
            return true;
        }
        if (_type == 'file') {
            return false;
        }
        if (_type == 'object' && Object.keys(mixin).length == 0) {
            return true;
        }
        return mixin === '';
    };

    /**
     * 符合 type() 函数的验证，如果验证不成功适用默认值
     */
    util.defaults = function(mixin, defaults = '', compareFunction = util.isEmpty) {
        return compareFunction(mixin) ? defaults : mixin;
    };

    /**
     * 获取get参数
     */
    util.getQuery = function(search = location.search) {
        const query = {};
        if (search.indexOf('?') != -1) {
            search = search.split('?')[1];
        }

        search.split('&').map(item => {
            const srt = item.split('=');
            if (srt[0] != '') {
                query[srt[0]] = srt[1];
            }
        });
        return query;
    };

    /**
     * 将query转为hash字符串
     */
    util.query2Hash = function(query) {
        const query_trim = [];

        for (const i in query) {
            query_trim.push(i + '=' + query[i]);
        }

        return query_trim.join('&');
    };

    /**
     * 数字前补0变为字符串数字
     */
    util.fullZeroNumber = function(number, size = 2) {
        let __number = number + '';
        if (isNaN(__number)) {
            return number;
        }
        while (__number.length < size) {
            __number = '0' + __number;
        }
        return __number;
    };

    /**
     * 获取设置时间的小时分钟秒
     */
    util.getCalendarDate = function(ND = new Date()) {
        if (ND.hasOwnProperty('__calendarDate__')) {
            return ND;
        }

        if (util.type(ND) == 'string') {
            ND = ND.trim().replace(/-/g, '/');
        }

        if (util.isEmpty(ND)) {
            ND = new Date();
        } else {
            ND = new Date(ND);
        }

        const NW = {
            // 时间对象
            ND       : ND,
            // 年
            year     : ND.getFullYear() + '',
            // 月
            month    : util.fullZeroNumber(ND.getMonth() + 1),
            // 日
            day      : util.fullZeroNumber(ND.getDate()),
            // 小时
            hour     : util.fullZeroNumber(ND.getHours()),
            // 分钟
            minute   : util.fullZeroNumber(ND.getMinutes()),
            // 秒
            second   : util.fullZeroNumber(ND.getSeconds()),
            // 周
            week     : ND.getDay() == 0 ? '7' : ND.getDay() + '',
            // 当前时间毫秒时间戳
            timestamp: ND.getTime() + ''
        };

        Object.defineProperty(NW, '__calendarDate__', {
            enumerable: false,
            value     : ND,
            writable  : false
        });

        NW.secondTimestamp = NW.timestamp.slice(0, -3);

        // 格式化显示
        NW.format = function(format = 'Y-m-d') {
            const formatExec = /[YmdHis]/g;
            const formatMap = {
                'Y': NW.year,
                'm': NW.month,
                'd': NW.day,
                'H': NW.hour,
                'i': NW.minute,
                's': NW.second,
                'w': NW.week
            };
            let p = null;
            let text = format;
            while (p = formatExec.exec(format)) {
                text = text.replace(p[0], formatMap[p[0]]);
            }
            return text;
        };

        function overall(ND) {
            if (ND.getTime() == NW.timestamp) {
                return NW;
            }
            return util.getCalendarDate(ND);
        }

        // 依据当天的统计信息
        NW.overall = {};
        const overallMap = {
            day         : [NW.year, +NW.month - 1, NW.day],
            firstOfYear : [NW.year, 0, 1],
            endOfYear   : [+NW.year + 1, 0, 0],
            firstOfMonth: [NW.year, +NW.month - 1, 1],
            endOfMonth  : [NW.year, NW.month, 0]
        };

        for (const name in overallMap) {
            NW.overall[name] = function() {
                return overall(new Date(...overallMap[name]));
            };
        }

        // 计算范围距离
        NW.step = {
            day: function() {
                return (Math.floor(NW.step.secondOfYear / 86400) + 1) + '';
            },
            week: function() {
                return (Math.floor((NW.step.day() - NW.week) / 7) + 1) + '';
            },
            secondOfYear: function() {
                return (NW.overall.day().secondTimestamp - NW.overall.firstOfYear().secondTimestamp) + '';
            }
        };

        return NW;
    };

    /**
     * 类数组转为真正数组
     */
    util.like2Array = function(likeArray) {
        return slice.call(likeArray);
    };

    /**
     * 获取文件的md5值
     */
    util.getFileMd5 = function(file, callback) {
        // 声明必要的变量
        const fileReader = new FileReader();
        // 文件分割方法（注意兼容性）
        const blobSlice = File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice;

        // 文件每块分割2M，计算分割详情
        const chunkSize = 2097152;
        const chunks = Math.ceil(file.size / chunkSize);
        let currentChunk = 0;

        // 创建md5对象（基于SparkMD5）
        const spark = new SparkMD5();
        const filename = file.name;

        // 每块文件读取完毕之后的处理
        fileReader.onload = function(e) {
            // console.log("读取文件", currentChunk + 1, "/", chunks);
            // 每块交由sparkMD5进行计算
            spark.appendBinary(e.target.result);
            currentChunk++;

            // 如果文件处理完成计算MD5，如果还有分片继续处理
            if (currentChunk < chunks) {
                loadNext();
            } else {
                // 前台显示Hash
                callback && callback({
                    name: filename,
                    size: file.size + '',
                    KB  : (file.size / 1024).toFixed(2),
                    MB  : (file.size / 1024 / 1024).toFixed(2),
                    GB  : (file.size / 1024 / 1024 / 1024).toFixed(2),
                    md5 : spark.end()
                });
            }
        };

        // 处理单片文件的上传
        function loadNext() {
            var start = currentChunk * chunkSize;
            var end = start + chunkSize >= file.size ? file.size : start + chunkSize;

            fileReader.readAsBinaryString(blobSlice.call(file, start, end));
        }

        loadNext();
    };

    /**
     * arraybuffer内容转为字符串
     */
    util.buffer2String = function(buffer) {
        const encodedString = String.fromCodePoint.apply(null, new Uint8Array(buffer));
        // 没有这一步中文会乱码
        const decodedString = decodeURIComponent(escape(encodedString));
        return decodedString;
    };

    /**
     * base64转blob
     */
    util.base642Blob = function(base64Data) {
        var byteString;
        if (base64Data.split(',')[0].indexOf('base64') >= 0) { byteString = atob(base64Data.split(',')[1]); } else { byteString = unescape(base64Data.split(',')[1]); }
        var mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ia], {
            type: mimeString
        });
    };

    /**
     * blob转file
     */
    util.blob2File = function(blob, name, options = {}) {
        // blob.lastModifiedDate = new Date();
        // blob.name = name;
        // return blob;
        options = Object.assign({
            type: 'image/jpg'
        }, options);
        return new File([blob], name, options);
    };

    /**
     * 创建一个类数组结构，并且返回可塑造方法
     */
    util.likeArray = function() {
        const struct = {
            length: 0
        };

        return {
            /**
             * 追加类数组内容。可以追加一个非类数组的key存入，只不过最后将不能生成为真正的数组
             */
            add(value, key = struct.length) {
                if (key == 'length') {
                    console.log('Error:util', 'util.likeArray.add 不支持追加 "length"字段');
                    return key;
                }
                struct[key] = value;
                struct.length += 1;
                return key;
            },
            remove(key) {
                if (util.isEmpty(key) || key == 'length' || !struct.hasOwnProperty(key)) {
                    return false;
                }
                delete struct[key];
                struct.length -= 1;
                return true;
            },
            /**
             * 是类数组就返回数组，不是类数组返回对象（没有length属性）
             */
            get() {
                if (Object.keys(slice.call(struct)).length == struct.length) {
                    return slice.call(struct);
                } else {
                    const res = Object.assign({}, struct);
                    delete res.length;
                    return res;
                }
            },
            __name__: 'likeArray'
        };
    };

    /**
     * 获取某元素以浏览器左上角为原点的坐标
     */
    util.offset = function(dom) {
        let top = dom.offsetTop;
        let left = dom.offsetLeft;
        const width = dom.offsetWidth;
        const height = dom.offsetHeight;

        while (dom = dom.offsetParent) {
            top += dom.offsetTop;
            left += dom.offsetLeft;
        }
        return {
            top   : top,
            left  : left,
            width : width,
            height: height
        };
    };

    /**
     * textarea不回弹
     */
    util.iosTextBlurScroll = function(input) {
        if (!input) {
            return false;
        }
        var trueHeight = document.body.scrollHeight;
        // 解决ios唤起键盘后留白
        var backPageSize = function() {
            setTimeout(() => {
                window.scroll(0, trueHeight - 10);
                window.innerHeight = window.outerHeight = trueHeight;
            }, 200);
        };

        input.onblur = backPageSize; // onblur是核心方法
    };

    /**
     * 获取 xx:xx 转为当天秒数
     */
    util.getHoursSecond = function(hoursFormat) {
        if (!/^\d\d\:\d\d(\:\d\d)?$/.test(hoursFormat)) {
            return false;
        }
        var mm = hoursFormat.split(':');
        return mm[0] * 3600 + mm[1] * 60;
    };

    /**
     * 依赖jQuery
     * 通过jQuery的serializeArray方法获取form表单中的所有字段值
     * 如果包含数组类内容，暂只支持一维数组
     *
     * @param form 页面form的dom，或者form的jquery-dom
     */
    util.getFields = function(form, filter = val => true) {
        const fields = {};
        $(form).serializeArray().map(d => {
            const value = d.value.trim();

            if (/[\[\]\.]/.test(d.name)) {
                const reg = /^([^.\[\]]+)+(\[(.*?)\]|\.)*?$/g;
                let exec = null;
                while (exec = reg.exec(d.name)) {
                    if (!fields.hasOwnProperty(exec[1])) {
                        fields[exec[1]] = util.likeArray();
                    }
                    if (util.isEmpty(exec[3])) {
                        if (filter(value, exec[1])) {
                            fields[exec[1]].add(value);
                        }
                    } else {
                        if (filter(value, exec[1])) {
                            fields[exec[1]].add(value, exec[3]);
                        }
                    }
                }
            } else {
                if (filter(value, d.key)) {
                    fields[d.name] = value;
                }
            }
        });

        // 将类数组转为数组
        for (var i in fields) {
            if (fields[i].__name__ == 'likeArray') {
                fields[i] = fields[i].get();
            }
        }

        return fields;
    };

    /**
     * 修改Object.assign，不向前追加前者没有的属性
     */
    util.objectInset = function(target = {}, source = {}) {
        for (const i in target) {
            if (source.hasOwnProperty(i)) {
                target[i] = source[i];
            }
        }

        return target;
    };

    /**
     * 正则匹配
     */
    util.is = function(pattern, value = '', options = {}) {
        if (util.type(pattern) == 'regexp') {
            return pattern.test(value);
        }

        const rules = function(pattern, value) {
            switch (pattern) {
                case 'empty':
                    pattern = '^$';
                    break;
                case 'url':
                    pattern = `^(((http|https)):\\/\\/)[\\w-]+(\\.[\\w-]+)+([\\w.,@?^=%&:\\/~+#-]*[\\w@?^=%&\\/~+#-])?$`;
                    break;
                case 'urlsimple':
                    pattern = `^(((http|https)):\\/\\/)?[\\w-]+(\\.[\\w-]+)+([\\w.,@?^=%&:\\/~+#-]*[\\w@?^=%&\\/~+#-])?$`;
                    break;
                case 'host':
                    pattern = `^[\\w-]+(\\.[\\w-]+)+$`;
                    break;
                case 'nosymbol':
                    pattern = `^[^\\<\\>\\{\\}]*$`;
                    break;
                default:
                    throw 'util.is 使用了不支持的验证规则';
            }

            pattern = new RegExp(pattern);

            return pattern.test(value);
        };

        if (pattern.indexOf('|') != -1) {
            const pattern_ors = pattern.split('|');
            let or_valid = false;

            for (let i = 0; i < pattern_ors.length; i++) {
                const pattern_or = pattern_ors[i];

                if (pattern_or.indexOf('&') != -1) {
                    const pattern_ands = pattern_or.split('&');
                    let and_valid = true;

                    for (let j = 0; j < pattern_ands.length; j++) {
                        const pattern_and = pattern_ands[j];
                        if (!rules(pattern_and, value)) {
                            and_valid = false;
                        }
                    }

                    if (and_valid) {
                        or_valid = true;
                    }
                } else {
                    if (rules(pattern_or, value)) {
                        or_valid = true;
                    }
                }
            }

            return or_valid;
        } else {
            return rules(pattern, value);
        }
    };

    util.jsonparse = function(data, defaults = {}, key = false) {
        let parse;
        try {
            parse = JSON.parse(data);
        } catch (error) {
            parse = defaults;
        }

        if (key !== false) {
            return util.defaults(parse[key], '');
        }

        return parse;
    };

    const astralRange = /\ud83c[\udffb-\udfff](?=\ud83c[\udffb-\udfff])|(?:[^\ud800-\udfff][\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]?|[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?)*/g;
    class EmojiCharString {
        constructor(string) {
            if (typeof string !== 'string') {
                throw new Error('Input must be a string');
            }
            this._string = string;
            this._match = string.match(astralRange) || [];
        }
        get length() {
            return this._match.length;
        }

        toString() {
            return this._string;
        }

        /**
         * Reverse the string in place
         * @return {[String]} [The reversed string]
         */
        reverse() {
            return this._match.reverse().join('');
        }

        /**
         * The substring() method returns a subset of a string between begin index and end index
         * @param  {Number} begin [begin index]
         * @param  {Number} end   [end index]
         * @return {[String]}     [A new string containing the extracted section of the given string.]
         */
        substring(begin = 0, end) {
            const strLen = this.length;
            let indexStart = (parseInt(begin, 10) || 0) < 0 ? 0 : (parseInt(begin, 10) || 0);
            let indexEnd;
            if (typeof end === 'undefined') {
                indexEnd = strLen;
            } else {
                indexEnd = (parseInt(end, 10) || 0) < 0 ? 0 : (parseInt(end, 10) || 0);
            }

            if (indexStart > strLen) { indexStart = strLen; }
            if (indexEnd > strLen) { indexEnd = strLen; }

            if (indexStart > indexEnd) {
                [indexStart, indexEnd] = [indexEnd, indexStart];
            }
            return this._match.slice(indexStart, indexEnd).join('');
        }

        /**
         * The substr() method return the characters in a string beginning at the specified location through the specified number of characters.
         * @param  {Number} begin [Location at which to begin extracting characters]
         * @param  {Number} len   [The number of characters to extract]
         * @return {[String]}     [A new string containing the extracted section of the given string]
         */
        substr(begin = 0, len) {
            const strLen = this.length;
            let indexStart = parseInt(begin, 10) || 0;
            let indexEnd;
            if (indexStart >= strLen || len <= 0) {
                return '';
            } else if (indexStart < 0) {
                indexStart = Math.max(0, indexStart + strLen);
            }

            if (typeof len === 'undefined') {
                indexEnd = strLen;
            } else {
                indexEnd = indexStart + (parseInt(len, 10) || 0);
            }

            return this._match.slice(indexStart, indexEnd).join('');
        }
    }

    util.emojiString = function(string) {
        return new EmojiCharString(string);
    };

    /**
     * 字符串生成hash
     * Calculate a 32 bit FNV-1a hash
     * Found here: https://gist.github.com/vaiorabbit/5657561
     * Ref.: http://isthe.com/chongo/tech/comp/fnv/
     *
     * @param {string} str the input value
     * @param {boolean} [asString=false] set to true to return the hash value as
     *     8-digit hex string instead of an integer
     * @param {integer} [seed] optionally pass the hash of the previous chunk
     * @returns {integer | string}
     */
    util.hashFnv32a = function(str, asString, seed) {
        /* jshint bitwise:false */
        var i; var l;
        var hval = (seed === undefined) ? 0x811c9dc5 : seed;

        for (i = 0, l = str.length; i < l; i++) {
            hval ^= str.charCodeAt(i);
            hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
        }
        if (asString) {
            // Convert to 8 digit hex string
            return ('0000000' + (hval >>> 0).toString(16)).substr(-8);
        }
        return hval >>> 0;
    };

    // = block:main

    return util;
}());
