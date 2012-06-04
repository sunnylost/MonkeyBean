var MonkeyBean = {
        author : 'sunnylost',
        updateTime : '20120527',
        password : 'Ooo! Ooo! Aaa! Aaa! :(|)',

        path : location.hostname + location.pathname,

        //开启debug模式
        debugMode : false,

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

        tempIframe : function() {
            var iframe = $('<iframe style="width:0;height:0;display:none;"></iframe>');
            body.append(iframe);
            return iframe;
        }(),
        //清除script与link标签
        filterJS : function(source) {
            source = $.trim(source).replace(/<script[^>]*>[\s\S]*?<\/script\s*>/img, '')
                                    .replace(/<link[^>]*>/mg, '');
            return source;
        },

        //MonkeyBean初始化方法
        init : function() {
            var that = this;
            this.MonkeyModuleManager.turnOn();
            //注册全局click事件
            body.delegate('[monkey-action]', 'click', function(e) {
                var actionContext = this,
                    actionType = this.getAttribute('monkey-action'),
                    actionName = this.getAttribute('monkey-action-name');
                console.log('actionType=' + actionType);
                body.trigger(actionType, [actionName, actionContext]);
            })

            //loading动画
            body.bind('loadingStart', function() {
                $('.MonkeyBean-Loading-stop').removeClass('MonkeyBean-Loading-stop').addClass('MonkeyBean-Loading');
            })

            body.bind('loadingStop', function() {
                $('.MonkeyBean-Loading').removeClass('MonkeyBean-Loading').addClass('MonkeyBean-Loading-stop');
            })
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

        getCk : function(flag) {
            return !flag ? (this.ck || (this.ck = cookie.get('ck'))) : cookie.get('ck');
        },
        //Mr.TM Tripple M;
        MonkeyModuleManager : (function() {
            var moduleTree = {},  //模块树，所有模块都生长在树上。
                get,              //根据名字获得对应模块
                turnOn,
                register;

            get = function(moduleName) {
                var module = moduleTree[moduleName];
                !module.on && module.load();  //如果没有初始化完毕，则执行初始化
                module.on = true;
                return module;
            };

            register = function(moduleName, module) {
                moduleTree[moduleName] = module;
            };

            turnOn = function() {
                var m, tmpModule;
                for(m in moduleTree) {
                    if(hasOwn.call(moduleTree, m)) {
                        tmpModule = moduleTree[m];
                        //log(tmpModule.name + ' 加载~');
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
