
/**
 * 猴子翻页——通用的翻页工具
 bug：list翻页后有些功能失效
 * updateTime : 2012-3-18
 */
MonkeyModule('MonkeyPageLoader', {
    css : '#Monkey-PageLoader {\
                text-align : center;\
                margin-top : -15px;\
           }\
           #Monkey-PageLoader span{\
                border-radius : 5px;\
            margin-top : 2px;\
            color : #fff;\
            line-height : 20px;\
            width : 60%;\
            cursor : pointer;\
            display : inline-block;\
            background-color : #83BF73;\
         }\
         #Monkey-PageLoader span:hover {\
            background-color : #55BF73;\
         }',

    html : '<div id="Monkey-PageLoader">\
                <span monkey-action="MonkeyPageLoader" monkey-action-name="loadPage">加载下一页</span>\
                <div class="Monkey-Loading-stop" style="left:50px;top:-20px;"></div>\
            </div>',

    fit : function() {
        return false;  //暂时屏蔽翻页功能
        this.paginator = $('div.paginator');
        this.current = this.paginator.find('.thispage');
        this.next = this.current.next();
        return this.paginator.length > 0 && this.current.length > 0;
    },

    load : function() {
        this.render();
        body.bind('MonkeyPageLoader', $.proxy(this.loadPage, this));
        this.currentNum = +this.current.text();  //当前页码
        this.isWorked = false;  //该功能是否运行过
        //最大的页码
        ((this.maxNum = +this.paginator.find('> a').last().text()) > +this.currentNum || (this.maxNum = this.currentNum));
    },
    //翻页策略
    loadPolitic : function() {
        var politics = {
            //列表：豆列、书籍影音搜索结果
            'list' : {
                'content' : 'div.article',  //需要获取的内容
                'filter' : 'script, div.filters, div.paginator, div.col2_doc, span.pl, div.rec-sec',  //需要过滤的无用内容
                'method' : 'content.insertBefore(that.paginator)',  //使用eval运行这段代码将content加入到dom中，其中content变量名是固定的
                'finish' : function(root) {
                    //重新绑定事件，以下代码来源于http://img3.douban.com/js/packed_douban504578906.js，略有修改
                    var re = /a_(\w+)/;
                    var fns = {};
                    $(".j", root).each(function (i) {
                        var m = re.exec(this.className);
                        if (m) {
                            var actionName = m[1],
                                f = fns[actionName];
                            if (!f) {
                                f = eval("unsafeWindow.Douban.init_" + actionName);
                                fns[actionName] = f;
                            }
                            //简单判断元素是否绑定过事件，很不严谨，但在豆列页面是有效的。
                            f && f(this);
                        }
                    })
                }
            },
            //小组讨论列表
            'discussion' : {
                'content' : 'table.olt tbody tr:gt(0)',  //第一个tr是表格的表头
                'method' : 'content.appendTo($("table.olt tbody"))'
            },

            //小组话题
            'topic' : {
                'content' : 'ul.topic-reply li',
                'method' : '$("ul.topic-reply").append(content)'
            },

            //小组分类
            'category' : {
                'content' : 'div.indent div.indent',
                'filter' : 'div.paginator',
                'method' : 'content.children().insertBefore(that.parent)'
            },

            //友邻广播
            'update' : {
                'content' : 'div.stream-items',
                'method' : '$("div.stream-items").append(content.children())',
                'finish' : function(root) {
                    //TODO 尚未完成

                    //重新绑定事件，以下代码来源于http://img3.douban.com/js/packed_statuses3217430347.js
                    var a = $(".stream-items");
                    //log(a);
                    a.find(".mod").each(function (c, e) {
                        var d = $(this),
                            f = d.attr("data-status-id");
                        var b = new Status($(this), f);
                        b.init()
                    });
                    a.find(".btn[data-action-type=expend-all]").click(function (b) {
                        b.preventDefault();
                        $(this).parent().prevAll(".status-item").show().end().remove()
                    });
                    a.delegate(".video-overlay", "click", function (b) {
                        $(this).next(".video-object").show();
                        $(b.target).hide().prev().hide()
                    }).delegate(".video-object .back", "click", function (b) {
                        b.preventDefault();
                        $(this).parent().hide().prevAll().show()
                    }).delegate(".bd blockquote a, .comments-items a:not(.btn)", "click", function (h) {
                        var f = $(h.target).parents(".status-item");
                        var b = f.attr("data-sid");
                        var g = f.attr("data-action");
                        var d = f.attr("data-target-type");
                        var c = f.attr("data-object-kind");
                        moreurl(this, {
                            from: "nmbp-" + b,
                            action: g,
                            target_type: d,
                            object_kind: c
                        })
                    })
                }
            },

            //相册
            'photo' : {
                'content' : 'div.photolst',
                'method' : '$("div.photolst").append(content.children())'
            }
        };

        return politics[MonkeyBean.page.turnType];
    },

    render : function() {
        GM_addStyle(this.css);
        GM_addStyle(MonkeyBean.UI.css.loading);
        this.el = $(this.html);
        this.btn = this.el.find('span');
        this.el.insertAfter(this.paginator);
    },
    //是否为第一页
    isFirstPage : function() {
        return this.currentNum == 1;
    },
    //是否为最后一页
    isLastPage : function() {
        return this.currentNum == this.maxNum;
    },

    loadPage : function() {
        var that = this,
            url = that.next.attr('href'),
            politic = this.loadPolitic();

        //最后一页或没有翻页策略时返回
        if(this.isLastPage() || typeof politic === 'undefined' || this.isLoading) return false;

        $.trigger('loadingStart');  //显示loading效果
        this.isLoading = true;

        $.ajax({
            url : url,
            success : function(resp) {
                var tmpDiv = $('<div></div>'),
                    paginator,
                    content;
                tmpDiv.html(resp);
                content = tmpDiv.find(politic.content);
                paginator = tmpDiv.find('div.paginator');
                typeof politic.filter !== 'undefined' && content.find(politic.filter).replaceWith('');//过滤不必要的内容
                eval(politic.method);
                typeof politic.finish == 'function' && politic.finish(document);
                tmpDiv = null;

                //更新导航栏
                that.paginator.html(paginator.html());
                that.current = that.paginator.find('.thispage');
                that.currentNum = +that.current.text();
                that.next = that.current.next();

                that.isLastPage() && that.btn.text('已经是最后一页啦！');

                $.trigger('loadPage').//触发loadPage事件
                           trigger('loadingStop');  //停止loading效果

                that.isWorked = true;  //已经运行过翻页
                that.preLink = url;
                that.isLoading = false;
            },
            error : function() {
                //显示错误提示
                var pos = that.el.position();
                MonkeyBean.TM.get('tip').show('出错啦！', {
                    'left' : pos.left + 200,
                    'top' : pos.top - 120
                });
                $.trigger('loadingStop');  //停止loading效果
                that.isLoading = false;
            }
        });
    }
});
