// 注册今天时间
var ND = util.getCalendarDate(new Date());
var baseUser = JSON.parse(sessionStorage.getItem('baseUser'));
var org_id = sessionStorage.getItem('org_id');

/**
 * 请求封装
 */
function request(name, params, callback, method) {
    params = params || {};
    params.token = baseUser.token;
    params.udid = baseUser.udid;
    // params.userId = user_id,
    params.orgId = org_id;
    params.version = 0;
    method = method || 'POST';

    getData(
        domain + name,
        params,
        function(result) {
            if (result.code == 200 && result.success == true) {
                callback.done && callback.done(result);
            } else {
                callback.fail && callback.fail({
                    code   : result.code,
                    message: result.message,
                    data   : result.data || {}
                });
            }
        },
        method
    );
}

function initPage(res) {
    Data.search.initPage = true;

    $('#allPage').html(res.pages);
    $('#allTotal').html(res.total);

    Data.search.size = res.size;

    $('#creatPage').createPage({
        pageCount: res.pages,
        current  : res.page,
        url      : '',
        backFn   : function(page) {
            Data.search.page = page;
            self.find('.page-local').val(Data.search.page);
            loadTeacherDetails();
        }
    });
}

function successAlert(message, callback) {
    layui.layer.alert(message, { icon: 1, closeBtn: 0, zIndex: Math.max(~~layui.layer.zIndex + 1, 10000000) }, function(index) {
        callback && callback();
        layer.close(index);
    });
}

function errorAlert(message, callback) {
    layui.layer.alert(message, { icon: 2, closeBtn: 0, zIndex: Math.max(~~layui.layer.zIndex + 1, 10000000) }, function(index) {
        callback && callback();
        layer.close(index);
    });
}

function toastSuccessAlert(message) {
    layui.layer.msg(message, { icon: 1, closeBtn: 0, zIndex: Math.max(~~layui.layer.zIndex + 1, 10000000) });
}

function toastErrorAlert(message) {
    layui.layer.msg(message, { icon: 2, closeBtn: 0, zIndex: Math.max(~~layui.layer.zIndex + 1, 10000000) });
}

function layerconfirm(message, callback, cancel) {
    layui.layer.confirm(message, { closeBtn: 0, zIndex: Math.max(~~layui.layer.zIndex + 1, 10000000) }, function(index) {
        callback && callback();
        layer.close(index);
    }, function(index) {
        cancel && cancel();
        layer.close(index);
    });
    $(':focus').blur();
}

