function Create() {
    return {
        nav(selected, child) {
            let $0;
            const $1 = $('<li><a href="#F1" class="cateParentA">统计视图</a></li>');
            const $2 = $(`<li style="position:relative">
                <a href="javascript:;" class="layui-nav-item cateParentA">站点管理 <span class="layui-nav-more"></span></a>
                <dl class="layui-nav-child layui-anim layui-anim-upbit" style="top:40px"></dl>
            </li>`);
            const $2_1 = $('<dd><a href="#F2_1" class="cateParentA layui-btn-fluid">栏目管理</a></dd>');
            const $2_2 = $('<dd><a href="#F2_2" class="cateParentA layui-btn-fluid">文章管理</a></dd>');
            const $2_3 = $('<dd><a href="#F2_3" class="cateParentA layui-btn-fluid">页面管理</a></dd>');
            const $2_4 = $('<dd><a href="#F2_4" class="cateParentA layui-btn-fluid">相册管理</a></dd>');
            const $2_5 = $('<dd><a href="#F2_5" class="cateParentA layui-btn-fluid">评论管理</a></dd>');
            const $2_6 = $('<dd><a href="#F2_6" class="cateParentA layui-btn-fluid">留言管理</a></dd>');
            const $2_7 = $('<dd><a href="#F2_7" class="cateParentA layui-btn-fluid">宣传管理</a></dd>');
            const $2_8 = $('<dd><a href="#F2_8" class="cateParentA layui-btn-fluid">友情链接</a></dd>');
            const $3 = $('<li><a href="#F3" class="cateParentA">系统日志</a></li>');
            let $4;
            let $5;

            if (config.USER.IS_SYSTEM_ADMIN) {
                $4 = $('<li><a href="#F4" class="cateParentA">项目管理</a></li>');
                $5 = $('<li><a href="#F5" class="cateParentA">模板管理</a></li>');
            }

            // layui.use('dropdown', function() {
            //     layui.dropdown.render({
            //         elem   : $2,
            //         trigger: 'hover',
            //         data   : [
            //             { title: '栏目管理', id: '2_1', href: '#F2_1', templet: '<div>2211</div>' },
            //             { title: '文章管理', id: '2_2', href: '#F2_2' },
            //             { title: '页面管理', id: '2_3', href: '#F2_3' },
            //             { title: '相册管理', id: '2_4', href: '#F2_4' },
            //             { title: '评论管理', id: '2_5', href: '#F2_5' },
            //             { title: '留言管理', id: '2_6', href: '#F2_6' },
            //             { title: '宣传管理', id: '2_7', href: '#F2_7' },
            //             { title: '友情链接', id: '2_8', href: '#F2_8' }
            //         ],
            //         align: 'center'
            //     });
            // });

            let st;
            $2.on('mouseenter', function() {
                clearTimeout(st);
                st = setTimeout(() => {
                    $(this).find('.layui-nav-child').addClass('layui-show');
                    $(this).find('.layui-nav-more').addClass('layui-nav-mored');
                }, 300);
            });
            $2.on('mouseleave', function() {
                clearTimeout(st);
                st = setTimeout(() => {
                    $(this).find('.layui-nav-child').removeClass('layui-show');
                    $(this).find('.layui-nav-more').removeClass('layui-nav-mored');
                }, 300);
            });

            switch (selected + '') {
                case '1': $1.find('a')[0].className = 'cateParentALL'; break;
                case '2':
                    $2.find('a')[0].className = 'cateParentALL';

                    switch (child + '') {
                        case '1': $2_1.find('a')[0].className = 'cateParentALL layui-btn-fluid'; break;
                        case '2': $2_2.find('a')[0].className = 'cateParentALL layui-btn-fluid'; break;
                        case '3': $2_3.find('a')[0].className = 'cateParentALL layui-btn-fluid'; break;
                        case '4': $2_4.find('a')[0].className = 'cateParentALL layui-btn-fluid'; break;
                        case '5': $2_5.find('a')[0].className = 'cateParentALL layui-btn-fluid'; break;
                        case '6': $2_6.find('a')[0].className = 'cateParentALL layui-btn-fluid'; break;
                        case '7': $2_7.find('a')[0].className = 'cateParentALL layui-btn-fluid'; break;
                        case '8': $2_8.find('a')[0].className = 'cateParentALL layui-btn-fluid'; break;
                    }

                    break;
                case '3': $3.find('a')[0].className = 'cateParentALL'; break;
                case '4': $4.find('a')[0].className = 'cateParentALL'; break;
                case '5': $5.find('a')[0].className = 'cateParentALL'; break;
            }

            $('.categoryTxt').empty();

            // 创建管理员可视
            const Website = cache.get('website', CONST.SESSION_STORAGE);
            const WebsiteCurrent = cache.get('website_current', CONST.SESSION_STORAGE);

            if (!util.isEmpty(WebsiteCurrent)) {
                $0 = $(`<li style="position:absolute;left:0;top:12px;width:auto;margin-left:20px">
                        <a href="javascript:;" class="layui-nav-item cateParentA" style="max-width:260px;width:auto;text-align:left;padding:0 36px 0 10px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;min-width:100px;">${WebsiteCurrent.siteName} <span class="layui-nav-more"></span></a>
                        <dl class="layui-nav-child layui-anim layui-anim-upbit" style="top:40px;max-height:300px;overflow:auto"></dl>
                    </li>`);
            } else {
                $0 = $(`<li style="position:absolute;left:0;top:12px;width:auto;margin-left:20px">
                        <a href="javascript:;" class="layui-nav-item cateParentA" style="max-width:260px;width:auto;text-align:center;padding:0 10px 0 10px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;min-width:100px;">暂无数据</a>
                    </li>`);
            }

            const sitebtns = [];

            Website.map(site => {
                const $btn = $('<dd><a href="javascript:;" class="cateParentA layui-btn-fluid" style="width:100%;padding:0 10px;text-align:left;">' + site.siteName + '</a></dd>');

                if (config.SITE.ID == site.siteId) {
                    $btn.find('a')[0].className = 'cateParentALL layui-btn-fluid';
                } else {
                    $btn.on('click', function() {
                        const Content = component.create(`<div style="display:none;text-align:center;padding-top:30px">
                                <div style="font-weight:800">准备切换至站点【${site.siteName}】</div>
                                <div style="padding:40px 0">请确认您已经保存了正在操作的内容，再执行切换操作</div>
                                <div>
                                    <button type="button" id="f_change_cancel" class="layui-btn layui-btn-primary">取消</button>
                                    <button type="button" id="f_change_success" class="layui-btn layui-btn-normal">切换</button>
                                </div>
                            </div>`);

                        $('html').append(Content.el);

                        layui.layer.open({
                            type    : 1,
                            title   : false,
                            closeBtn: false,
                            area    : ['460px', '260px'],
                            skin    : '',
                            btn     : false,
                            zIndex  : 10000000,
                            content : $(Content.el),
                            success : function(layero, index) {
                                Content.appoint('#f_change_cancel').addEventListener('click', function() {
                                    layui.layer.close(index);
                                });
                                Content.appoint('#f_change_success').addEventListener('click', function() {
                                    // 选择站点
                                    api.request('/schoolweb/manage/webSite/selectSite', {
                                        siteId: site.siteId
                                    }, {
                                        done() {
                                            cache.set('website_current', site, CONST.SESSION_STORAGE);
                                            location.href = '#F';
                                        },
                                        fail() {
                                            errorAlert('切换失败，请重试');
                                        }
                                    });

                                    // layui.layer.close(index);
                                });
                            }
                        });
                    });
                }

                sitebtns.push($btn);
            });

            if (sitebtns.length == 0) {
                sitebtns.push($('<dd><a href="javascript:;" class="cateParentA layui-btn-fluid" style="width:100%;padding:0 10px;text-align:left;color:#999">暂无数据</a></dd>'));
            }

            $0.find('.layui-nav-child').append(sitebtns);

            let st0;
            $0.on('mouseenter', function() {
                clearTimeout(st0);
                st0 = setTimeout(() => {
                    $(this).find('.layui-nav-child').addClass('layui-show');
                    $(this).find('.layui-nav-more').addClass('layui-nav-mored');
                }, 300);
            });
            $0.on('mouseleave', function() {
                clearTimeout(st0);
                st0 = setTimeout(() => {
                    $(this).find('.layui-nav-child').removeClass('layui-show');
                    $(this).find('.layui-nav-more').removeClass('layui-nav-mored');
                }, 300);
            });

            $2.find('.layui-nav-child').append([
                $2_1, $2_2, $2_3, $2_4, $2_5, $2_6, $2_7, $2_8
            ]);

            $('.categoryTxt').append([
                $0, $1, ' ', $2, ' ', $3, ' ', $4, ' ', $5
            ]);

            // if (config.USER.IS_ADMIN) {
            //     $(".categoryTxt").append([
            //         $1, " ", $2, " ", $3
            //     ]);
            // } else {
            //     $(".categoryTxt").append([
            //         $e2
            //     ]);
            // }
        }
    };
}
