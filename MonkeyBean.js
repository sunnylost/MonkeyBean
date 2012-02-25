// ==UserScript==
// @name           MonkeyBean
// @namespace      sunnylost
// @version        0.6
// @include        http://*.douban.com/*
// @require http://userscript-autoupdate-helper.googlecode.com/svn/trunk/autoupdatehelper.js
/* @reason
 @end*/
// ==/UserScript==

typeof Updater != 'undefined' && new Updater({
    name: "MonkeyBean",
    id: "124760",
    version:"0.6"
}).check();

/**
 * 说明：
 *      monkey-action：用于触发事件
 *      monkey-data：用于保存信息
 *      monkey-sign：标记的元素
 */
(function(window, $, undefined) {
    if(window !== window.top) return false;  //防止在iframe中执行

    var startTime = new Date();

    /*-------------------Begin--------------------*/
    /**
     * 静态变量
     */
    var MonkeyBeanConst = {
        PAGE_ITEM_COUNTS : 100,   //每页显示条目

        API_COUNT : 'MonkeyBean.API.count',
        API_LAST_REQUEST_TIME : 'MonkeyBean.API.lastTime',
        API_INTERVAL : 60000, //请求api的间隔
        API_LIMIT : 10,       //在以上间隔内，最多请求次数，默认10次
        API : {                //豆瓣API
            'PEOPLE' : 'http://api.douban.com/people/{1}'  //用户信息
        },

        DATA_SPLITER : '[-]',  //monkey-data中的分隔符

        DOUBAN_MAINPAGE : 'http://www.douban.com/',  //豆瓣主页

        MODULE_NAME_PREFIX : 'MonkeyBean.Module.',

        HIGHLIGHT_COLOR : '#46A36A' , //高亮用户发言的颜色
        BLANK_STR : '',                  //空字符串

        USER_NAME : 'monkey.username',
        USER_LOCATION : 'monkey.location'
    };

    var hasOwn = Object.prototype.hasOwnProperty,

        mine = /\/mine/,
        people = /\/people\/(.*)\//,
        //快捷键对应的code
        keyCode = {
            'enter' : 13
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
        },
        //让光标定位到文本框末尾，非浏览器兼容的代码
        focusToTheEnd : function(el) {
            var len = el.value.length;
            el.setSelectionRange(len, len);
            el.focus();
        },
        //jQuery 1.7的方法
        isNumeric: function( obj ) {
            return !isNaN( parseFloat(obj) ) && isFinite( obj );
        },

        //增加快捷键
        addHotKey : function(elem, key, fn) {
            elem.addEventListener('keydown', function(e) {
                fn();
            });
        }
    };

    //shortcuts
    var xml = monkeyToolBox.xml,
        cookie = monkeyToolBox.cookie,
        query = monkeyToolBox.locationQuery,
        isNumeric = monkeyToolBox.isNumeric,
        focusToTheEnd = monkeyToolBox.focusToTheEnd;

    var MonkeyBean = {
        author : 'sunnylost',
        updateTime : '20120225',
        password : 'Ooo! Ooo! Aaa! Aaa! :(|)',

        path : location.hostname + location.pathname,

        //开启debug模式
        debugMode : true,

        log : function(msg) {
            MonkeyBean.debugMode && typeof console !== 'undefined' && console.log(msg);
        },

        GUID : 0,

        CommentId : function() {
            return 'Monkey-Comment-' + (this.GUID++);
        },

        //TODO,使用豆瓣API有限制，每个IP每分钟10次，如果加上key的话是每分钟40次，如果超过限制会被封IP，因此要记录调用API次数及其间隔。
        useAPI : function() {
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
        //判断当前页面类型，是否为读书、电影、音乐等等，目前用于为导航栏增加当前页面提示，其中，9点、阿尔法城和fm没有导航栏，不必考虑
        pageType : function() {
            var type = '',
                normalType = /(www|book|movie|music)\.douban\.com\/.*/;
            type = this.path.replace(normalType, '$1');

            console.log('TYPE====' + type);
            return type.indexOf('douban.com') != -1 ? 'location' : type;
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
        //Mr.TM Tripple M;
        MonkeyModuleManager : (function() {
            var moduleTree = {},  //模块树，所有模块都生长在树上。
                get,              //根据名字获得对应模块
                turnOn,
                register;

            get = function(moduleName) {
                return moduleTree[moduleName];
            };

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
                        tmpModule.fit() && tmpModule.load();
                    }
                }
            };

            return {
                get : get,
                register : register,
                turnOn : turnOn
            }
        })()
    };
    var log = MonkeyBean.log;
    MonkeyBean.TM = MonkeyBean.MonkeyModuleManager;

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
            MonkeyBean.TM.register(this.name, this);
        },

        get : function(name) {
            return this.attr[name];
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
                //log(attr + '---------' + attrs[attr]);
                this.attr[attr] = attrs[attr]
            }
            this.trigger('change');  //属性更改会触发change事件
        },

        load : function() {
            //log(this.name + ' 准备加载！');
        },
        //检测是否适用于当前页面
        fit : function() {
            //如果不提供filter，默认全局开启。
            return this.filter ? !$.isArray(this.filter) && (this.filter.test(MonkeyBean.path)) : true;
        },

        //TODO:一个简单的模板方法
        template : function(key, value) {
        },

        toString : function() {
            return 'This module\'s name is:' + this.name;
        }
    };

    $.extend(MonkeyBean, cusEvents);
    $.extend(MonkeyModule.prototype, cusEvents);



    var userName = MonkeyBean.get(MonkeyBeanConst.USER_NAME),

        userLocation = MonkeyBean.get(MonkeyBeanConst.USER_LOCATION);

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
                        MonkeyBean.set(MonkeyBeanConst.USER_NAME, userName);
                        log('2222' + MonkeyBeanConst.USER_NAME + '=' + MonkeyBean.get(MonkeyBeanConst.USER_NAME, ''));
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
                        MonkeyBean.set(MonkeyBeanConst.USER_LOCATION, userLocation);
                    }
                })
            }
        })()

    /**
     * MonkeyBean配置模块
     */
    MonkeyModule('MonkeyConfig', {
        html : '',

        css : '',

        load : function() {

        },

        render : function() {

        }
    });

    /*********************************UI begin**************************************************************/
    /**
     * 提示便签
     * updateTime : 2012-2-19
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

    });

    /**
     * 回复框
     * updateTime : 2012-2-19
     */
    MonkeyModule('reply', {
        css : '#Monkey-ReplyForm{\
                -moz-border-bottom-colors: none;\
                -moz-border-image: none;\
                -moz-border-left-colors: none;\
                -moz-border-right-colors: none;\
                -moz-border-top-colors: none;\
                background-color: #FFFFFF;\
                border-color: #ACACAC #ACACAC #999999;\
                border-style: solid;\
                border-width: 1px;\
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);\
                color: #000000;\
                outline: 0 none;\
                z-index: 1101;\
                display : none;\
                height : 320px;\
                width : 350px;\
                position: fixed;\
                left : 60%;\
                top : 20%;\
            }\
            #Monkey-ReplyToolbox {\
                position : absolute;\
                margin-left : 15px;\
                text-align : center;\
                padding-bottom : 2px;\
                left : 60px;\
                bottom : 2px;\
                height : 25px;\
            }\
            #Monkey-ReplyText {\
                position : absolute;\
                top : 2px;\
                height : 85%;\
                width : 99%;\
                padding : 2px 3px 0 3px;\
            }\
            #Monkey-ReplyText textarea {\
                font-size: 12px;\
                width : 96%;\
                height : 100%;\
                padding : 2px;\
                margin : 3px;\
            }\
            .Monkey-Button {\
                -moz-border-bottom-colors: none;\
                -moz-border-image: none;\
                -moz-border-left-colors: none;\
                -moz-border-right-colors: none;\
                -moz-border-top-colors: none;\
                background-color : #B2B2B2;\
                border-color: #C9C9C9 #B2B2B2 #9A9A9A;\
                border-left: 1px solid #B2B2B2;\
                border-radius: 3px 3px 3px 3px;\
                border-right: 1px solid #B2B2B2;\
                border-style: solid;\
                border-width: 1px;\
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);\
                color: #333333;\
                cursor: pointer;\
                font-size: 11px;\
                font-weight: bold;\
                height: 25px;\
                line-height: 11px;\
                padding: 5px 10px 6px;\
                text-align: center;\
                text-shadow: 0 1px 1px #EEEEEE;\
            }\
            .Monkey-Button:hover {\
                background-color : #9A9A9A;\
            }',

        html : '<div id="Monkey-ReplyForm">\
                    <form name="comment_form" method="post" action="add_comment">\
                        <div style="display: none;">\
                            <input name="ck" value="' + MonkeyBean.getCk() + '" type="hidden">\
                        </div>\
                        <div id="Monkey-ReplyText">\
                            <textarea id="re_text" name="rv_comment" rows="10" cols="40">\
                            </textarea>\
                        </div>\
                        <div id="Monkey-ReplyToolbox">\
                            <input value="加上去" type="submit" monkey-action="submit" class="Monkey-Button">\
                            <input value="清空" type="button" monkey-action="reset" class="Monkey-Button">\
                            <input value="取消" type="button" monkey-action="cancel" class="Monkey-Button">\
                        </div>\
                    </form>\
                </div>',

        load : function() {
            log('loading reply');
            this.render();
        },

        render : function() {
            var that = this;
            GM_addStyle(this.css);
            this.form = $(this.html);
            this.form.appendTo(document.body);
            this.text = $('#Monkey-ReplyForm #re_text');
            this.text.val('');  //默认光标会出现在textare的第一行正中间，手动清除一下
            this.form.delegate('input[monkey-action]', 'click', function() {
                that[this.getAttribute('monkey-action')]();
            });
        },

        show : function() {
            this.form.show();
            focusToTheEnd(this.text[0]);
        },

        submit : function() {
            log('submit');
        },
        //清除回复框中的内容
        reset : function() {
            this.text.val('');
            this.text.focus();
        },
        //隐藏回复框
        cancel : function() {
            this.reset();
            this.form.hide();
        },
        //向文本框中输入内容，如果文本框中有内容，则增加一个换行，再添加新内容
        setContent : function(content) {
            this.show();  //如果不显示，那么执行focusToTheEnd会报错
            var oldContent = this.text.val();
            this.text.val(($.trim(oldContent) == '' ? '' : oldContent + '\n') + content);
            focusToTheEnd(this.text[0]);
        }
    });
    /*********************************UI end**************************************************************/

    /*********************************Common Function****************************************************************/
    /**
     * 通用留言工具函数
     * updateTime : 2012-2-21
     */
    var monkeyCommentToolbox = {
        //快捷回复
        reply : function(data, el) {
            var form = MonkeyBean.TM.get('reply');
            form.show();
            form.setContent('@' + data.split(MonkeyBeanConst.DATA_SPLITER)[1] + '\n');
        },
        //引用用户发言
        quote : function(data) {
            var commentId = data.split(MonkeyBeanConst.DATA_SPLITER)[2],
                comment = null,
                quoteHeader = '',
                quoteContent = '',
                spliter = '-------------------------------------------------------------------\n';
            log('-----=====' + commentId);
            comment = $('#' + commentId);
            quoteHeader = comment.find('h4').text().replace(/\s+/g, ' ') + '\n';
            quoteContent = comment.find('.reply-doc p').text() + '\n';
            log(quoteHeader);
            log(quoteContent);
            MonkeyBean.TM.get('reply').setContent(spliter + quoteHeader + quoteContent + spliter);
        },
        //只看该用户发言
        only : function(data) {
            var items = this.cache || (this.cache = $('[monkey-sign]')),
                len = items.length,
                i = 0,
                tmp = null;
            while(len--) {
                tmp = items.eq(len);
                tmp.attr('monkey-sign') != data.split(MonkeyBeanConst.DATA_SPLITER)[0] && tmp.hide();
            }
        },
        //高亮该用户所有发言
        highlight : function(data) {
            var items = $('[monkey-sign=' + data.split(MonkeyBeanConst.DATA_SPLITER)[0] + ']'),
                len = items.length,
                tmpColor = '';
            tmpColor = (this.clicked = !this.clicked) ? MonkeyBeanConst.HIGHLIGHT_COLOR : MonkeyBeanConst.BLANK_STR;
            while(len--) {
                items.eq(len).css('backgroundColor', tmpColor);
            }
        },
        //忽略该用户所有发言
        ignore : function(data) {
            var items = $('[monkey-sign=' + data.split(MonkeyBeanConst.DATA_SPLITER)[0] + ']'),
                len = items.length;
            while(len--) {
                items.eq(len).hide();
            }
        },
        //还原为原始状态
        reset : function(data) {
            var items = this.cache || $('[monkey-sign]'),
                len = items.length,
                tmp = null;
            this.clicked = false;  //"高亮"里需要这个参数
            while(len--) {
                tmp = items.eq(len);
                tmp.show();
                tmp.css('backgroundColor', MonkeyBeanConst.BLANK_STR);
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

        css : '.Monkey-Weather{position:relative;top:10px;}',

        html : '<div class="Monkey-Weather">\
                    <div style="float:left;margin-right:10px;">\
                        <img height="40" width="40" alt="{1}" src="http://g0.gstatic.com{2}">\
                        <br>\
                    </div>\
                    <span><strong>{3}</strong></span>\
                    <span>{4}℃</span>\
                    <div style="float:">当前：&nbsp;{1}\
                    </div>\
                </div>',

        el : $('#profile'),

        load : function() {
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
                    that.render();
                }
            });
        },

        render : function() {
            if(!this.el) return;
            GM_addStyle(this.css);
            var container = $(this.html.replace(/\{1\}/g, this.get('condition'))
                                        .replace('{2}', this.get('icon'))
                                        .replace('{3}', this.get('place'))
                                        .replace('{4}', this.get('temp')));
            container.insertBefore(this.el);
        }
    });

    /**
     * 留言板，增加回复功能
     * 适用页面：个人主页与留言板页
     * updateTime : 2012-2-19
     */
        //TODO:未完成
    MonkeyModule('MonkeyMessageBoard', {
        //TODO：<span class="gact">
        html:{
            'doumail' : '&nbsp; &nbsp; <a href="/doumail/write?to={1}">回豆邮</a>',
            'reply' : '&nbsp; &nbsp; <a href="JavaScript:void(0);" monkey-data="{1}' + MonkeyBeanConst.DATA_SPLITER + '{2}" title="回复到对方留言板">回复</a>',
            'form' : '<form style="margin-bottom:12px" id="fboard" method="post" name="bpform">\
                         <div style="display:none;"><input type="hidden" value="' + MonkeyBean.getCk() + '" name="ck"></div>\
                         <textarea style="width:97%;height:50px;margin-bottom:5px" name="bp_text"></textarea>\
                         <input type="submit" value=" 留言 " name="bp_submit">\
                         <a href="javascript:void(0);" id="monkey_resetBtn" style="float:right;display:none;">点击恢复原状</a>\
                     </form>'
        },

        filter : /www.douban.com\/(people\/.+\/)(board)$/,

        el : $('ul.mbt'),

        load : function () {
            this.render();
        },

        render : function () {
            this.form = $(this.html['form']);
            this.form.insertBefore(this.el);
            this.resetBtn = $('#monkey_resetBtn');
            this.resetBtn.bind('click', $.proxy(this.reset, this));
            this.bind('reply', this.reply, this);

            if (!this.el || (this.el = this.el.find('li.mbtrdot')).length < 1) return;
            var len = this.el.length,
                i = 0,
                that = this,
                id,
                nickName,
                tmp;
            for (; i < len; i++) {
                tmp = this.el[i];
                var tempVar = tmp.getElementsByTagName('a')[0];
                nickName = tempVar.innerHTML;
                tempVar.href.match(people);
                id = RegExp.$1;
                if (id != 'sunnylost') {
                    tmp = tmp.getElementsByTagName('span');
                    if (tmp.length == 1) {
                        tmp[0].parentNode.innerHTML += '<br/><br/><span class="gact">' + (this.html['doumail'] + this.html['reply']).replace(/\{1\}/g, id).replace('{2}', nickName) + '</span>';
                    } else if (tmp.length == 2) {
                        tmp[1].innerHTML += this.html['reply'].replace(/\{1\}/g, id).replace('{2}', nickName);
                    }

                }
            }
            this.el.delegate('a[monkey-data]', 'click', function () {
                that.trigger('reply', $(this).attr('monkey-data'));
            });
        },

        //TODO:点击回复按钮时，应该可以回复到对方留言板
        reply : function (userMsg) {
            var tmpArr = userMsg.split(MonkeyBeanConst.DATA_SPLITER);
            this.form.find('[type="submit"]').val('回复到的' + tmpArr[1] + '的留言板');
            this.form.attr('action', 'http://www.douban.com/people/' + tmpArr[0] + '/board');
            this.resetBtn.css('display', 'block');
        },

        reset : function () {
            this.form.find('[type="submit"]').val('回复');
            this.form.attr('action', '');
            this.resetBtn.css('display', 'none');
        }
    });


    /**
     * 猴子导航栏——用于显示顶部导航栏的二级菜单
     * updateTime : 2012-2-25
     */
    MonkeyModule('MonkeyNavigator', {
        css : '.Monkey-Nav{\
                  display:block;\
                  float: left;\
                  font-size: 12px;\
              }\
              .Monkey-Nav ul, .Monkey-Nav li {\
                  margin : 0;\
                  padding : 0;\
              }\
              .Monkey-Nav ul li ul li {\
                  text-align : center;\
                  width : 60px;\
              }\
              .Monkey-Nav:after .Monkey-Nav li ul:after{\
                  clear: both;\
                  content: " ";\
                  display: block;\
                  height: 0;\
              }\
              .Monkey-Nav ul li{\
                   float : left;\
                   height : 26px;\
                   line-height : 26px;\
                   width : 60px;\
                   position : relative;\
                   padding : 0;\
              }\
              .Monkey-Nav ul li ul {\
                  position : absolute;\
                  top : 26px;\
                  left : -5px;\
                  width : 60px;\
                  background-color : #E9F4E9;\
                  z-index : 100;\
                  display : none;\
              }\
              .Monkey-Nav ul li:hover ul {\
                  display : block;\
              }\
              .Monkey-Nav ul li ul a:hover {\
                  background-color : #0C7823;\
                  padding : 0 5px;\
                  color : #fff;\
              }\
              .Monkey-Nav li ul li {\
                  float: none;\
                  height: 26px;\
                  line-height: 26px;\
                  padding : 0;\
              }',

        html:'<div class="top-nav">\
                   <div class="bd">\
                       <div class="top-nav-info">\
                            <a href="http://www.douban.com/doumail/">豆邮</a>\
                            <a href="http://www.douban.com/accounts/" target="_blank">便型金刚的帐号</a>\
                            <a href="http://www.douban.com/accounts/logout?ck=9P95">退出</a>\
                       </div>\
                       <div class="Monkey-Nav">\
                            <ul>\
                                <li name="Monkey-Nav-mine">\
                                    <a href="http://www.douban.com/mine">我的豆瓣</a>\
                                    <ul>\
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
                                </li>\
                                <li name="Monkey-Nav-www">\
                                    <a href="http://www.douban.com/">豆瓣社区</a>\
                                    <ul>\
                                        <li><a href="http://www.douban.com/">豆瓣猜</a></li>\
                                        <li><a href="http://www.douban.com/update/">友邻广播</a></li>\
                                        <li><a href="http://www.douban.com/mine/">我的豆瓣</a></li>\
                                        <li><a href="http://www.douban.com/group/">我的小组</a></li>\
                                        <li><a href="http://www.douban.com/site/">我的小站</a></li>\
                                    </ul>\
                                </li>\
                                <li name="Monkey-Nav-book">\
                                    <a href="http://book.douban.com/">豆瓣读书</a>\
                                    <ul>\
                                        <li><a href="http://book.douban.com/mine">我读</a></li>\
                                        <li><a href="http://book.douban.com/updates">动态</a></li>\
                                        <li><a href="http://book.douban.com/recommended">豆瓣猜</a></li>\
                                        <li><a href="http://book.douban.com/chart">排行榜</a></li>\
                                        <li><a href="http://book.douban.com/tag/">分类浏览</a></li>\
                                        <li><a href="http://book.douban.com/review/best/">书评</a></li>\
                                        <li><a href="http://read.douban.com/">阅读</a><img src="http://img3.douban.com/pics/new_menu.gif" style="top: 4px; position: absolute;"></li>\
                                        <li><a href="http://book.douban.com/cart">购书单</a></li>\
                                    </ul>\
                                </li>\
                                <li name="Monkey-Nav-movie">\
                                    <a href="http://movie.douban.com/">豆瓣电影</a>\
                                    <ul>\
                                        <li><a href="http://movie.douban.com/mine">我看</a></li>\
                                        <li><a style="color:#FF9933;" href="http://movie.douban.com/nowplaying/' + (userLocation || 'location') + '/">影讯</a></li>\
                                        <li><a href="http://movie.douban.com/celebrities/">影人</a></li>\
                                        <li><a href="http://movie.douban.com/tv/">电视剧</a></li>\
                                        <li><a href="http://movie.douban.com/chart/">排行榜</a></li>\
                                        <li><a href="http://movie.douban.com/tag/">分类</a></li>\
                                        <li><a href="http://movie.douban.com/review/best/">影评</a></li>\
                                    </ul>\
                                </li>\
                                <li name="Monkey-Nav-music">\
                                    <a href="http://music.douban.com/">豆瓣音乐</a>\
                                    <ul>\
                                        <li><a href="http://music.douban.com/artists/">音乐人</a></li>\
                                        <li><a href="http://music.douban.com/chart">排行榜</a></li>\
                                        <li><a href="http://music.douban.com/tag/">分类浏览</a></li>\
                                        <li><a href="http://music.douban.com/mine">我的音乐</a></li>\
                                        <li><a target="blank" href="http://douban.fm/">豆瓣FM</a></li>\
                                    </ul>\
                                </li>\
                                <li name="Monkey-Nav-location">\
                                    <a href="http://www.douban.com/location/">豆瓣同城</a>\
                                    <ul>\
                                        <li><a href="http://www.douban.com/events">同城活动</a></li>\
                                        <li><a href="http://' + userLocation + '.douban.com/hosts">主办方</a></li>\
                                        <li><a href="http://www.douban.com/location/mine">我的同城</a></li>\
                                    </ul>\
                                </li>\
                                <li name="Monkey-Nav-fm">\
                                    <a target="_blank" href="http://douban.fm/">豆瓣FM</a>\
                                    <ul>\
                                        <li><a href="http://douban.fm/mine" target="_blank">我的电台</a></li>\
                                        <li><a href="http://douban.fm/app" target="_blank">应用下载</a></li>\
                                    </ul>\
                                </li>\
                                <li name="Monkey-Nav-9">\
                                    <a target="_blank" href="http://9.douban.com">九点</a>\
                                    <ul>\
                                        <li><a href="http://9.douban.com/channel/culture">文化</a></li>\
                                        <li><a href="http://9.douban.com/channel/life">生活</a></li>\
                                        <li><a href="http://9.douban.com/channel/fun">趣味</a></li>\
                                        <li><a href="http://9.douban.com/channel/technology">科技</a></li>\
                                        <li><a href="http://9.douban.com/reader/">我的订阅</a></li>\
                                    </ul>\
                                </li>\
                                <li name="Monkey-Nav-alphatown">\
                                    <a target="_blank" href="http://alphatown.com/">阿尔法城</a>\
                                </li>\
                            </ul>\
                       </div>\
                    </div>\
                </div>',

        el : $('div.top-nav'),

        load : function() {
            //在未登录的状态下，首页不显示导航栏
            if(window.location.href == MonkeyBeanConst.DOUBAN_MAINPAGE && !MonkeyBean.isLogin()) return false;

            this.render(MonkeyBean.pageType());
            return false;
        },

        render : function(type) {
            log('PAGETYPE====' + type);
            GM_addStyle(this.css);
            this.el.replaceWith(this.html);
            $('[name=Monkey-Nav-' + type + ']').addClass('on');
        }
    });


    /**
     * 楼主工具条——依赖于下面的回复增强模块
     * updateTime：2012-2-25
     */
    MonkeyModule('MonkeyPosterToolbar', {
        html : '<div style="margin-bottom:10px;font-size: 14px;">\
                    <span monkey-data="{1}">\
                        &gt;&nbsp;<a href="javascript:void(0);" monkey-action="reply" rel="nofollow" title="回复楼主发言" style="display: inline;margin-left:0;">回复</a>\
                        &gt;&nbsp;<a href="javascript:void(0);" monkey-action="only" rel="nofollow" title="只看楼主的发言" style="display: inline;margin-left:0;">只看</a>\
                        &gt;&nbsp;<a href="javascript:void(0);" monkey-action="highlight" rel="nofollow" title="高亮楼主的所有发言" style="display: inline;margin-left:0;">高亮</a>\
                        &gt;&nbsp;<a href="javascript:void(0);" monkey-action="ignore" rel="nofollow" title="忽略楼主的所有发言" style="display: inline;margin-left:0;">忽略</a>\
                        &gt;&nbsp;<a href="javascript:void(0);" monkey-action="reset" rel="nofollow" title="还原到原始状态" style="display: inline;margin-left:0;">还原</a>\
                    </span>\
                </div>',

        fit : function() {
            return false;
        },

        els : [
            [$('div.topic-doc a')[0], $('div.topic-opt')],   //第一个包含了楼主的ID，第二个是插入工具条的位置
            [$('span.pl2 a')[0], $('div.review-panel')],
            [$('span.pl2 a')[0], $('div.review-stat')]
        ],

        load : function(index) {
            if(index === undefined) return false;

            this.el = this.els[index];

            var posterId = this.el[0].href.replace('http://www.douban.com/people/', '').split('/')[0],
                posterNickName = this.el[0].textContent;
            this.set({
                'posterId' : posterId,
                'posterNickName' : posterNickName
            });
            this.render();
        },

        render : function() {
            log(this.el[1]);
            this.el[1] && (this.el[1].prepend(this.html.replace('{1}', this.get('posterId') + MonkeyBeanConst.DATA_SPLITER + this.get('posterNickName'))));
        }
    });

    /**
     * 猴子回复增强模块，适用于小组回复，书籍影视评论等，功能包括楼层数显示。
     * 我忍不住要吐槽啦！为啥豆瓣很多页面功能类似，html结构全完全不同！搞啥啊……
     * updateTime : 2012-2-25
     */
    MonkeyModule('MonkeyComment', {
        //第一个为小组讨论，第二个为影评书评乐评，第三个为论坛
        filter : [
                    /www.douban.com\/group\/topic\/\d+/,
                    /(book|movie|music).douban.com\/review\/\d+/,
                    /(book|movie|music).douban.com\/subject\/\d+\/discussion\/\d+/,
                    /www.douban.com\/note\/\d+/
        ],

        els : {
            //回复区域，判断楼层数，放置楼层数的位置，放置工具栏的位置
            '0' : $('.topic-reply'),  //小组
            '1' : $('#comments'),                //电影 书籍 音乐
            //楼主信息：#db-usr-profile .info a，xxx的主页，或者从头像的alt里获取，楼主工具在sns-bar上面添加  #comments 为整个留言区域，每一条留言是div.comment-item，留言人的信息：div.author a，楼层数就在author这里加。其余功能在div.group_banned处追加
            '2' : $('#comments'),                                          //论坛
            '3' : $('#comments')                                           //日志
        },

        attr : {
            'commentItem' : 'li',
            'floor' : 'h4',
            'commentTool' : 'div.operation_div'
        },

        fit : function() {
            var len = this.filter.length,
                i = 0;
            for(; i<len; i++) {
                if(this.filter[i].test(MonkeyBean.path)) {
                    this.el = this.els[i];
                    this.set('index', i);
                    if(i == 1) {
                        this.refactor();
                    } else if(i == 2) {  //论坛
                        this.set({
                            'commentItem' : 'table.wr',
                            'commentTool' : 'td:eq(1)'
                        });
                    }
                    return true;
                }
            }
            return false;
        },

        css : '.Monkey-floor{ float:right; margin-right:5px;font-size:12px;}',

        html : '<span name="monkey-commenttool" monkey-data="{1}" style="float:right;visibility:hidden;">\
                    <span>|</span>\
                    <a href="javascript:void(0);" monkey-action="reply" rel="nofollow" title="回复该用户发言" style="display: inline;margin-left:0;">回</a>\
                    <a href="javascript:void(0);" monkey-action="quote" rel="nofollow" title="引用该用户发言" style="display: inline;margin-left:0;">引</a>\
                    <a href="javascript:void(0);" monkey-action="only" rel="nofollow" title="只看该用户的发言" style="display: inline;margin-left:0;">只</a>\
                    <a href="javascript:void(0);" monkey-action="highlight" rel="nofollow" title="高亮该用户的所有发言" style="display: inline;margin-left:0;">亮</a>\
                    <a href="javascript:void(0);" monkey-action="ignore" rel="nofollow" title="忽略该用户的所有发言" style="display: inline;margin-left:0;">略</a>\
                    <a href="javascript:void(0);" monkey-action="reset" rel="nofollow" title="还原到原始状态" style="display: inline;margin-left:0;">原</a>\
                </span>',

        /**
         * 重构页面，影评与书评的留言结构很怪异……
         */
        refactor : function() {
            //return false;
            var comments = this.el.detach(),
                oldContent = comments.html();
            comments.html(oldContent.replace(/(<span class="wrap">)/, '<li class="clearfix"><div class="reply-doc">$1')
                .replace(/(<h2>你的回应.*\s*<\/h2>\s*<div class="txd">)/, '</p><div class="operation_div" style="display:none;"></div><br></div></li>$1')
                .replace(/<\/h3><\/span>/g, '</h4></span><p>')
                .replace(/<h3>/g, '<h4>')
                .replace(/(<span class="wrap">)/g, '</p><div class="operation_div" style="display:none;"></div><br></div></li>' +
                '<li class="clearfix"><div class="reply-doc">$1'));

            $('.piir').append(comments);
            //将第一个元素替换为换行
            comments.find('li').first().replaceWith('<br>');
            comments.delegate('li', 'mouseover', function() {
                var toolbar = this.querySelector('div.operation_div');
                toolbar && (toolbar.style.display = 'block');
            });
            comments.delegate('li', 'mouseout', function() {
                var toolbar = this.querySelector('div.operation_div');
                toolbar && (toolbar.style.display = 'none');
            });
        },

        load : function() {
            //这里注册的事件同样适用于楼主工具条。
            var that = this;
            $(document.body).delegate('a[monkey-action]', 'click', function() {
                var actionName = this.getAttribute('monkey-action');
                actionName && monkeyCommentToolbox[actionName] && monkeyCommentToolbox[actionName](this.parentNode.getAttribute('monkey-data'), this);
            })

            //小组的回复区域：class为topic-reply的UL，影视书籍的回复：ID为comments的DIV
            //分页栏：class为paginator的DIV，当前页码：class为thispage的span
            var currentPage = $('.paginator .thispage'),
                items,
                len = 0,
                start = 0;

            items = this.el.find(this.get('commentItem'));
            len = items.length;
            if(len < 1) return;

            //楼层数。一般来说，多页的链接后面都有一个start参数，表示这页的楼层是从多少开始的。但这个参数并不可靠，考虑分析class为paginator的DIV，里面的a标签更可靠些。
            start = +(query()['start']) || (currentPage.length != 0 && !isNaN(+(currentPage.text())) && MonkeyBeanConst.PAGE_ITEM_COUNTS * (+(currentPage.text()) - 1)) || 0;
            this.set({
                'start' : start,
                'items' : items,
                'length' : len
            });
            this.render();
            log('seconde invoke');
            MonkeyBean.TM.get('MonkeyPosterToolbar').load(this.get('index'));
        },

        render : function() {
            var i = 0,
                tmp = null,
                userId = '',
                nickName = '',
                items = this.get('items'),
                len = this.get('length'),
                start = this.get('start'),
                itemId = '';

            GM_addStyle(this.css);
            for(; i<len; i++) {
                tmp = items.eq(i);

                tmp.find(this.get('floor'))
                    .append('<span class="Monkey-floor">' + (start + i + 1) + '楼</span>');
                tmp = tmp.find('a img').length > 0 ? tmp.find('a')[1] : tmp.find('a')[0];

                userId = tmp.href.replace('http://www.douban.com/people/', '').split('/')[0];
                nickName = tmp.innerHTML;

                tmp = items.eq(i);
                tmp.attr('monkey-sign', userId);

                (itemId = tmp.attr('id')) === '' && (tmp.attr('id', itemId = MonkeyBean.CommentId()));
                //log('-----' + itemId + '----' + tmp.attr('id'));
                //monke-data中保存的数据：用户ID，用户昵称，该条留言的ID
                //log(this.el[3]);
                tmp = tmp.find(this.get('commentTool'));
                tmp.append(this.html.replace('{1}', userId + MonkeyBeanConst.DATA_SPLITER + nickName + MonkeyBeanConst.DATA_SPLITER + itemId));
                tmp.parent().hover(function() {
                    $(this).find('[name=monkey-commenttool]').css('visibility', 'visible');
                }, function() {
                    $(this).find('[name=monkey-commenttool]').css('visibility', 'hidden');
                });
            }
        }
    });

    /**
     * 猴子相册——增强豆瓣相册浏览
     * updateTime : 2012-2-25
     */
    MonkeyModule('MonkeyPic', {

    });

    /**
     * 猴子工具条——包括电梯、分页导航栏等等
     * 整个豆瓣页面仅仅占据全部页面的中间部分，所以悬浮工具条放在右边是比较不错的。
     * updateTime : 2012-2-25
     */
    MonkeyModule('MonkeyToolbar', {
        css : '#Monkey-Toolbar {\
                top: 32px;\
                box-shadow: 0 0 6px #808080;\
                right: -1px;\
                position: fixed;\
                z-index: 90;\
             }\
             .Monkey-Toolbar-Text {\
                 background-color: #F5F5F5;\
                 background-image: -moz-linear-gradient(center top , #F5F5F5, #F1F1F1);\
                 border: 1px solid rgba(0, 0, 0, 0.1);\
                 color: #444444;\
                 border-radius: 2px 2px 2px 2px;\
                 cursor: default;\
                 font-size: 11px;\
                 font-weight: bold;\
                 height: 27px;\
                 line-height: 27px;\
                 margin-right: 16px;\
                 min-width: 54px;\
                 outline: 0 none;\
                 padding: 0 8px;\
                 text-align: center;\
             }',

        html : '<div id="Monkey-Toolbar">\
                    <span class="Monkey-Toolbar-Text">猴子工具条</span>\
                </div>',

        load : function() {
            this.render();
        },

        render : function() {
            GM_addStyle(this.css);
            //$(document.body).append(this.html);
        }
    });

    /**
     * 猴子翻页——通用的翻页工具
     * updateTime : 2012-2-25
     */
    MonkeyModule('MonkeyPageLoader', {

    });

    /**
     * 个人信息盒子——放置
     * updateTime : 2012-2-25
     */
    MonkeyModule('MonkeyPersonInfoBox', {

    });

    /*********************************Module end**************************************************************/

    var userName = MonkeyBean.get(MonkeyBeanConst.USER_NAME, ''),
        userLocation = MonkeyBean.get(MonkeyBeanConst.USER_LOCATION, ''),
        guid = 0;
    log('test debug Mode');

    MonkeyBean.init();

    log(((new Date()) - startTime)/1000 + '秒');
})(window, unsafeWindow.$)