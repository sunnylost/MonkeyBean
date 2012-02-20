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

        MODULE_NAME_PREFIX : 'MonkeyBean.Module.',

        HIGHLIGHT_COLOR : '#46A36A' , //高亮用户发言的颜色
        BLANK_STR : '',                  //空字符串

        USER_NAME : 'monkey.username',
        USER_LOCATION : 'monkey.location'
    };

    var cName = 'monkey.username',
        cLocation = 'monkey.location',
        dataSpliter = '[-]',  //monkey-data中的分隔符
        moduleNamePrefix = 'MonkeyBean.Module.',
        apiCount = 'MonkeyBean.API.count',
        apiLastTime = 'MonkeyBean.API.lastTime',

        cHighLightColor = '#46A36A',  //高亮用户发言的颜色
        cBlankStr = '',                 //空白字符串

        hasOwn = Object.prototype.hasOwnProperty,

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
                display : none;\
                background: none repeat scroll 0 0 #FFFFFF;\
                border: 1px solid #D8D8D8;\
                box-shadow: 0 0 4px rgba(0, 0, 0, 0.23);\
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
    var monkeyCommentToolbox = {
        //快捷回复
        reply : function(data, el) {
            var form = MonkeyBean.TM.get('reply');
            form.show();
            form.setContent('@' + data.split(dataSpliter)[1] + '\n');
        },
        //引用用户发言
        quote : function(data) {
            var commentId = data.split(dataSpliter)[2],
                comment = null,
                quoteHeader = '',
                quoteContent = '',
                spliter = '-------------------------------------------------------------------\n';
            if(!isNumeric(commentId)) return;
            comment = $('#' + commentId);
            quoteHeader = comment.find('h4').text().replace(/\s+/g, ' ') + '\n';
            quoteContent = comment.find('.reply-doc p').text() + '\n';
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
                tmp.attr('monkey-sign') != data.split(dataSpliter)[0] && tmp.hide();
            }
        },
        //高亮该用户所有发言
        highlight : function(data) {
            var items = $('[monkey-sign=' + data.split(dataSpliter)[0] + ']'),
                len = items.length,
                tmpColor = '';
            tmpColor = (this.clicked = !this.clicked) ? cHighLightColor : cBlankStr;
            while(len--) {
                items.eq(len).css('backgroundColor', tmpColor);
            }
        },
        //忽略该用户所有发言
        ignore : function(data) {
            var items = $('[monkey-sign=' + data.split(dataSpliter)[0] + ']'),
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
                tmp.css('backgroundColor', cBlankStr);
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
    //TODO:尚未完成，豆瓣助手在firefox也无法提交到别人的留言板，这个问题推迟解决

    MonkeyModule('MonkeyMessageBoard', {
        //TODO：<span class="gact">
        html:{
            'doumail' : '&nbsp; &nbsp; <a href="/doumail/write?to={1}">回豆邮</a>',
            'reply' : '&nbsp; &nbsp; <a href="JavaScript:void(0);" monkey-data="{1}' + dataSpliter + '{2}" title="回复到对方留言板">回复</a>',
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
            var tmpArr = userMsg.split(dataSpliter);
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


    //TODO 猴子导航栏——用于显示顶部导航栏的二级菜单
    MonkeyModule('MonkeyNavigator', {
        css : '#_monkey_secondNav{\
                    display:block;width:600px;\
              }\
              #_monkey_secondNav ul{\
                    position:relative;\
                    z-index:5;\
              }\
              #_monkey_secondNav ul li{\
                    float:none;\
              }',

        load : function() {
            return false;
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


    /**
     * 楼主工具条
     * updateTime：2012-2-19
     */
    MonkeyModule('MonkeyPosterToolbar', {
        html : '<span monkey-data="{1}" class="fleft">\
                    &gt;&nbsp;<a href="javascript:void(0);" monkey-action="reply" rel="nofollow" title="回复楼主发言" style="display: inline;margin-left:0;">回复</a>\
                    &gt;&nbsp;<a href="javascript:void(0);" monkey-action="only" rel="nofollow" title="只看楼主的发言" style="display: inline;margin-left:0;">只看</a>\
                    &gt;&nbsp;<a href="javascript:void(0);" monkey-action="highlight" rel="nofollow" title="高亮楼主的所有发言" style="display: inline;margin-left:0;">高亮</a>\
                    &gt;&nbsp;<a href="javascript:void(0);" monkey-action="ignore" rel="nofollow" title="忽略楼主的所有发言" style="display: inline;margin-left:0;">忽略</a>\
                    &gt;&nbsp;<a href="javascript:void(0);" monkey-action="reset" rel="nofollow" title="还原到原始状态" style="display: inline;margin-left:0;">还原</a>\
                  </span>',

        filter : [/www.douban.com\/group\/topic\/\d+/, /(movie|book).douban.com\/review\/\d+/],

        fit : function() {
            //.test(MonkeyBean.path)
            return true;
        },
//['div.piir a']
        el : [$('div.topic-doc a')[0], $('div.topic-opt')],  //第一个包含了楼主的ID，第二个是插入工具条的位置

        load : function() {
            if(!this.el[0]) return;
            var posterId = this.el[0].href.replace('http://www.douban.com/people/', '').split('/')[0],
                posterNickName = this.el[0].innerHTML;
            this.set({
                'posterId' : posterId,
                'posterNickName' : posterNickName
            });
            this.render();
        },

        render : function() {
            this.el[1] && (this.el[1].append(this.html.replace('{1}', this.get('posterId') + dataSpliter + this.get('posterNickName'))));
            log(this.el[1]);
        }
    });

    /**
     * 猴子回复增强模块，适用于小组回复，书籍影视评论等，功能包括楼层数显示。
     * updateTime : 2012-2-19
     */
    MonkeyModule('MonkeyComment', {
        //第一个为小组讨论，第二个为影评，第三个为书评，第四个为日志
        filter : [/www.douban.com\/group\/topic\/\d+/, /movie.douban.com\/review\/\d+/, /book.douban.com\/review\/\d+/, /www.douban.com\/note\/\d+/],

        el : [$('.topic-reply')],  //第一个为小组回复

        els : {
            //回复区域，判断楼层数，放置楼层数的位置，放置工具栏的位置
            '0' : [$('.topic-reply'), 'li', 'h4', 'div.operation_div'],  //小组
            '1' : [$('#comments'), 'li', 'h4', 'div.operation_div'],                //电影
            '2' : [$('#comments'), 'li', 'h4', 'div.operation_div'],                                          //书籍
            //楼主信息：#db-usr-profile .info a，xxx的主页，或者从头像的alt里获取，楼主工具在sns-bar上面添加  #comments 为整个留言区域，每一条留言是div.comment-item，留言人的信息：div.author a，楼层数就在author这里加。其余功能在div.group_banned处追加
            '3' : [$('#comments')]                                           //日志
        },

        fit : function() {
            var len = this.filter.length,
                i = 0;
            for(; i<len; i++) {
                if(this.filter[i].test(MonkeyBean.path)) {
                    this.el = this.els[i];
                    if(i == 1 || i == 2) this.refactor();
                    return true;
                }
            }
            return false;
        },

        css : '.Monkey-floor{ float:right; margin-right:5px;font-size:12px;}',

        html : '<span monkey-data="{1}" style="float:right;">\
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
            var comments = this.el[0].detach(),
                 oldContent = comments.html();
            comments.html(oldContent.replace(/(<span class="wrap">)/, '<li class="clearfix"><div class="reply-doc">$1')
                                    .replace(/<\/h3><\/span>/g, '</h4></span><p>')
                                    .replace(/<h3>/g, '<h4>')
                                    .replace(/(<span class="wrap">)/g, '</p><div class="operation_div" style="display:none;"></div><br></div></li>' +
                                               '<li class="clearfix"><div class="reply-doc">$1')
                                     + '</p><div class="operation_div" style="display:none;"></div><br></div></li>');

            $('.piir').append(comments);
            comments.find('li').first().replaceWith('<br>');
            comments.delegate('li', 'mouseover', function() {
                this.querySelector('div.operation_div').style.display = 'block';
            });
            comments.delegate('li', 'mouseout', function() {
                this.querySelector('div.operation_div').style.display = 'none';
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
                tmp = null,
                i = 0,
                len = 0,
                userId = '',
                nickName = '',
                start = 0;

            items = this.el[0].find(this.el[1]);
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
        },

        render : function() {
            var i = 0,
                tmp = null,
                userId = '',
                nickName = '',
                items = this.get('items'),
                len = this.get('length'),
                start = this.get('start');

            GM_addStyle(this.css);
            for(; i<len; i++) {
                tmp = items.eq(i);

                tmp.find(this.el[2])
                    .append('<span class="Monkey-floor">' + (start + i + 1) + '楼</span>');
                tmp = tmp.find('a img').length > 0 ? tmp.find('a')[1] : tmp.find('a')[0];

                log(tmp);
                userId = tmp.href.replace('http://www.douban.com/people/', '').split('/')[0];
                nickName = tmp.innerHTML;
                items.eq(i).attr('monkey-sign', userId);
                //monke-data中保存的数据：用户ID，用户昵称，该条留言的ID
                //log(this.el[3]);
                items.eq(i).find(this.el[3]).append(this.html.replace('{1}', userId + dataSpliter + nickName + dataSpliter + items[i].id));
            }
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
                        <li><a href="http://book.douban.com/mine">我读</a></li>\
                        <li><a href="http://book.douban.com/recommended">豆瓣猜</a></li>\
                        <li><a href="http://book.douban.com/chart">排行榜</a></li>\
                        <li><a href="http://book.douban.com/tag/">分类浏览</a></li>\
                        <li><a href="http://book.douban.com/review/best/">书评</a></li>\
                        <li><a href="http://book.douban.com/cart">购书单</a></li>\
                    </ul>\
                    <ul id="豆瓣电影" style="display:none;">\
                        <li><a href="http://movie.douban.com/tv">电视剧</a></li>\
                        <li><a href="http://movie.douban.com/mine">我看</a></li>\
                        <li><a href="http://movie.douban.com/chart">排行榜</a></li>\
                        <li><a href="http://movie.douban.com/tag/">分类浏览</a></li>\
                        <li><a href="http://movie.douban.com/review/best/">热评</a></li>\
                    </ul>\
                    <ul id="豆瓣音乐" style="display:none;">\
                        <li><a href="http://music.douban.com/mine">我的音乐</a></li>\
                        <li><a href="http://music.douban.com/artists/">音乐人</a></li>\
                        <li><a href="http://music.douban.com/chart">排行榜</a></li>\
                        <li><a href="http://music.douban.com/tag/">分类浏览</a></li>\
                        <li><a target="blank" href="http://douban.fm/">豆瓣电台</a></li>\
                    </ul>\
                    <ul id="豆瓣同城" style="display:none;">\
                        <li><a href="http://www.douban.com/events">同城活动</a></li>\
                        <li><a href="http://' + GM_getValue('monkey.location') + '.douban.com/hosts">主办方</a></li>\
                        <li><a href="http://www.douban.com/location/mine">我的同城</a></li>\
                    </ul>\
                    <ul id="九点" style="display:none;">\
                        <li><a href="http://9.douban.com/channel/culture">文化</a></li>\
                        <li><a href="http://9.douban.com/channel/life">生活</a></li>\
                        <li><a href="http://9.douban.com/channel/fun">趣味</a></li>\
                        <li><a href="http://9.douban.com/channel/technology">科技</a></li>\
                        <li><a href="http://9.douban.com/reader/">我的订阅</a></li>\
                    </ul>\
                    <ul id="豆瓣FM" style="display:none;">\
                        <li><a href="http://douban.fm/mine" target="_blank">我的电台</a></li>\
                        <li><a href="http://douban.fm/app" target="_blank">应用下载</a></li>\
                    </ul>',

        'myDouban' : '<a href="http://www.douban.com/people/' + userName + '/">我的豆瓣</a>',

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