function createPage(frame, options = {}) {
    var PageComponent = $(`<div class="gui-page-wapper" style="margin:20px 0;line-height: 28px;" id="f1_teacher_pageContent">
        <ul class="gui-page" id="limitUi">
            <span class="gui-page-total">共<span class="numberShow page-limits">0</span>页
            <span class="numberShow page-total">0</span>条数据</span>
            <span class="page-less"></span>
        </ul>
        <span class="gui-page-options-elevator" style="padding-left: 10px;">
            每页条数：
            <select class="page-limit" lay-ignore>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>
        </span>
        <span class="gui-page-options">
            <span class="gui-page-options-elevator" style="display:block;width:120px;">跳至第<input class="gui-input page-local" data-onlynumber="true" style="width:30px;border-radius:4px;" value="1">页</span>
        </span>
    </div>`);

    var fillHtml = function(obj, args) {
        obj.empty();

        if (args.current > 1) {
            obj.append('<li title="上一页" class="gui-page-prev"><a><i class="fa fa-angle-left"></i></a></li>');
        } else {
            obj.remove('.prevPage');
            obj.append('<li title="上一页" class="gui-page-prev gui-page-disabled"><a><i class="fa fa-angle-left"></i></a></li>');
        }

        if (args.current != 1 && args.current >= 4 && args.pages != 4) {
            // obj.append('<a href="javascript:;" class="tcdNumber">' + 1 + '</a>');
            obj.append('<li title="1" class="gui-page-item "><a>1</a></li>');
        }
        if (args.current - 2 > 2 && args.current <= args.pages && args.pages > 5) {
            obj.append('<li class="gui-page-item-jump-next"><a><i class="fa fa-ellipsis-h"></i></a></li>');
        }

        var start = args.current - 2;
        var end = args.current + 2;
        if ((start > 1 && args.current < 4) || args.current == 1) {
            end++;
        }
        if (args.current > args.pages - 4 && args.current >= args.pages) {
            start--;
        }

        for (; start <= end; start++) {
            if (start <= args.pages && start >= 1) {
                if (start != args.current) {
                    // obj.append('<a href="javascript:;" class="tcdNumber">' + start + '</a>');
                    obj.append('<li title="' + start + '" class="gui-page-item"><a>' + start + '</a></li>');
                } else {
                    // obj.append('<span class="current">' + start + '</span>');
                    obj.append('<li title="' + start + '" class="gui-page-item gui-page-item-active"><a>' + start + '</a></li>');
                }
            }
        }

        if (args.current + 2 < args.pages - 1 && args.current >= 1 && args.pages > 5) {
            obj.append('<li title="向后 5 页" class="gui-page-item-jump-next"><a><i class="fa fa-ellipsis-h"></i></a></li>');
        }
        if (args.current != args.pages && args.current < args.pages - 2 && args.pages != 4) {
            obj.append('<li title="' + args.pages + '" class="gui-page-item"><a>' + args.pages + '</a>');
        }

        if (args.current < args.pages) {
            obj.append('<li title="下一页" class="gui-page-next"><a><i class="fa fa-angle-right"></i></a></li>');
        } else {
            obj.remove('.nextPage');
            obj.append('<li title="下一页" class="gui-page-next gui-page-disabled"><a><i class="fa fa-angle-right"></i></a></li>');
        }
    };

    var listener = function(obj, args) {
        var self = PageComponent;

        obj.off('click', '.gui-page-item');
        obj.off('click', 'li.gui-page-prev');
        obj.off('click', 'li.gui-page-next');

        // 点击页码
        obj.on('click', '.gui-page-item', function() {
            var current = parseInt($(this).text()) || 1;

            $('#dang').text(current);

            self.find('.page-local').val(current);

            fillHtml(obj, {
                current: current,
                pages  : args.pages
            });

            args.onchange && args.onchange(current, +self.find('.page-limit').val());
        });

        // 上一页
        obj.on('click', 'li.gui-page-prev', function() {
            if ($(this).hasClass('gui-page-disabled')) {
                return false;
            }
            var current = parseInt(obj.children('.gui-page-item-active').text());
            if (!current) {
                current = 2;
            }
            // aa = current - 1;
            $('#dang').text(current - 1);
            self.find('.page-local').val(current - 1);
            fillHtml(obj, {
                current: current - 1,
                pages  : args.pages
            });

            args.onchange && args.onchange(current - 1, +self.find('.page-limit').val());
        });

        // 下一页
        obj.on('click', 'li.gui-page-next', function() {
            if ($(this).hasClass('gui-page-disabled')) {
                return false;
            }
            var current = parseInt(obj.children('.gui-page-item-active').text());
            // aa = current + 1;
            $('#dang').text(current + 1);
            self.find('.page-local').val(current + 1);

            fillHtml(obj, {
                current: current + 1,
                pages  : args.pages
            });

            args.onchange && args.onchange(current + 1, +self.find('.page-limit').val());
        });
        self.find('.page-local').keyup(function(e) {
            // 如果按回车执行提交操作
            if (e.keyCode == 13) {
                var now = parseInt(self.find('.page-local').val()) || 1;
                var total = parseInt(self.find('.page-limits').text());

                if (now > total) {
                    now = total;
                    self.find('.page-local').val(total);
                    myAlert('您输入的页码已超出总页数', 2, null);
                    return false;
                } else if (now < 1) {
                    now = 1;
                    self.find('.page-local').val('1');
                }

                fillHtml(obj, {
                    current  : now,
                    pageCount: args.pages
                });

                args.onchange && args.onchange(now, +self.find('.page-limit').val());
            }
        });
        self.find('.page-limit').unbind('change');
        self.find('.page-limit').change(function() {
            fillHtml(obj, {
                current: 1,
                pages  : args.pages
            });

            args.onchange && args.onchange(1, +self.find('.page-limit').val());
        });
    };

    var args = $.extend({
        current : 1, // 当前页数
        pages   : 10, // 总页数
        size    : 0, // 分页条数
        total   : 0, // 总数据量
        onchange: function() { }
    }, options);

    fillHtml(PageComponent.find('.page-less'), args);
    listener(PageComponent.find('.page-less'), args);

    PageComponent.find('.page-limits').html(args.pages);
    PageComponent.find('.page-total').html(args.total);
    PageComponent.find('.page-limit').val(args.size);
    PageComponent.find('.page-local').val(args.current);

    $(frame).html(PageComponent);

    return PageComponent;
}

