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


(function(window, $) {
    if(window !== window.top) return false;  //防止在iframe中执行

    var startTime = new Date();

    /*-------------------Begin--------------------*/
    var cName = 'monkey.username',
        cLocation = 'monkey.location',
        cHighLightColor = '#46A36A',  //高亮用户发言的颜色
        cBlankStr = '',                 //空白字符串
        ctor = function(){},

        div = document.createElement('div'),

        hasOwn = Object.prototype.hasOwnProperty,

        mine = /\/mine/,
        people = /\/people\/*\//;

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

        get : function(key, defaultVal) {
            GM_getValue(key, defaultVal);
        },

        set : function(key, value) {
            GM_setValue(key, value);
        },

        del : function(key) {
            GM_deletetValue(key);
        },

        //是否登录
        isLogin : function() {
            return (typeof this.login !== 'undefined' && this.login) || (this.login = !!cookie.get('ck'));
        },

        MonkeyModuleManager : (function() {
            var moduleTree = {},  //模块树，所有模块都生长在树上。
                turnOn,
                register;

            register = function(moduleName, module) {
                moduleTree[moduleName] = module;
            };

            turnOn = function() {
                var m;
                log(moduleTree);
                for(m in moduleTree) {
                    log('------' + moduleTree[m].filter.test(MonkeyBean.path));
                    if(hasOwn.call(moduleTree, m)) {
                        //MonkeyBean.get('MonkeyBean.' + m, false) 配置
                        moduleTree[m].filter.test(MonkeyBean.path) && moduleTree[m].load();
                    }
                }
            };

            return {
                register : register,
                turnOn : turnOn
            }
        })()
    };

    //-------------------------猴子工具箱----------------------------------
        var monkeyToolBox = {
            //事件代理
            delegate : function(parentel, child, eventtype, handler) {
                parentel.addEventListener(eventtype, function(e) {
                    if(e.target.tagName.toLowerCase() == child.toLowerCase()) {
                        handler.call(e.target, e);
                    }
                })
            },

            cookie : {
                get : function(name) {
                    if(document.cookie.length > 0) {
                        var start = document.cookie.indexOf(trim(name) + '='),
                            end;
                        if(start != -1) {
                            start = start + name.length + 1;
                            end = document.cookie.indexOf(';', start);
                            if(end == -1) end = document.cookie.length;
                            return decodeURI(document.cookie.substring(start, end));
                        }
                    }
                    return '';
                }
            },

            css : function(el, attribute, value) {
                if(typeof value != 'undefined') {
                    el.style[attribute] = value;
                }
                return el.style[attribute];
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
            },

            toggle : function(el, value) {
                if(!el) return;
                if(el.style.display != 'none') {
                    monkeytoolbox.hide(el);
                } else {
                    monkeytoolbox.show(el, value);
                }
            },

            show : function(el, value) {
                el && (el.style.display = value || 'block');
            },

            hide : function(el) {
                el && (el.style.display = 'none');
            },

            trim : function(s) {
                return (s + '').trim();
            },

            position : function(el) {
                var rect = el.getBoundingClientRect();
                return {
                    'left' : rect.left + window.scrollX,
                    'top' : rect.top + window.scrollY
                }
            }
        };

    //shortcuts
        var xml = monkeyToolBox.xml,
            cookie = monkeyToolBox.cookie,
            css = monkeyToolBox.css,
            query = monkeyToolBox.locationQuery,
            delegate = monkeyToolBox.delegate,
            show = monkeyToolBox.show,
            hide = monkeyToolBox.hide,
            toggle = monkeyToolBox.toggle,
            trim = monkeyToolBox.trim,
            position = monkeyToolBox.position,
            log = MonkeyBean.log;

    //猴骨~MVC~模仿backbone,http://documentcloud.github.com/backbone/
    var MonkeyBone = {
        Event : {
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
        },

        Model : function(attributes, options) {
            var defaults = this.defaults;
            attributes || (attributes = {});
            if(defaults) {
                attributes = $.extend({}, defaults, attributes);
            }
            log('before');
            log(attributes);

            this.attributes = attributes;
            this.set(attributes);
            log('Model initialize');
            log(this);
            this.initialize.apply(this, arguments);
        },

        View : function(options) {
            log(options);
            this.initialize.apply(this, arguments);
        }
    };

    $.extend(MonkeyBone.Model.prototype, MonkeyBone.Event, {
        initialize : function() {
            return this;
        },
        // get Attribute from attributes
        get : function(attr) {
            return this.attributes[attr] || {};
        },

        set : function(key, value) {
            var attrs, attr, val;
            if($.isPlainObject(key) || key == null) {
                attrs = key;
            } else {
                attrs = {};
                attrs[key] = value;
            }
            for(attr in attrs) {
                this.attributes[attr] = attrs[attr]
            }
            var alreadySetting = this._setting;
            this._setting = true;
            log('isChanged ? ' + alreadySetting);
            if(alreadySetting) {
                this.trigger('change');
                this._setting = false;
            }
            return this;
        }
    });

    $.extend(MonkeyBone.View.prototype, MonkeyBone.Event, {
        render : function() {},
        initialize : function() {
            return this;
        }
    });

    // this method is from Backbone.js
    var inherits = function(parent, protoProps, staticProps) {
        var child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent's constructor.
        if (protoProps && protoProps.hasOwnProperty('constructor')) {
            child = protoProps.constructor;
        } else {
            child = function(){ parent.apply(this, arguments); };
        }

        // Inherit class (static) properties from parent.
        $.extend(child, parent);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) $.extend(child.prototype, protoProps);

        // Add static properties to the constructor function, if supplied.
        if (staticProps) $.extend(child, staticProps);

        // Correctly set child's `prototype.constructor`.
        child.prototype.constructor = child;

        // Set a convenience property in case the parent's prototype is needed later.
        child.__super__ = parent.prototype;

        return child;
    };

    var extend = function (protoProps, classProps) {
        var child = inherits(this, protoProps, classProps);
        child.extend = this.extend;
        return child;
    };

    // Set up inheritance for the model, collection, and view.
    MonkeyBone.Model.extend = MonkeyBone.View.extend = extend;

    MonkeyBean.MonkeyModuleManager.register('MonkeyWeather', function() {
        var monkeyWeatherModel = MonkeyBone.Model.extend({
            defaults : {
                filter : /www.douban.com\/(mine|(people\/.+\/)$)/,
                url : 'http://www.google.com/ig/api?weather={1}&hl=zh-cn',
                condition : '',
                icon : '',
                place : '',
                temp : ''
            },

            initialize : function() {
                log('weather initialize');
                this.fetch();
            },

            fetch : function() {
                var place = $('.user-info > a'),
                    a,
                    that = this;
                log('-----------');
                if(!place || !$.trim(place.text())) return;
                a = place.attr('href').match(/http:\/\/(.*)\.douban\.com/);
                place = place.text();
                log('aaaaaa---' + RegExp.$1);

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
            }
        });

        var monkeyWeahterView = MonkeyBone.View.extend({
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

            initialize : function() {
                var model = new monkeyWeatherModel();
                model.bind('change', this.render, this);
                this.model = model;
            },

            render : function() {
                if(!this.el) return;
                var container = div.cloneNode(true);
                container.className = 'monkeybean-weather';
                log(this.model);
                container.innerHTML = this.html.replace(/\{1\}/g, this.model.get('condition'))
                                                .replace('{2}', this.model.get('icon'))
                                                .replace('{3}', this.model.get('place'))
                                                .replace('{4}', this.model.get('temp'));
                $(container).insertBefore(this.el);
            }
        });

        return {
            model : monkeyWeatherModel,
            view : monkeyWeahterView,
            filter : /www.douban.com\/(mine|(people\/.+\/)$)/,
            load : function() {
                new monkeyWeahterView();
            }
        }
    }());



    var userName = MonkeyBean.get(cName, ''),
        userLocation = MonkeyBean.get(cLocation, ''),
        guid = 0;
    log('test debug Mode');
//log(userName);
//log(userLocation);

//GM_deleteValue(cName);

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
                    GM_setValue(cName, userName);
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
                    GM_setValue(cLocation, userLocation);
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

        'weather' : '<div style="float:left;margin-right:10px;">\
                    <img height="40" width="40" alt="{1}" src="http://g0.gstatic.com{2}">\
                    <br>\
                </div>\
                <span><strong>{3}</strong></span>\
                <span>{4}℃</span>\
                <div style="float:">当前：&nbsp;{1}\
                </div>',
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
        //楼主工具条
        'postStarterToolbar' : '<span data="{1}" class="fleft">\
                                  &gt;&nbsp;<a href="javascript:void(0);" class="monkey-only" rel="nofollow" title="只看楼主的发言" style="display: inline;margin-left:0;">只看</a>\
                                  &gt;&nbsp;<a href="javascript:void(0);" class="monkey-highlight" rel="nofollow" title="高亮楼主的所有发言" style="display: inline;margin-left:0;">高亮</a>\
                                  &gt;&nbsp;<a href="javascript:void(0);" class="monkey-ignore" rel="nofollow" title="忽略楼主的所有发言" style="display: inline;margin-left:0;">忽略</a>\
                                  &gt;&nbsp;<a href="javascript:void(0);" class="monkey-reset" rel="nofollow" title="还原到原始状态" style="display: inline;margin-left:0;">还原</a>\
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
        //提示组件
        'monkeyTip' : '<p>{1}</p>\
                     <a href="javascript:void(0)" style="position:relative;left:45%;" action-type="close" >关闭</a>',

        'searchBar' : '<div id="db_scr_btm" title="双击：立即搜索；单击：选择搜索范围">\
                            <div class="db_scr_btm">综合</div>\
                            <div class="db_scr_btm">社区</div>\
                            <div class="db_scr_btm">读书</div>\
                            <div class="db_scr_btm">电影</div>\
                            <div class="db_scr_btm">音乐</div>\
                            <input type="hidden" value="" name="cat">\
                        </div>'
    };

    //猴子豆核心
    var nuts = {
        //是否登录
        isLogin : function() {
            return (typeof this.login !== 'undefined' && this.login) || (this.login = !!cookie.get('ck'));
        },

        query : function(selector, context) {
            context = context || document;
            return context.querySelector(selector);
        },

        queryAll : function(selector, context) {
            context = context || document;
            return context.querySelectorAll(selector);
        },

        //载入模块
        load : function() {
            monkeyModuleManager.turnOn();
        }
    };


    //猴子豆外皮，UI
    var peal = {
        'monkeyTip' : function(pos, content) {
            var tip = this.tip || createTip();
            tip.innerHTML = monkeyMirror.monkeyTip.replace('{1}', content);
            hide(tip);
            css(tip, 'left', pos.left + 'px');
            css(tip, 'top', pos.top + 'px');
            show(tip);

            function createTip() {
                var css = '#_monkey_tip{background-color: #F9EDBE;border: 1px solid #F0C36D;-webkit-border-radius: 2px;-webkit-box-shadow: 0 2px 4px rgba(0,0,0,0.2);\
                     border-radius: 2px;box-shadow: 0 2px 4px rgba(0,0,0,0.2);font-size: 13px;line-height: 18px;padding: 16px; position: absolute;\
                     vertical-align: middle;width: 160px;z-index: 6000;border-image: initial;display:none;}\
                     ._monkey_arrow_inner {border-top: 6px solid #FFFFFF;top: 43px; z-index: 5;}\
                     ._monkey_arrow_outer {border-top: 6px solid #666666;z-index: 4;}',
                    tip;
                GM_addStyle(css);
                tip = div.cloneNode(true);
                tip.id = '_monkey_tip';
                //tip.innerHTML = monkeyMirror.monkeyTip;
                document.body.appendChild(tip);
                delegate(tip,'a', 'click', function() {
                    hide(tip);
                })
                return peal.tip = tip;
            }
        },

        'monkeyReplyBox' : function() {
            var box = this.box || createReplyBox();
            show(box);

            function createReplyBox() {
                var css = '#_monkey_replybox{position:fixed;top:25%;width:100px;height:50px;scroll:auto-x;right:0;border:1px solid #f9edbe;}',
                    box = div.cloneNode(true);

                GM_addStyle(css);
                box.id = '_monkey_replybox';
                box.innerHTML = monkeyMirror.replyBox;
                document.body.appendChild(box);
                return peal.box = box;
            }
        }
        /**
         * 绿色 ：#226622
         *
         * 豆瓣提示
         * TIP ：<div class="tips-overly guide" style="">
         <div class="tips-hd">提示：</div>
         <div class="tips-bd">
         <h2>友邻广播有了新入囗</h2>
         <p>我们为广播增加了很多新功能，方便你和友邻互动交流、分享好东西。</p>
         <a class="lnk-bn lnk-close" href="#TIPS_ID">知道了</a>
         </div>
         </div>

         .widget-photo-list .info {
         background: none repeat scroll 0 0 #FFFFFF;
         border: 1px solid #999999;
         height: 36px;
         padding: 5px;
         position: absolute;
         z-index: 3;
         }

         .widget-photo-list .info {
         background: none repeat scroll 0 0 #FFFFFF;
         border: 1px solid #999999;
         height: 36px;
         padding: 5px;
         position: absolute;
         z-index: 3;

         .widget-photo-list .info

         .widget-photo-list .info ._monkey_arrow_outer {
         border-top: 6px solid #666666;
         z-index: 4;
         }

         <div class="info desc" style="">
         <p>还是银他妈ED，尺寸10x1...</p>
         <a class="pic" href="http://www.douban.com/people/31896137/"><img title="酱油油" src="http://img3.douban.com/icon/u31896137-4.jpg"></a>
         <span class="arrow inner"></span>
         <span class="arrow outer"></span>
         </div>

         新浪微博
         颜色 #feffe5
         <div id="pl_content_versionTip">
         <div style="left: 565.5px; top: 28px; z-index: 10000; position: fixed; visibility: visible;" class="W_layer layer_tips layer_tips_version layer_tips_intro" node-type="items" messagetip="20">
         <div class="layer_tips_bg">
         <a title="" action-data="bubbletype=20&amp;time=604800" action-type="iKnow" href=":;" class="W_close_color"></a>
         <dl>
         <dd>评论列表中可以查看回复记录啦！</dd>
         </dl>
         <span class="arrow_up" node-type="arrow" style="left: 106px;"></span>
         </div>
         </div>
         </div>
         */
    };

    //页面参数，用于缓存
    var pageParam = {
        'floor' : null,  //楼层
        'floorStart' : 0
    };

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

//-------------------------模块----------------------------------
    /**
     * 关于这个模块功能我是这样设想的：
     *      1，页面加载后，会通过搜索一个map，寻找哪些模块适用于该页面，找到后将这些模块启动
     *      2，模块有父类，包含基本的方法，如load，开关状态(待考虑)
     *      3，模块通过管理员注册，需要提供GUID
     *      4，但是1里面的那个map是神马样子的呢？怎么弄好一些呢？
     */
        //猴子模块管理员,请叫我Mr.TM  (triple M)
    var monkeyModuleManager = (function() {
        var moduleTree = [],  //模块树，所有模块都生长在树上。
            turnOn,
            register;

        register = function(module) {
            moduleTree.push(module);
        };

        turnOn = function() {
            var path = location.hostname + location.pathname,
                m,
                len = moduleTree.length;
            i = 0;
            for(;i<len; i++) {
                m = moduleTree[i];
                path.match(m.filter) && !m.on && m.load();
            }
        };

        return {
            register : register,
            turnOn : turnOn
        }
    })();

    var MonkeyModule = function(name, method) {
        if(this.constructor != MonkeyModule) {
            return new MonkeyModule(name, method);
        }
        var that = this;
        this.guid = guid++;
        this.name = name;
        this.filter = new RegExp('');
        $.extend(this, method);
        this.on = false;  //是否启动
        that.init();
    };

    MonkeyModule.prototype = {
        constructor : MonkeyModule,

        init : function() {
            monkeyModuleManager.register(this);
        },

        load : function() {
            //log(this.name + ' 准备加载！');
        },

        toString : function() {
            return 'This module\'s name is:' + this.name;
        }
    };


    //猴子天气
    /**
     * 使用Google API，地址 http://www.google.com/ig/api?weather=Beijing&hl=zh-cn
     */
    /*var monkeyWeather = new MonkeyModule('weather', {
     filter : /www.douban.com\/(mine|(people\/.+\/)$)/,
     url : 'http://www.google.com/ig/api?weather={1}&hl=zh-cn',
     load : function() {
     //log(this.name + ' 准备加载！');
     var place = nuts.query('.user-info > a'),
     a;
     if(!place || !trim(place.textContent)) return;
     a = place.href.split('/');
     place = place.textContent;

     GM_xmlhttpRequest({
     method : 'GET',
     url : monkeyWeather.url.replace('{1}', a[a.length-2]),
     onload : function(resp) {
     xml.parse(resp.responseText);
     var current = xml.tag('current_conditions'),
     condition = xml.tag('condition', current).data,
     icon = xml.tag('icon', current).data,
     temp = xml.tag('temp_c', current).data,
     profile = document.getElementById('profile'),
     container = div.cloneNode(true);

     container.style.cssText = 'position:relative;top:10px;';
     container.innerHTML = monkeyMirror.weather.replace(/\{1\}/g, condition)
     .replace('{2}', icon)
     .replace('{3}', place)
     .replace('{4}', temp);
     profile.parentNode.insertBefore(container, profile)
     }
     })
     }
     });*/

    //猴子导航栏——用于显示顶部导航栏的二级菜单
    var monkeyNav = new MonkeyModule('nav', {
        css : '#_monkey_secondNav{display:block;width:600px;} #_monkey_secondNav ul{position:relative;z-index:5;} #_monkey_secondNav ul li{float:none;}',
        load : function() {
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
            var items = this.cache || (this.cache = nuts.queryAll('[monkey_data]')),
                len = items.length,
                i = 0;
            if(len > 0) {
                while(len--) {
                    items[len].getAttribute('monkey_data') != data && hide(items[len]);
                }
            }
        },
        //高亮该用户所有发言
        highlight : function(data) {
            var items = nuts.queryAll('[monkey_data=' + data + ']'),
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

    //猴子回复增强模块，适用于小组回复，书籍影视评论等，功能包括楼层数显示。
    var monkeyComment = new MonkeyModule('comment', {
        on : false, //是否开启
        css : '._monkey_floor{ float:right; margin-right:5px;}',
        toolRel : {
            'monkey-reply' : monkeyCommentToolbox.reply,
            'monkey-quote' : monkeyCommentToolbox.quote,
            'monkey-only' : monkeyCommentToolbox.only,
            'monkey-highlight' : monkeyCommentToolbox.highlight,
            'monkey-ignore' : monkeyCommentToolbox.ignore,
            'monkey-reset' : monkeyCommentToolbox.reset
        },

        initToolbarEvent : function() {
            var that = this;
            delegate(document.body, 'a', 'click', function() {
                var className = this.className;
                if(className && that.toolRel[className]) that.toolRel[className](this.parentNode.getAttribute('data'), this);
            })
        },

        load : function() {
            //log(this.name + ' 准备加载！');

            GM_addStyle(this.css);

            //楼层数。一般来说，多页的链接后面都有一个start参数，表示这页的楼层是从多少开始的。但这个参数并不可靠，考虑分析class为paginator的DIV，里面的a标签更可靠些。
            //小组的回复区域：class为topic-reply的UL，影视书籍的回复：ID为comments的DIV
            //分页栏：class为paginator的DIV，当前页码：class为thispage的span
            var reply = nuts.query('.topic-reply'),
                comments = nuts.query('#comments'),
                currentPage = nuts.query('.paginator .thispage'),
                start = +(query()['start']) || (currentPage && typeof !isNaN(+(currentPage.textContent)) && 100 * (+(currentPage.textContent) - 1)) || 0,
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
            //TODO 以下内容待重构
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

        posterToolbar : function(type) {
            var posterUrl,
                posterId,
                toolbarPos;

            switch(type) {
                case 'group' :
                    posterUrl = nuts.query(monkeySelector[type]['posterUrl']);
                    posterUrl && (postStarterId = posterUrl.href.replace('http://www.douban.com/people/', '').split('/')[0]);

                    toolbarPos = nuts.query('div.topic-opt');
                    toolbarPos && (toolbarPos.innerHTML += monkeyMirror.postStarterToolbar.replace('{1}', postStarterId));
                    break;
            }

        }
    });

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

    nuts.load();
    MonkeyBean.MonkeyModuleManager.turnOn();

    log(((new Date()) - startTime)/1000 + '秒');
})(window, unsafeWindow.$)