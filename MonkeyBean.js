// ==UserScript==
// @name           MonkeyBean
// @namespace      sunnylost
// @version        0.22
// @include        http://*.douban.com/*
// @require http://userscript-autoupdate-helper.googlecode.com/svn/trunk/autoupdatehelper.js
/* @reason
 @end*/
// ==/UserScript==

typeof Updater != 'undefined' && new Updater({
    name: "MonkeyBean",
    id: "124760",
    version:"0.22"
}).check();


(function(window, $, undefined) {
    if(window !== window.top) return false;  //防止在iframe中执行

    var startTime = new Date();

    /*-------------------Begin--------------------*/
    var cName = 'monkey.username',
        cLocation = 'monkey.location',
        moduleNamePrefix = 'MonkeyBean.Module.',
        apiCount = 'MonkeyBean.API.count',
        apiLastTime = 'MonkeyBean.API.lastTime',
        interval = 60000,  //请求api的间隔
        limit = 10,       //在以上间隔内，最多请求次数，默认10次

        cHighLightColor = '#46A36A',  //高亮用户发言的颜色
        cBlankStr = '',                 //空白字符串
        ctor = function(){},
        viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName'],

        div = document.createElement('div'),

        hasOwn = Object.prototype.hasOwnProperty,

        mine = /\/mine/,
        people = /\/people\/(.*)\//,
        eventSplitter = /^(\S+)\s*(.*)$/, // from Backbone.js
        //豆瓣API
        api = {
            'people' : 'http://api.douban.com/people/{1}'  //用户信息
        };



    //-------------------------猴子工具箱----------------------------------
    var monkeyToolBox = {
        cookie : {
            get : function(name) {
                var start,
                    end,
                    len = document.cookie.length;
                if(len > 0) {
                    start = document.cookie.indexOf(name + '=');
                    if(start != -1) {
                        start = start + name.length + 1;
                        end = document.cookie.indexOf(';', start);
                        if(end == -1) end = len;
                        return decodeURI(document.cookie.substring(start, end).replace(/"/g, ''));
                    }
                }
                return '';
            }
        },
        //地址查询字符串搜索
        locationQuery : function() {
            if(location.search.length < 0) return {};

            var queryarr = location.search.substring(1).split('&'),
                len = queryarr.length,
                item,
                result = {};
            while(len) {
                item = queryarr[--len].split('=');
                result[decodeURIComponent(item[0])] = decodeURIComponent(item[1]);
            }
            return result;
        },

        xml : {
            parse : function(text) {
                var xmlparse = new DOMParser();
                this.xmldom = xmlparse.parseFromString(text, 'text/xml');
                return this;
            },

            tag : function(name, el) {
                el = el || this.xmldom;
                this.el = el.getElementsByTagName(name)[0];
                this.el && (this.el.data = this.attr('data'));
                return this.el;
            },

            attr : function(name) {
                return this.el.getAttribute(name);
            },

            tostring : function() {
                return this.el || {};
            }
        }
    };

    //shortcuts
    var xml = monkeyToolBox.xml,
        cookie = monkeyToolBox.cookie,
        query = monkeyToolBox.locationQuery;

    var MonkeyBean = {
        author : 'sunnylost',
        updateTime : '20120213',
        password : 'Ooo! Ooo! Aaa! Aaa! :(|)',

        path : location.hostname + location.pathname,

        //开启debug模式
        debugMode : true,

        log : function(msg) {
            MonkeyBean.debugMode && typeof console !== 'undefined' && console.log(msg);
        },

        //TODO,使用豆瓣API有限制，每个IP每分钟10次，如果加上key的话是每分钟40次，如果超过限制会被封IP，因此要记录调用API次数及其间隔。
        useAPI : function() {
            var count = this.get(apiCount),
                lastTime = this.get(apiLastTime);

            if(count === undefined && lastTime === undefined) {
                //第一次使用
                this.set(apiCount, 1);
                this.set(apiLastTime, new Date);
            } else {
                typeof +count === 'number' && this.set(apiCount, +count + 1);
            }
        },

        getUserInfo : function(nickName) {

        },

        get : function(key, defaultVal) {
            return GM_getValue(key, defaultVal);
        },

        set : function(key, value) {
            GM_setValue(key, value);
        },

        del : function(key) {
            GM_deletetValue(key);
        },
        //MonkeyBean初始化方法
        init : function() {
            //this.trigger('load');
            this.MonkeyModuleManager.turnOn();
        },

        //是否登录
        isLogin : function() {
            return (typeof this.login !== 'undefined' && this.login) || (this.login = !!this.getCk());
        },
        //TODO:获取用户ID，有问题
        userId : function() {
            var str = cookie.get('dbcl2');
            return str && str.split(':')[0];
        },

        getCk : function() {
            return this.ck || (this.ck = cookie.get('ck'));
        },

        MonkeyModuleManager : (function() {
            var moduleTree = {},  //模块树，所有模块都生长在树上。
                turnOn,
                register;

            register = function(moduleName, module) {
                moduleTree[moduleName] = module;
            };

            turnOn = function() {
                var m, tmpModule;
                //log(moduleTree);
                for(m in moduleTree) {
                    if(hasOwn.call(moduleTree, m)) {
                        tmpModule = moduleTree[m];
                         //log('------' + m + '----' + moduleTree[m].filter);
                        log(tmpModule.name + ' 加载~');
                        tmpModule.fit() && (tmpModule.el && tmpModule.el.length > 0) && tmpModule.load();
                    }
                }
            };

            return {
                register : register,
                turnOn : turnOn
            }
        })()
    };
    var log = MonkeyBean.log;

    log('---------' + MonkeyBean.userId());

    var cusEvents = {
        subscribers : {
        },

        bind : function(type, fn, context) {
            type = type || 'any';
            fn = $.isFunction(fn) ? fn : context[fn];

            if(typeof this.subscribers[type] === 'undefined') {
                this.subscribers[type] = [];
            }
            this.subscribers[type].push({
                fn : fn,
                context : context || this
            })
        },

        unbind : function(type, fn, context) {
            this.visitSubscribers('unbind', type, fn, context);
        },

        trigger : function(type, publication) {
            this.visitSubscribers('trigger', type, publication);
        },

        visitSubscribers : function(action, type, arg, context) {
            var pubtype = type || 'any',
                subscribers = this.subscribers[pubtype],
                i = 0,
                max = subscribers ? subscribers.length : 0;

            for(; i < max; i += 1) {
                if(action === 'trigger') {
                    subscribers[i].fn.call(subscribers[i].context, arg);
                } else {
                    if(subscribers[i].fn === arg && subscribers[i].context === context) {
                        subscribers.splice(i, 1);
                    }
                }
            }
        }
    };

    var MonkeyModule = function(name, method) {
        if(this.constructor != MonkeyModule) {
            return new MonkeyModule(name, method);
        }
        this.guid = guid++;
        this.name = name;
        $.extend(this, method);
        //this.on = MonkeyBean.get(moduleNamePrefix + name);  //是否启动
        this.on = true;
        this.init();
    };

    MonkeyModule.prototype = {
        constructor : MonkeyModule,

        init : function() {
            MonkeyBean.MonkeyModuleManager.register(this.name, this);
        },

        get : function(name) {
            return this.attr[name] || '';
        },

        set : function(key, value) {
            this.attr = this.attr || {};
            var attrs, attr;
            if($.isPlainObject(key) || key == null) {
                attrs = key;
            } else {
                attrs = {};
                attrs[key] = value;
            }
            for(attr in attrs) {
                this.attr[attr] = attrs[attr]
            }
            this.trigger('change');  //属性更改会触发change事件
        },

        load : function() {
            //log(this.name + ' 准备加载！');
        },
        //检测是否适用于当前页面
        fit : function() {
            return !$.isArray(this.filter) && (this.filter.test(MonkeyBean.path));
        },

        //一个简单的模板方法
        template : function(key, value) {
        },

        toString : function() {
            return 'This module\'s name is:' + this.name;
        }
    };

    $.extend(MonkeyBean, cusEvents);
    $.extend(MonkeyModule.prototype, cusEvents);

    /*********************************UI begin**************************************************************/
    /**
     * 提示便签
     */
    MonkeyModule('tip', {
        css : '#MonkeyUI-tip{background-color: #F9EDBE;border: 1px solid #F0C36D;-webkit-border-radius: 2px;-webkit-box-shadow: 0 2px 4px rgba(0,0,0,0.2);\
             border-radius: 2px;box-shadow: 0 2px 4px rgba(0,0,0,0.2);font-size: 13px;line-height: 18px;padding: 16px; position: absolute;\
             vertical-align: middle;width: 160px;z-index: 6000;border-image: initial;display:none;}\
             ._monkey_arrow_inner {border-top: 6px solid #FFFFFF;top: 43px; z-index: 5;}\
             ._monkey_arrow_outer {border-top: 6px solid #666666;z-index: 4;}',

        html : '<div id="MonkeyUI-tip">\
                    <p></p>\
                    <a href="javascript:void(0)" style="position:relative;left:45%;" action-type="close" >关闭</a>\
                </div>',

        filter : /.*/,

        load : function() {
            this.render();
        },

        render : function() {
            var that = this;
            this.el = $(this.html);
            document.body.appendChild(this.el[0]);
            GM_addStyle(this.css);

            this.el.delegate('a', 'click', function() {
                that.hide();
            });
        },

        show : function(msg, pos) {
            log(this.el.find('p'));
            this.el.find('p').html(msg);
            this.el.css({
                'left' : pos.left + 'px',
                'top' : pos.top + 'px'
            })
            this.el.fadeIn();
        },

        hide : function() {
            this.el.fadeOut();
        }

    })
    /*********************************UI end**************************************************************/

    /*********************************Common Function****************************************************************/
    var monkeyCommentToolbox = {
        //快捷回复
        reply : function(data, el) {
            log('reply=' + data);
        },
        //引用用户发言
        quote : function(data) {
            log('quote');
        },
        //只看该用户发言
        only : function(data) {
            var items = this.cache || (this.cache = $('[monkey_data]')),
                len = items.length,
                i = 0;
            log(len);
            if(len > 0) {
                while(len--) {
                    log(items[len]);
                    items[len].attr('monkey_data') != data && items[len].hide();
                }
            }
        },
        //高亮该用户所有发言
        highlight : function(data) {
            var items = $('[monkey_data=' + data + ']'),
                len = items.length,
                i = 0;
            //这里的this是monkeyComment.toolRel，但是不影响操作~
            this.clicked = !this.clicked;
            log(len);
            if(len > 0) {
                if(this.clicked) {
                    while(len--) {
                        css(items[len], 'backgroundColor', cHighLightColor);
                    }
                } else {
                    while(len--) {
                        css(items[len], 'backgroundColor', cBlankStr);
                    }
                }
            }
        },
        //忽略该用户所有发言
        ignore : function(data) {
            var items = nuts.queryAll('[monkey_data=' + data + ']'),
                len = items.length,
                i = 0;
            if(len > 0) {
                while(len--) {
                    hide(items[len]);
                }
            }
        },
        //还原为原始状态
        reset : function(data) {
            var items = this.cache || nuts.queryAll('[monkey_data]'),
                len = items.length,
                i = 0;
            this.clicked = false;  //"高亮"里需要这个参数
            if(len > 0) {
                while(len--) {
                    show(items[len]);
                    css(items[len], 'backgroundColor', cBlankStr);
                }
            }
        }
    };

    /*********************************Module begin**************************************************************/
    /**
     * 天气模块
     * updateTime : 2012-2-19
     */
    MonkeyModule('MonkeyWeather', {
        attr : {
            url : 'http://www.google.com/ig/api?weather={1}&hl=zh-cn'
        },

        filter : /www.douban.com\/(mine|(people\/.+\/)$)/,

        css : '.monkeybean-weather{position:relative;top:10px;}',

        html : '<div style="float:left;margin-right:10px;">\
                    <img height="40" width="40" alt="{1}" src="http://g0.gstatic.com{2}">\
                    <br>\
                </div>\
                <span><strong>{3}</strong></span>\
                <span>{4}℃</span>\
                <div style="float:">当前：&nbsp;{1}\
                </div>',

        el : $('#profile'),

        load : function() {
            //console.dir(this);
            this.bind('change', this.render, this);
            this.fetch();
        },

        fetch : function() {
            var place = $('.user-info > a'),
                a,
                that = this;
            if(!place || !$.trim(place.text())) return;
            a = place.attr('href').match(/http:\/\/(.*)\.douban\.com/);
            place = place.text();

            GM_xmlhttpRequest({
                method : 'GET',
                url : this.get('url').replace('{1}', RegExp.$1),
                headers :  {
                    Accept: 'text/xml'
                },
                onload : function(resp) {
                    xml.parse(resp.responseText);
                    var current = xml.tag('current_conditions');
                    that.set({
                        condition : xml.tag('condition', current).data,
                        icon : xml.tag('icon', current).data,
                        temp : xml.tag('temp_c', current).data,
                        place : place
                    });
                }
            });
        },

        render : function() {
            if(!this.el) return;
            var container = div.cloneNode(true);
            container.className = 'monkeybean-weather';
            container.innerHTML = this.html.replace(/\{1\}/g, this.get('condition'))
                                            .replace('{2}', this.get('icon'))
                                            .replace('{3}', this.get('place'))
                                            .replace('{4}', this.get('temp'));
            $(container).insertBefore(this.el);
        }
    });

    /**
     * 留言板，增加回复功能
     * 适用页面：个人主页与留言板页
     */
    //TODO:尚未完成，豆瓣助手在firefox也无法提交到别人的留言板，这个问题推迟解决
    /**
    MonkeyModule('MonkeyMessageBoard', {
        //TODO：<span class="gact">
        html : {
            'doumail' : '&nbsp; &nbsp; <a href="/doumail/write?to={1}">回豆邮</a>',
            'reply' : '&nbsp; &nbsp; <a href="JavaScript:void(0);" monkey-data="{1}[-]{2}" title="回复到对方留言板">回复</a>',
            'form' : '<form style="margin-bottom:12px" id="fboard" method="post" name="bpform">\
                            <div style="display:none;"><input type="hidden" value="' + MonkeyBean.getCk() + '" name="ck"></div>\
                            <textarea style="width:97%;height:50px;margin-bottom:5px" name="bp_text"></textarea>\
                            <input type="submit" value=" 留言 " name="bp_submit">\
                            <a href="javascript:void(0);" id="monkey_resetBtn" style="float:right;display:none;">点击恢复原状</a>\
                        </form>'
        },

        filter : /www.douban.com\/(people\/.+\/)(board)$/,

        el : $('ul.mbt'),

        load : function() {
            this.render();
        },

        render : function() {
            this.form = $(this.html['form']);
            this.form.insertBefore(this.el);
            this.resetBtn = $('#monkey_resetBtn');
            this.resetBtn.bind('click', $.proxy(this.reset, this));
            this.bind('reply', this.reply, this);

            if(!this.el || (this.el = this.el.find('li.mbtrdot')).length < 1) return;
            var len = this.el.length,
                i = 0,
                that = this,
                id,
                nickName,
                tmp;
            for(; i<len; i++) {
                tmp = this.el[i];
                var tempVar = tmp.getElementsByTagName('a')[0];
                nickName = tempVar.innerHTML;
                tempVar.href.match(people);
                id = RegExp.$1;
                if(id != 'sunnylost') {
                    tmp = tmp.getElementsByTagName('span');
                    if(tmp.length == 1) {
                        tmp[0].parentNode.innerHTML += '<br/><br/><span class="gact">' + (this.html['doumail'] + this.html['reply']).replace(/\{1\}/g, id).replace('{2}', nickName) + '</span>';
                    } else if(tmp.length == 2) {
                        tmp[1].innerHTML += this.html['reply'].replace(/\{1\}/g, id).replace('{2}', nickName);
                    }

                }
            }
            this.el.delegate('a[monkey-data]', 'click', function() {
                that.trigger('reply', $(this).attr('monkey-data'));
            });
        },

        //TODO:点击回复按钮时，应该可以回复到对方留言板
        reply : function(userMsg) {
            var tmpArr = userMsg.split('[-]');
            this.form.find('[type="submit"]').val('回复到的' + tmpArr[1] + '的留言板');
            this.form.attr('action', 'http://www.douban.com/people/' + tmpArr[0] + '/board');
            this.resetBtn.css('display', 'block');
        },

        reset : function() {
            this.form.find('[type="submit"]').val('回复');
            this.form.attr('action', '');
            this.resetBtn.css('display', 'none');
        }
    });
     */

    //TODO 猴子导航栏——用于显示顶部导航栏的二级菜单
    /**
    MonkeyModule('MonkeyNavigator', {
        css : '#_monkey_secondNav{display:block;width:600px;} #_monkey_secondNav ul{position:relative;z-index:5;} #_monkey_secondNav ul li{float:none;}',
        load : function() {
                return false;
            //log(this.name + ' 准备加载！');

            //在未登录的状态下，首页不显示导航栏
            if(window.location.href == monkeyMirror.doubanMainPage && !nuts.isLogin()) return false;

            GM_addStyle(this.css);

            var nav = nuts.query('.top-nav-items'),
                navs = nuts.queryAll('li', nav),
                ul = nuts.query('ul', nav),
                li = document.createElement('li'),
                i = 0,
                len = navs.length,
                tmpDiv,
                content;

            if(len < 1) return;

            //如果用户名已登录，则显示"我的豆瓣"
            if(nuts.isLogin()) {
                li.innerHTML = monkeyMirror.myDouban;
                ul.insertBefore(li, ul.children[0]);
            }

            tmpDiv = div.cloneNode(true);
            tmpDiv.id = '_monkey_secondNav';
            tmpDiv.innerHTML = monkeyMirror.secondNav.replace('{1}', userLocation || 'www');
            nav.appendChild(tmpDiv);

            delegate(nuts.query('ul', nav), 'a', 'mouseover', function(e) {
                if(trim(this.textContent) == '更多') return;  //忽略"更多"的鼠标事件
                var current = nuts.query('#' + this.textContent);
                //if(this.parentNode.className.indexOf('on') != -1) return;  //不会显示当前栏目的第二级菜单
                show(current, 'inline-block');
                if(monkeyNav.last != current) {
                    hide(monkeyNav.last);
                    monkeyNav.last = current;
                }
            })

            content = nuts.query('#content');
            if(content) {
                content.addEventListener('mouseover', function() {
                    hide(monkeyNav.last);
                });
            }
        }
    });
*/

    /**
     * 楼主工具条
     * updateTime：2012-2-19
     */
    MonkeyModule('MonkeyPosterToolbar', {
        html : '<span data="{1}" class="fleft">\
                      &gt;&nbsp;<a href="javascript:void(0);" monkey-action="only" rel="nofollow" title="只看楼主的发言" style="display: inline;margin-left:0;">只看</a>\
                      &gt;&nbsp;<a href="javascript:void(0);" monkey-action="highlight" rel="nofollow" title="高亮楼主的所有发言" style="display: inline;margin-left:0;">高亮</a>\
                      &gt;&nbsp;<a href="javascript:void(0);" monkey-action="ignore" rel="nofollow" title="忽略楼主的所有发言" style="display: inline;margin-left:0;">忽略</a>\
                      &gt;&nbsp;<a href="javascript:void(0);" monkey-action="reset" rel="nofollow" title="还原到原始状态" style="display: inline;margin-left:0;">还原</a>\
                  </span>',

        filter : /www.douban.com\/group\/topic\/\d+/,

        fit : function() {
            //.test(MonkeyBean.path)
        },

        el : [$('div.topic-doc a')[0], $('div.topic-opt')],  //第一个包含了楼主的ID，第二个是插入工具条的位置

        load : function() {
            var posterId = this.el[0].href.replace('http://www.douban.com/people/', '').split('/')[0];
            log('楼主ID=' + posterId);
            this.set('posterId', posterId);
            this.render();
        },

        render : function() {
            this.el[1] && (this.el[1].append(this.html.replace('{1}', this.get('posterId'))));
            log(this.el[1]);
        }
    });

    /**
     * 猴子回复增强模块，适用于小组回复，书籍影视评论等，功能包括楼层数显示。
     * updateTime : 2012-2-19
     */
    MonkeyModule('MonkeyComment', {
        filter : /www.douban.com\/group\/topic\/\d+/,

        css : '.Monkey-floor{ float:right; margin-right:5px;}',

        el : [$('.topic-reply'), $('.paginator .thispage')],  //第一个为小组回复，最后一个是当前页数

        load : function() {
            //楼层数。一般来说，多页的链接后面都有一个start参数，表示这页的楼层是从多少开始的。但这个参数并不可靠，考虑分析class为paginator的DIV，里面的a标签更可靠些。
            //小组的回复区域：class为topic-reply的UL，影视书籍的回复：ID为comments的DIV
            //分页栏：class为paginator的DIV，当前页码：class为thispage的span
            var currentPage = this.el[1];
            this.set({
                'start' : +(query()['start']) || (currentPage && typeof !isNaN(+(currentPage.textContent)) && 100 * (+(currentPage.textContent) - 1)) || 0
            })

            var monkeySelector = {
                'group' : {  //小组
                    'posterUrl' : 'div.topic-doc a',   //楼主的ID藏在这个URL里
                    'comment' : '.topic-reply',        //留言外层元素
                    'commentItems' : 'li'
                },

                'entertain' : {  //书籍影音
                    'posterUrl' : '',
                    'comment' : '#comments',
                    'commentItems' : 'span.wrap h3'
                },

                'note' : {      //日志
                    'commentItems' : '.comment-item'
                }
            };


            var reply = nuts.query('.topic-reply'),
                comments = nuts.query('#comments'),
                fragment = document.createDocumentFragment(),
                items,
                tmp,
                len,
                breaks,
                userId,
                type,
                i = 0;

            pageParam.floorStart = start;
            type = (reply && 'group') || (comments && 'entertain');
            //TODO：以下内容待重构
            if(reply) {
                pageParam.floor = items = nuts.queryAll(monkeySelector[type]['commentItems'], reply);
                len = items.length;
                if(len < 1) return;

                this.posterToolbar(type);

                for(; i<len; i++) {
                    tmp = nuts.query('h4', items[i]);
                    tmp.innerHTML += '<span class="_monkey_floor">' + (start + i + 1) + '楼</span>';
                    userId = nuts.query('a', tmp).href.replace('http://www.douban.com/people/', '').split('/')[0];
                    items[i].setAttribute('monkey_data', userId);
                    nuts.query('div.operation_div', items[i]).innerHTML += monkeyMirror.commentToolbar.replace('{1}', userId);
                }
            } else if(comments) {
                pageParam.floor = items = nuts.queryAll(monkeySelector[type]['commentItems'], comments);  //书籍影音页面
                if(items.length > 0) {
                    breaks = nuts.queryAll('br', comments);
                    len = items.length;
                    if(len < 1) return;
                    for(; i<10; i++) {
                        userId = nuts.query('a', items[i]).textContent;
                        fragment.innerHTML = monkeyMirror.commentToolbar.replace('{1}', userId);
                        //log(fragment.innerHTML);
                        items[i].setAttribute('monkey_data', userId);
                        items[i].innerHTML += '<span class="_monkey_floor">' + (start + i + 1) + '楼</span>';
                        breaks[i].parentNode.insertBefore(fragment, breaks[i]);
                    }
                } else {
                    //日志页面留言
                    pageParam.floor = items = nuts.queryAll(monkeySelector[type]['commentItems']);
                    len = items.length;
                    if(len < 1) return;

                    nuts.query('div.note-ft').innerHTML += monkeyMirror.postStarterToolbar.replace('{1}', nuts.query('#db-usr-profile a').href.replace('http://www.douban.com/people/', '').split('/')[0]);

                    for(; i<len; i++) {
                        tmp = nuts.query('div.author', items[i]);
                        userId = nuts.query('a', tmp).textContent;
                        items[i].setAttribute('monkey_data', userId);
                        tmp.innerHTML += '<span class="_monkey_floor">' + (start + i + 1) + '楼</span>';
                        nuts.query('div.group_banned', items[i]).innerHTML += monkeyMirror.commentToolbar.replace('{1}', userId);
                    }
                }

            }
            //注册工具事件
            this.initToolbarEvent();
        },

        render : function() {
            GM_addStyle(this.css);

            //这里注册的事件同样适用于楼主工具条。
            var that = this;
            $(document.body).delegate('a[monkey-action]', 'click', function() {
                var actionName = this.getAttribute('monkey-action');
                log(this.parentNode.getAttribute('data'));
                actionName && monkeyCommentToolbox[actionName] && monkeyCommentToolbox[actionName](this.parentNode.getAttribute('data'), this);
            })
        }
    });

/*********************************Module end**************************************************************/

    var userName = MonkeyBean.get(cName, ''),
        userLocation = MonkeyBean.get(cLocation, ''),
        guid = 0;
    log('test debug Mode');
//log(userName);
//log(userLocation);

//GM_deleteValue(cName);
    log('username=' + userName);
    //获得用户ID与地址
    (function () {
        if (!userName) {
            GM_xmlhttpRequest({
                method:'GET',
                url:'http://www.douban.com/mine',
                onload:function (resp) {
                    //没有cookie~会自动跳转到登录页面
                    if (location.href.indexOf('www.douban.com/accounts/login') != -1) return;
                    //响应头部信息中，包含了最终的url，其中就有用户名
                    var arr = resp.finalUrl.split('/');
                    userName = arr[arr.length - 2];
                    MonkeyBean.set(cName, userName);
                    log('2222' + cName + '=' + MonkeyBean.get(cName, ''));
                }
            })
        }

        if (!userLocation) {
            GM_xmlhttpRequest({
                method:'GET',
                url:'http://www.douban.com/location',
                onload:function (resp) {
                    if (location.href.indexOf('www.douban.com/accounts/login') != -1) return;
                    //响应头部信息中，包含了最终的url，其中就有地址
                    var arr = trim(resp.finalUrl).split('.');
                    userLocation = arr[0].slice(7);
                    MonkeyBean.set(cLocation, userLocation);
                }
            })
        }
    })()

    //猴镜——模版
    var monkeyMirror = {
        'doubanMainPage' : 'http://www.douban.com/',

        'secondNav' : '<ul id="我的豆瓣" style="display:none;">\
                        <li><a href="http://www.douban.com/people/' + userName + '/notes">日记</a></li>\
                        <li><a href="http://www.douban.com/people/' + userName + '/photos">相册</a></li>\
                        <li><a href="http://www.douban.com/mine/discussions">讨论</a></li>\
                        <li><a href="http://www.douban.com/people/' + userName + '/recs">推荐</a></li>\
                        <li><a href="http://www.douban.com/people/' + userName + '/favorites">喜欢</a></li>\
                        <li><a href="http://www.douban.com/people/' + userName + '/miniblogs">广播</a></li>\
                        <li><a href="http://www.douban.com/people/' + userName + '/offers">二手</a></li>\
                        <li><a href="http://www.douban.com/mine/doulists">豆列</a></li>\
                        <li><a href="http://www.douban.com/people/' + userName + '/board">留言板</a></li>\
                        <li><a href="http://www.douban.com/settings/">设置</a></li>\
                    </ul>\
                    <ul id="豆瓣社区" style="display:none;">\
                        <li><a href="http://www.douban.com/mine/">我的豆瓣</a></li>\
                        <li><a href="http://www.douban.com/group/mine">小组分类</a></li>\
                        <li><a href="http://www.douban.com/group/">我的小组</a></li>\
                        <li><a href="http://www.douban.com/group/my_topics">我发起的话题</a></li>\
                        <li><a href="http://www.douban.com/group/my_replied_topics">我回应的话题</a></li>\
                        <li><a href="http://www.douban.com/event/">同城</a></li>\
                        <li><a href="http://www.douban.com/explore/">浏览发现</a></li>\
                    </ul>\
                    <ul id="豆瓣读书" style="display:none;">\
                        <li>　　　　　　</li>\
                        <li><a href="http://book.douban.com/mine">我读</a></li>\
                        <li><a href="http://book.douban.com/recommended">豆瓣猜</a></li>\
                        <li><a href="http://book.douban.com/chart">排行榜</a></li>\
                        <li><a href="http://book.douban.com/tag/">分类浏览</a></li>\
                        <li><a href="http://book.douban.com/review/best/">书评</a></li>\
                        <li><a href="http://book.douban.com/cart">购书单</a></li>\
                    </ul>\
                    <ul id="豆瓣电影" style="display:none;">\
                        <li>　　　　　　　　  </li>\
                        <li><a href="http://movie.douban.com/tv">电视剧</a></li>\
                        <li><a href="http://movie.douban.com/mine">我看</a></li>\
                        <li><a href="http://movie.douban.com/chart">排行榜</a></li>\
                        <li><a href="http://movie.douban.com/tag/">分类浏览</a></li>\
                        <li><a href="http://movie.douban.com/review/best/">热评</a></li>\
                    </ul>\
                    <ul id="豆瓣音乐" style="display:none;">\
                        <li>　　　　　　　　　　　</li>\
                        <li><a href="http://music.douban.com/mine">我的音乐</a></li>\
                        <li><a href="http://music.douban.com/artists/">音乐人</a></li>\
                        <li><a href="http://music.douban.com/chart">排行榜</a></li>\
                        <li><a href="http://music.douban.com/tag/">分类浏览</a></li>\
                        <li><a target="blank" href="http://douban.fm/">豆瓣电台</a></li>\
                    </ul>\
                    <ul id="豆瓣同城" style="display:none;">\
                        <li>　　　　　　　              　　    　　　　　　　</li>\
                        <li><a href="http://www.douban.com/events">同城活动</a></li>\
                        <li><a href="http://' + GM_getValue('monkey.location') + '.douban.com/hosts">主办方</a></li>\
                        <li><a href="http://www.douban.com/location/mine">我的同城</a></li>\
                    </ul>\
                    <ul id="九点" style="display:none;">\
                        <li>　　　　　　　　　　　                 </li>\
                        <li><a href="http://9.douban.com/channel/culture">文化</a></li>\
                        <li><a href="http://9.douban.com/channel/life">生活</a></li>\
                        <li><a href="http://9.douban.com/channel/fun">趣味</a></li>\
                        <li><a href="http://9.douban.com/channel/technology">科技</a></li>\
                        <li><a href="http://9.douban.com/reader/">我的订阅</a></li>\
                    </ul>\
                    <ul id="豆瓣FM" style="display:none;">\
                        <li>　　　　　　　　　　　　    　　　    　   　　　　　</li>\
                        <li><a href="http://douban.fm/mine" target="_blank">我的电台</a></li>\
                        <li><a href="http://douban.fm/app" target="_blank">应用下载</a></li>\
                    </ul>',

        'myDouban' : '<a href="http://www.douban.com/people/' + userName + '/">我的豆瓣</a>',
        //留言工具条
        'commentToolbar' : '<span data="{1}" >\
                              <span>|</span>\
                              <a href="javascript:void(0);" class="monkey-reply" rel="nofollow" title="回复该用户发言" style="display: inline;margin-left:0;">回</a>\
                              <a href="javascript:void(0);" class="monkey-quote" rel="nofollow" title="引用该用户发言" style="display: inline;margin-left:0;">引</a>\
                              <a href="javascript:void(0);" class="monkey-only" rel="nofollow" title="只看该用户的发言" style="display: inline;margin-left:0;">只</a>\
                              <a href="javascript:void(0);" class="monkey-highlight" rel="nofollow" title="高亮该用户的所有发言" style="display: inline;margin-left:0;">亮</a>\
                              <a href="javascript:void(0);" class="monkey-ignore" rel="nofollow" title="忽略该用户的所有发言" style="display: inline;margin-left:0;">略</a>\
                              <a href="javascript:void(0);" class="monkey-reset" rel="nofollow" title="还原到原始状态" style="display: inline;margin-left:0;">原</a>\
                          </span>',

        'replyBox' : '<form name="comment_form" method="post" action="add_comment">\
                        <div style="display: none;">\
                            <input name="ck" value="15oo" type="hidden">\
                        </div>\
                        <textarea id="re_text" name="rv_comment" rows="20" style="font-size:12px;font-family:Arial;width:310px;border:0px;border-bottom:1px solid #ccc;">\
                        </textarea>\
                        <br>\
                    </form>',


        //浮动工具条
        'floatToolbar' : '<div>\
                                <label for="monkey_elevator">跳转楼层</label>\
                                <input type="text" name="monkey_elevator">\
                            </div>',

        'searchBar' : '<div id="db_scr_btm" title="双击：立即搜索；单击：选择搜索范围">\
                            <div class="db_scr_btm">综合</div>\
                            <div class="db_scr_btm">社区</div>\
                            <div class="db_scr_btm">读书</div>\
                            <div class="db_scr_btm">电影</div>\
                            <div class="db_scr_btm">音乐</div>\
                            <input type="hidden" value="" name="cat">\
                        </div>'
    };
/**
    //猴子浮动工具条，整合多个工具，例如楼层跳转等
    var monkeyFloatToolbar = new MonkeyModule('floatToolbar', {
        css : '',
        load : function() {
            GM_addStyle(this.css);

            var toolbar = div.cloneNode(true);
            toolbar.id = 'monkey_float_toolbar';
        },
        /**
         * 电梯，跳转到相应楼层
         * @param num 楼层数
         *
         * input 设置只能输入数字
         * 楼层数在其他页？
         */
    /**
        elevator : (function() {
            //以下代码只适用于没有经过翻页的页面
            var to, first, last;

            to = function(num) {
                var floor = pageParam.floor,
                    start = pageParam.floorStart;
                if(!floor || num <= start) return;
                num = num - start;
                floor[num] && floor[num].scrollIntoView();
            };

            first = function() {
                to(pageParam.floorStart + 1);
            };

            last = function() {
                to(pageParam.floor.length + pageParam.floorStart);
            };


            return {
                to : to,
                first : first,
                last : last
            }
        })()
    });

    /**
    //增强搜索栏——代码来源于豆瓣助手
    var monkeySearchBar = new MonkeyModule('search', {
        css : '.db_scr_btm{background:#E9F4E9;color:#0C7823;cursor:pointer;display:none;float:left;text-align:center;position:relative;width:19%;border-left:1px solid #E9F4E9;border-right:1px solid #E9F4E9;} .db_scr_btm:hover{position:relative;top:-1px;border-bottom:1px solid #a6d098;border-left:1px solid #a6d098;border-right:1px solid #a6d098;background:#fff;} .nav-srh:hover .db_scr_btm{display:block;}',
        load : function() {
            var form = nuts.query('form[name=ssform]'),
                spans = nuts.queryAll('span', form),
                cat;
            if(spans && spans.length > 1) {
                GM_addStyle(this.css);
                spans[1].innerHTML += monkeyMirror.searchBar;
                cat = nuts.query('[name=cat]', spans[1]);

                nuts.query('#db_scr_btm').addEventListener('click', function(e){
                    if(!e.target.id){
                        css(nuts.query('.db_scr_btm'), 'cssText', '');
                        e.target.style.cssText = 'position:relative;top:-1px;border-bottom:1px solid #a6d098;border-left:1px solid #a6d098;border-right:1px solid #a6d098;background:#fff;';
                        var n = e.target.innerHTML;
                        n == '综合' && (form.action = 'http://www.douban.com/subject_search') && (cat.value = '');
                        n == '社区' && (form.action = 'http://www.douban.com/search') && (cat.value = '');
                        n == '读书' && (form.action = 'http://book.douban.com/subject_search') && (cat.value = '1001');
                        n == '电影' && (form.action = 'http://movie.douban.com/subject_search') && (cat.value = '1002');
                        n == '音乐' && (form.action = 'http://music.douban.com/subject_search') && (cat.value = '1003');
                    }
                }, false);
                nuts.query('#db_scr_btm').addEventListener('dblclick', function(e){
                    if(!e.target.id){
                        form.submit();
                    }
                }, false);
            }
        }
    });
*/
    MonkeyBean.init();

    log(((new Date()) - startTime)/1000 + '秒');
})(window, unsafeWindow.$)