function createTable(options = {}) {
    options = Object.assign({
        id              : '',
        // {type:"text",name:"keywords",placeholder:"搜索关键字",default:"",auto:true},
        opera           : [],
        // {type:"",name:"",title:"",field:""}
        header          : [],
        api             : '',
        page            : true,
        opera_gird      : 'flex',
        getRequestFields: function(fields) { return {}; },
        success         : function(data) {}
    }, options);

    const DM = component.create(`<div class="layui-form">
        <form action="javascript:;" class="search site"></form>
        <table class="tab tablesorter-blue">
            <thead></thead>
            <tbody></tbody>
        </table>
        <div id="table_page"></div>
    </div>`);

    if (!util.isEmpty(options.id)) {
        DM.el.id = options.id;
        DM.el.setAttribute('lay-filter', options.id);
    }

    const SearchDM = DM.appoint('.search');
    const PageDM = DM.appoint('#table_page');
    const TheadDM = DM.appoint('thead');
    const TbodyDM = DM.appoint('tbody');
    let header_checkbox;
    let search_multishow; // 处理勾选后搜索项显隐
    let form_require_render = false; // 是否需要处理后刷新layui渲染
    const index = Date.now().toString(32).toUpperCase();
    DM.el.INDEX = index;

    if (options.opera_gird == 'block') {
        SearchDM.el.classList.add('search-column');
    }

    const createHeader = function() {
        const TrDM = component.create('<tr></tr>');

        TrDM.append(options.header.map(header => {
            header.colspan = util.defaults(header.colspan, '');
            header.width = util.defaults(header.width, '');
            header.title = util.defaults(header.title, '');

            switch (header.type) {
                case 'checkbox':
                    if (!header_checkbox) {
                        header_checkbox = header;
                    }

                    const CheckboxDM = component.create(`<label class="label-checkbox"><input type="checkbox" class="table-checked-all" lay-ignore/><span></span></label>`);

                    CheckboxDM.appoint('input').addEventListener('change', function() {
                        util.like2Array(DM.querySelectorAll('.table-check')).map(Checkbox => {
                            Checkbox.checked = this.checked;
                        });
                        header.onselected && header.onselected(DM.selected());
                        search_multishow && search_multishow(DM.selected());
                    });
                    return component.create(`<td colspan="${header.colspan}" style="width:${header.width};"></td>`).append(CheckboxDM);
                case 'switch':
                    layui.form.on('switch(' + index + '_' + header.name + ')', function(data) {
                        const checked = data.elem.checked;
                        header.onchange && header.onchange(data.elem.__DATA__, checked, function() {
                            data.elem.checked = !checked;
                            layui.form.render('checkbox');
                        });
                    });
                    form_require_render = true;
                case 'text':
                case 'link_group':
                default:
                    return component.create(`<th title="${header.title}" style="width:${header.width};" colspan="${header.colspan}">${header.title}</th>`);
            }
        }));

        return TrDM;
    };

    // 极简创建单行内容
    const createTr = function(item = {}, _DM = null) {
        let TrDM = _DM;
        if (!TrDM) {
            TrDM = component.create('<tr></tr>');
        }
        const TdDMMap = {};

        // 获取值的内容，如果值是个function，执行并返回内容
        const getValue = function(option) {
            if (!option) {
                return undefined;
            }

            if (util.type(option) == 'function') {
                return option(item);
            }

            return option.split('.').reduce(function(previous, current) {
                return previous && previous[current];
            }, item);
        };

        const getStaticValue = function(option) {
            return util.type(option) == 'function' ? option(item) : option;
        };

        TrDM.append(options.header.map(header => {
            header.colspan = util.defaults(header.colspan, '');
            header.width = util.defaults(header.width, '');
            header.title = util.defaults(header.title, '');
            header.nolabel = util.defaults(header.nolabel, false);

            let TdDM;
            let AppendDM;

            switch (header.type) {
                case 'checkbox':
                    TdDM = component.create(`<label class="label-checkbox"><input type="checkbox" name="table_check" class="table-check" lay-ignore style="display:none"/><span></span></label>`);
                    TdDM.appoint('input').el.data = item;
                    TdDM.appoint('input').addEventListener('change', function() {
                        if (!this.checked) {
                            DM.appoint('.table-checked-all').el.checked = false;
                        } else {
                            DM.appoint('.table-checked-all').el.checked = true;
                            const childs = util.like2Array(DM.querySelectorAll('.table-check'));
                            for (let i = 0; i < childs.length; i++) {
                                if (!childs[i].checked) {
                                    DM.appoint('.table-checked-all').el.checked = false;
                                    break;
                                }
                            }
                        }
                        header.onselected && header.onselected(DM.selected());
                        search_multishow && search_multishow(DM.selected());
                    });
                    TdDM.data = header;
                    AppendDM = component.create(`<td colspan="${header.colspan}"></td>`).append(TdDM);
                    break;
                case 'link_group':
                    const linkGroupDM = component.create(`<td class="opera"></td>`);
                    const linkGroupDMs = {};
                    linkGroupDM.append(header.group.map(g => {
                        const $g = getStaticValue(g);

                        if ($g.hasOwnProperty('show') && !$g.show(item)) {
                            return false;
                        }
                        const title = util.defaults(getStaticValue($g.title), '');
                        const className = util.defaults(getStaticValue($g.class), '');
                        const style = util.defaults(getStaticValue($g.style), '');
                        const ADM = component.create(`<a href="javascript:;" class="${className}" style="${style}">${title}</a>`);
                        ADM.addEventListener('click', function() {
                            $g.onclick && $g.onclick.call(TrDM, item);
                        });
                        ADM.data = header;
                        linkGroupDMs[$g.name] = ADM;
                        return ADM;
                    }).filter(g => g !== false));
                    TdDM = linkGroupDMs;
                    AppendDM = linkGroupDM;
                    break;
                case 'switch':
                    const checked = util.defaults(getValue(header.field), false);
                    const text = util.defaults(getValue(header.text), '开启|关闭');
                    TdDM = component.create(`<input type="checkbox" name="top" class="f-hidden" lay-skin="switch" lay-text="${text}" lay-filter="${index}_${header.name}" value="1" ${checked ? 'checked' : ''}/>`, item, {
                        accessDom: true
                    });
                    TdDM.data = header;
                    AppendDM = component.create('<td></td>').append(TdDM);
                    break;
                case 'image':
                    const src = util.defaults(getValue(header.field), false);
                    TdDM = component.create(`<img src="{{text}}" style="width:100px;height:140px;object-fit:contain;cursor:pointer"/>`, {
                        text: src
                    }, {
                        accessDom: true
                    });
                    TdDM.data = header;

                    TdDM.addEventListener('click', function() {
                        // 处理图片
                        const enlargeWindow = component.create(`<div style="height:100%"><img src="${CONST.IMG1PX}" style="width:100%;height:100%;object-fit:contain" data-photo data-image-loading /></div>`);

                        // 加载图片动画
                        const image = new Image();
                        const onload = function() {
                            enlargeWindow.appoint('[data-photo]').el.src = this.src;
                            enlargeWindow.appoint('[data-photo]').el.removeAttribute('data-image-loading');

                            // 点击放大图片
                            openLiteWindow(enlargeWindow, {
                                area      : ['96%', '96%'],
                                shadeClose: true
                            });
                        };

                        const onerror = function() {
                            image.removeEventListener('load', onload);
                        };
                        image.addEventListener('load', onload);
                        image.addEventListener('error', onerror);

                        image.src = src;
                    });

                    AppendDM = component.create('<td></td>').append(TdDM);
                    break;
                case 'text':
                default:
                    const className = util.defaults(getValue(header.class), '');
                    const td = component.create(`<td title="${header.nolabel ? value : ''}" colspan="${header.colspan}" class="${className}"></td>`);
                    let TdDMs = {};
                    if (!util.isEmpty(header.group)) {
                        header.group.map(g => {
                            const value = util.defaults(getValue(g.field), '');
                            const className = util.defaults(getValue(g.class), '');
                            if (g.hasOwnProperty('show') && !g.show(item)) {
                                return;
                            }
                            const ADM = component.create(`<a href="javascript:;" class="${className} text" style="padding:0 10px">${value}</a>`);
                            ADM.addEventListener('click', function() {
                                g.onclick && g.onclick.call(TrDM, item);
                            });
                            ADM.data = header;
                            TdDMs[g.name] = ADM;
                            td.append(ADM);
                        });
                    } else {
                        if (!header.hasOwnProperty('show') || header.show(item)) {
                            const value = util.defaults(getValue(header.field), '');
                            const ADM = component.create(`<span>${value}</span>`);
                            ADM.data = header;
                            TdDMs = ADM;
                            td.append(ADM);
                        }
                    }
                    TdDM = TdDMs;
                    AppendDM = td;
            }

            TdDMMap[header.name] = TdDM;

            return AppendDM;
        }));

        TrDM.__super__ = DM;

        // 动态改变显示text
        TrDM.setText = function(set, value) {
            let _TdDM = TdDMMap;
            set.split('.').map(_set => {
                _TdDM = _TdDM[_set];
            });

            const header = _TdDM.data;

            switch (header.type) {
                case 'text':
                default:
                    _TdDM.text(value);
            }
        };

        TrDM.reset = function(item) {
            createTr(item, TrDM.empty());
        };

        return TrDM;
    };

    // 创建表头
    TheadDM.append(createHeader());
    // 创建初始
    TbodyDM.empty().append(component.create(`<td colspan="${options.header.length}">暂无内容</td>`));

    function getFields(fields) {
        return Object.assign({
            page: 1,
            size: 10
        }, fields, util.getFields(SearchDM.el));
    }

    let historyFields = {};
    // 获取内容
    function getResponse(fields = {}, callback) {
        fields = getFields(fields);

        // 如果获取外部参数为false，取消本次请求
        const requestFields = options.getRequestFields(fields);
        if (requestFields === false) {
            return false;
        }

        fields = Object.assign(fields, requestFields);
        // 取消选中状态，并且触发一次空的选中回调
        if (header_checkbox) {
            DM.appoint('.table-checked-all').el.checked = false;
            util.like2Array(DM.querySelectorAll('.table-check')).map(Checkbox => {
                Checkbox.checked = false;
            });
            header_checkbox.onselected && header_checkbox.onselected(DM.selected());
            search_multishow && search_multishow(DM.selected());
        }

        options.api.call(api, fields, function(result) {
            historyFields = fields;
            const list = result.data.list;
            const _page = result.data.page || {};

            if (list.length == 0) {
                TbodyDM.empty().append(component.create(`<td colspan="${options.header.length}">暂无内容</td>`));
            } else {
                TbodyDM.empty().append(list.map(item => {
                    if (item.toObject) {
                        item = item.toObject();
                    }
                    return createTr(item);
                }));
                form_require_render && layui.form.render('checkbox');
            }

            // 成功回调
            callback && callback(result.data);

            // 显示分页
            _page.onchange = function(page, size) {
                getResponse({
                    page: page,
                    size: size
                });
            };

            if (options.page) {
                createPage(PageDM.el, _page);
            }
        }, function(e) {
            errorAlert(e.message);
        });
    }

    DM.request = getResponse;
    DM.getFields = function(writeNew = false) {
        return writeNew ? getFields() : historyFields;
    };

    let SEARCH_ID = 1;

    const createOperaItem = function(opera = {}) {
        if (util.type(opera) != 'object') {
            return false;
        }

        // 整行整组
        opera = Object.assign({
            key        : 'opera_' + SEARCH_ID,
            type       : 'text',
            name       : '',
            text       : '',
            placeholder: '',
            disabled   : false,
            default    : '',
            options    : [],
            multishow  : false,
            arrange    : 'left',
            auto       : false,
            onclick() {}
        }, opera);

        const LineDM = component.create('<span class="layui-input-inline" data-opera-key="' + opera.key + '"></span>', opera);

        let textSt;
        switch (opera.type) {
            case 'text':
                const ItemTextDM = component.create(`<input type="text" name="${opera.name || ''}" class="layui-input" value="${opera.default || ''}" placeholder="${opera.placeholder || ''}" maxlength="${opera.maxlength || ''}" style="${opera.style || ''}"/>`);

                ItemTextDM.addEventListener('input', function() {
                    clearInterval(textSt);
                    textSt = setTimeout(function() {
                        getResponse();
                    }, 400);
                });

                LineDM.append(ItemTextDM);
                break;
            case 'select':
                const select_common = 'FORM_SEARCH_SELECT_W' + Date.now();
                const select_id = select_common + opera.key;
                const ItemSelectDM = component.create(`<select name="${opera.name || ''}" lay-filter="${select_id}"></select>`);
                let beforeValue = opera.default;

                let hasLabel = false;

                if (!util.isEmpty(opera.placeholder)) {
                    hasLabel = true;
                    ItemSelectDM.append(`<option value="">${opera.placeholder}</option>`);
                }

                // 缓存列表数据
                let optionsDataMap = {};

                const run = function(data, callback) {
                    if (hasLabel) {
                        ItemSelectDM.nfempty();
                    } else {
                        ItemSelectDM.empty();
                    }

                    optionsDataMap = {};

                    data.map(option => {
                        const optionDM = component.create(`<option value="${option.value || ''}" ${option.value == opera.default ? 'selected' : ''} ${option.disabled ? 'disabled' : ''}>${option.name || ''}</option>`, option);
                        ItemSelectDM.append(optionDM);
                        optionsDataMap[option.value] = {
                            DM  : optionDM,
                            data: option
                        };
                    });

                    layui.form.render('select');
                    callback && callback(data);
                };

                const getOptions = function(callback) {
                    const options_type = util.type(opera.options);

                    // 静态赋值
                    if (options_type == 'array') {
                        run(opera.options, callback);
                        return;
                    }

                    // 异步处理
                    // 在点击下拉框时进行加载
                    if (options_type == 'function') {
                        opera.options(function(options) {
                            run(options, callback);
                        }, getFields(), 'initial');
                        return;
                    }
                };

                const getData = function() {
                    getResponse();
                };

                getOptions();

                layui.form.on('select(' + select_id + ')', function(data) {
                    // 上次选中的值不触发事件，以传入的default值为准
                    if (data.value == beforeValue) {
                        return;
                    }

                    beforeValue = data.value;

                    if (opera.onchange) {
                        opera.onchange(optionsDataMap[data.value], function() {
                            getData();
                        });
                    } else {
                        getData();
                    }
                });

                LineDM.append(ItemSelectDM);

                /**
                 * 创建下拉框异步蒙版
                 *
                 * @param {string} title 蒙版标题，需与原select文字相同
                 * @param {function} loadingCallback(successCallback) 加载请求 successCallback(options) 执行列表数组，options=true为保持原样，options=false为暂无数据
                 *
                 * 调用方式：createAsyncSelectMask('加载中', function (done) { done([]) })
                 *
                 * @returns asyncDM 蒙版DM
                 */
                const createAsyncSelectMask = function(title = '加载中', loadingCallback, loading = false) {
                    const asyncDM = component.create(`<div class="layui-input async-input-mask"><span>${title}</span><span data-replace-icon></span></div>`, {
                        loading: 0
                    });
                    const normalIcon = component.create('<i class="layui-edge normal-icon" data-icon></i>');
                    const loadingIcon = component.create('<i class="fa fa-spinner fa-spin loading-icon"></i>');
                    const replaceIcon = asyncDM.appoint('[data-replace-icon]');
                    replaceIcon.html(normalIcon);

                    asyncDM.on('data:loading', function(val) {
                        if (val === false) {
                            replaceIcon.html(normalIcon);
                            return;
                        }

                        if (val === true) {
                            replaceIcon.html(loadingIcon);

                            /**
                             * 异步查询时options必须为function
                             * callback @params {Array|Boolean} options 下拉列表 { name, value } 如果为true，列表保持不变；如果为false为暂无数据
                             */
                            loadingCallback && loadingCallback(options => {
                                if (options === true) {
                                    return;
                                }

                                if (options === false) {
                                    options = [{ name: '暂无数据', value: 'EMPTYVALUE', disabled: true }];
                                }

                                run(options);
                                asyncDM.remove();

                                // 直接出发点击
                                setTimeout(() => {
                                    LineDM.appoint('input.layui-unselect').el.click();
                                }, 0);
                            }, getFields(), 'trigger');
                        }
                    });

                    asyncDM.data.loading = loading;

                    asyncDM.addEventListener('click', function(e) {
                        if (loading) {
                            return false;
                        }

                        asyncDM.data.loading = true;
                    });

                    return asyncDM;
                };

                LineDM.createAsyncSelectMask = LineDM.el.createAsyncSelectMask = createAsyncSelectMask;

                // 点击下拉框查询异步
                if (opera.async) {
                    const asyncDM = createAsyncSelectMask.call(LineDM, opera.placeholder, opera.options);

                    LineDM.append(asyncDM);
                }
                break;
            case 'date':
            case 'day':
                const ItemDateDM = component.create(`<span>
                    <input type="text" class="layui-input daterange" value="${opera.default}" placeholder="${opera.placeholder || ''}" lay-key="${opera.name + '_' + ND.timestamp}" readonly style="${opera.style || ''}"/>
                    <input type="hidden" name="${opera.name || ''}" class="daterange-start" value="${opera.default}"/>
                </span>`);
                // layui 处理方式
                layui.use(['laydate'], function() {
                    const start = ItemDateDM.appoint('.daterange-start');
                    layui.laydate.render({
                        elem   : ItemDateDM.appoint('.daterange').el,
                        range  : false,
                        trigger: 'click',
                        type   : opera.type == 'day' ? 'date' : 'datetime',
                        done   : function(value, date) {
                            const dates = value.split(' - ');
                            start.el.value = util.defaults(dates[0], '');
                            setTimeout(function() {
                                getResponse();
                            }, 0);
                        }
                    });
                });

                LineDM.append(ItemDateDM);
                break;
            case 'daterange':
            case 'dayrange':
                const ItemDateRangeDM = component.create(`<span>
                    <input type="text" class="layui-input daterange" placeholder="${opera.placeholder || ''}" lay-key="${opera.name + '_' + ND.timestamp}" readonly style="${opera.style || ''}"/>
                    <input type="hidden" name="${opera.name ? opera.name + '_start' : ''}" class="daterange-start" value=""/>
                    <input type="hidden" name="${opera.name ? opera.name + '_end' : ''}" class="daterange-end" value=""/>
                </span>`);
                // layui 处理方式
                layui.use(['laydate'], function() {
                    const start = ItemDateRangeDM.appoint('.daterange-start');
                    const end = ItemDateRangeDM.appoint('.daterange-end');
                    layui.laydate.render({
                        elem   : ItemDateRangeDM.appoint('.daterange').el,
                        range  : true,
                        trigger: 'click',
                        type   : opera.type == 'dayrange' ? 'date' : 'datetime',
                        done   : function(value, date, endDate) {
                            const dates = value.split(' - ');
                            start.el.value = util.defaults(dates[0], '');
                            end.el.value = util.defaults(dates[1], '');
                            setTimeout(function() {
                                getResponse();
                            }, 0);
                        }
                    });
                });

                LineDM.append(ItemDateRangeDM);
                break;
            case 'range':
                const ItemRangeDM = component.create(`<span class="layui-input-inline layui-inputrange">
                    <span class="layui-input-inline" data-opera-min></span>
                    ${opera.connectChar || ''}
                    <span class="layui-input-inline" data-opera-max></span>
                </span>`);

                const minDM = createOperaItem(opera.minOpera);
                const maxDM = createOperaItem(opera.maxOpera);

                ItemRangeDM.appoint('[data-opera-min]').append(minDM);
                ItemRangeDM.appoint('[data-opera-max]').append(maxDM);

                LineDM.append(ItemRangeDM);
                break;
            case 'dropdown':
                const ItemDropdownDM = component.create(`<span class="layui-input-inline pointer">${opera.placeholder}</span>`);

                LineDM.append(ItemDropdownDM);

                layui.use('dropdown', function() {
                    layui.dropdown.render({
                        elem: ItemDropdownDM.el,
                        data: opera.options,
                        click(data) {
                            opera.onclick && opera.onclick(data);
                        }
                    });
                });

                break;
            case 'button':
                const ItemButtonDM = component.create(`<button type="button" class="layui-btn layui-btn-${opera.color || ''}" ${opera.disabled ? 'disabled' : ''}>${opera.text || ''}</button>`);

                ItemButtonDM.addEventListener('click', function() {
                    if (opera.onclick) {
                        const fields = util.getFields(SearchDM.el);
                        opera.onclick.call(ItemButtonDM, fields, DM.selected());
                    }
                });

                ItemButtonDM.__super__ = DM;

                LineDM.append(ItemButtonDM);

                break;
        }

        return LineDM;
    };

    // 创建搜索条件
    const createOpera = function(operas = []) {
        const LeftDM = component.create('<div></div>');
        const RightDM = component.create('<div></div>');
        const opera_multishow_items = [];
        const FRAME = Date.now();

        const getStaticValue = function(option) {
            return util.type(option) == 'function' ? option() : option;
        };

        operas.map(opera => {
            opera = getStaticValue(opera);

            if (util.type(opera) != 'object') {
                return false;
            }

            if (!opera.hasOwnProperty('key')) {
                opera.key = 'opera_' + SEARCH_ID++;
            }

            const LineDM = createOperaItem(opera);

            if (opera.multishow) {
                switch (opera.type) {
                    case 'button':
                        LineDM.appoint('button').el.className = `layui-btn layui-btn-disabled`;
                        LineDM.appoint('button').el.disabled = true;
                        break;
                }

                opera_multishow_items.push(LineDM);
            }

            LeftDM.append(LineDM);
        });

        search_multishow = function(selected) {
            const display = selected.length > 0; // ? "inline-block" : "none";
            opera_multishow_items.map(item => {
                switch (item.data.type) {
                    case 'button':
                        item.appoint('button').el.className = display ? `layui-btn layui-btn-${item.data.color || ''}` : `layui-btn layui-btn-disabled`;
                        item.appoint('button').el.disabled = !display;
                }
                // item.el.style.display = display;
            });
        };

        if (options.opera_gird == 'block') {
            SearchDM.append(RightDM, LeftDM);
        } else {
            SearchDM.append(LeftDM, RightDM);
        }
    };

    if (!util.isEmpty(options.opera)) {
        createOpera(options.opera);
    } else {
        SearchDM.remove();
    }

    // 当有多项选择时才可能会有值
    DM.selected = function() {
        const selected = [];
        util.like2Array(DM.querySelectorAll('.table-check:checked')).map(Checkbox => {
            selected.push(Checkbox.data);
        });

        return selected;
    };

    DM.showed = function() {
        const showed = [];
        util.like2Array(DM.querySelectorAll('.table-check')).map(Checkbox => {
            showed.push(Checkbox.data);
        });

        return showed;
    };

    /**
     * 变更某个opera块内容（根据key寻找）
     */
    DM.refreshOpera = function(key, opera = {}) {
        opera.key = key;
        const oldLineDM = DM.appoint("[data-opera-key='" + opera.key + "']");

        opera = Object.assign(oldLineDM.data, opera);

        const LineDM = createOperaItem(opera);

        DM.appoint("[data-opera-key='" + opera.key + "']").replace(LineDM);

        if (opera.type == 'select') {
            layui.form.render('select');
        }

        return DM;
    };

    /**
     * 临时开启加载蒙版（只对select生效）
     */
    DM.openLoading = function(key, done) {
        const LineDM = DM.appoint("[data-opera-key='" + key + "']");
        const opera = LineDM.data;

        if (opera.type != 'select') {
            return;
        }

        const asyncDM = LineDM.el.createAsyncSelectMask(opera.placeholder, function(options) {
            done(options);
        }, true);

        LineDM.append(asyncDM);

        return asyncDM.data;
    };

    /**
     * 解除返回的所有属性（el属性除外）
     */
    DM.destruct = function() {
        for (name in DM) {
            if (name != 'el') {
                delete DM[name];
            }
        }
    };

    // 初始化完成执行
    getResponse({}, options.success);

    return DM;
}

function openLiteWindow(DM, options = {}) {
    DM.el.style.display = 'none';
    $('body').append(DM.el);

    const windowConfig = Object.assign({
        index  : 0,
        type   : 1,
        title  : '',
        area   : ['460px', '260px'],
        skin   : '',
        btn    : false,
        zIndex : 10000000,
        content: $(DM.el)
    }, options);

    windowConfig.success = function(layero, index) {
        windowConfig.index = index;

        options.success && options.success(function() {
            layui.layer.close(index);
        });
    };

    windowConfig.close = function() {
        layui.layer.close(windowConfig.index);
    };

    layui.layer.open(windowConfig);

    return windowConfig;
}
