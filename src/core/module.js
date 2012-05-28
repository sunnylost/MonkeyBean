var MonkeyModule = function(name, method) {
        if(this.constructor != MonkeyModule) {
            return new MonkeyModule(name, method);
        }
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
                this.attr[attr] = attrs[attr];
            }
        },

        load : function() {
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