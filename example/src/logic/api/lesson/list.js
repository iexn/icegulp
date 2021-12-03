(function(factory) {
    const urls = {
        list: '/schoolweb/manage/webLog/getLogs'
    };

    // = include ./common/tablelist.sk.js

    const __api__ = {};

    __api__.list = api.tablelist(urls.list, function({ page = 1, size = 10, title = '', start_time = '', end_time = '' }) {
        return {
            startDate  : start_time,
            endDate    : end_time,
            search     : title,
            currentPage: page,
            pageSize   : size
        };
    }, function(item) {
        return {
            id         : item.logId,
            date       : item.inserttime,
            author     : item.userName,
            desc       : item.description,
            result     : !!item.success,
            result_text: item.success ? '成功' : '失败',
            ip         : item.requestIp,
            detail     : util.isEmpty(item.detail) ? [] : JSON.parse(item.detail)
        };
    });

    factory(__api__);
})(function(__api__) {
    /**
     * 系统日志
     */
    api.list = __api__.list.bind(api);
});
