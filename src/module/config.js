
/**
 * MonkeyBean配置模块
 */
MonkeyModule('MonkeyConfig', {
    html : '<div id="Monkey-Config">\
                <div class="title">\
                    <span class="Monkey-Button" monkey-action="closeConfig" style="float:right;">取消</span>\
                    <span class="Monkey-Button" monkey-action="saveConfig" style="float:right;">确定</span>\
                </div>\
                <ul class="Monkey-Config-Nav">\
                    <li class="monkeyConfigHover" monkey-action="changeConfigPanel" monkey-data="filter">关键词过滤</li>\
                    <li monkey-action="changeConfigPanel" monkey-data="other">其他配置</li>\
                    <li monkey-action="changeConfigPanel" monkey-data="export">导出配置</li>\
                    <li monkey-action="changeConfigPanel" monkey-data="about">关于脚本</li>\
                </ul>\
                <div class="Monkey-Config-Content">\
                    <div monkey-data="filter" style="display:block;">\
                        <input id="toggleGroupDescription" type="checkbox" /><label for="toggleGroupDescription">自动隐藏小组介绍</label>\
                        <input id="toggleGroupDescription" type="checkbox" /><label for="toggleGroupDescription">自动隐藏小组介绍</label>\
                        <input id="showFloor" type="checkbox" /><label for="showFloor">显示楼层数</label>\
                    </div>\
                    <div monkey-data="other">\
                        <input id="toggleGroupDescription" type="checkbox" /><label for="toggleGroupDescription">自动隐藏小组介绍</label>\
                        <input id="toggleGroupDescription" type="checkbox" /><label for="toggleGroupDescription">自动隐藏小组介绍</label>\
                    </div>\
                    <div monkey-data="export">\
                        <span class="Monkey-Button" monkey-action="import" style="float:right;">导入</span>\
                        <span class="Monkey-Button" monkey-action="export" style="float:right;">导出</span>\
                        <textarea class="Monkey-Config-Data">\
                        </textarea>\
                    </div>\
                    <div monkey-data="about" style="overflow:auto;height:200px;">\
                        <p>该脚本旨在为豆瓣增加各种各样的功能，Make your douban different!</p>\
                        <p>至于怎么different……完全看我的心情吧！</p>\
                        <dl>\
                            <dt>Q:为什么会写这个脚本？</dt>\
                            <dd>A:不知道……</dd>\
                        </dl>\
                    </div>\
                </div>\
            </div>',

    css : '#Monkey-Config {\
                width : 400px;\
                position : fixed;\
                left : 30%;\
                top : 30%;\
                font-size : 12px;\
                background: none repeat scroll 0 0 #F6F6F6;\
                border: 1px solid #EAEAEA;\
                border-radius: 4px 4px 4px 4px;\
            }\
            #Monkey-Config .title {\
                background-color: #E9F4E9;\
                border: 1px solid #EAEAEA;\
                border-radius: 3px 3px 3px 3px;\
                color: #566D5E;\
                left: 0;\
                padding: 2px;\
                position: absolute;\
                top: -24px;\
            }\
            .Monkey-Config-Nav {\
                list-style : none;\
                background-color : #fff;\
                margin : 2px;\
                float : left;\
                padding : 2px;\
                text-align : center;\
            }\
            .Monkey-Config-Nav li {\
                border-bottom : 1px solid #e4e4e4;\
                background-color : #F2F8F2;\
                line-height : 30px;\
                cursor : pointer;\
                padding : 2px 10px;\
            }\
            .Monkey-Config-Nav li:hover {\
                background-color : #0C7823;\
                color : #fff;\
            }\
            li.monkeyConfigHover {\
                background-color : #0C7823;\
                color : #fff;\
            }\
            .Monkey-Config-Content {\
                border : 1px solid #e4e4e4;\
                background-color : #fff;\
                overflow : hidden;\
                margin : 4px;\
                padding : 2px;\
            }\
            .Monkey-Config-Content div {\
                display : none;\
            }\
            #Monkey-Config label {\
                cursor : pointer;\
            }\
            #Monkey-Config label:hover {\
                background-color : #0C7823;\
                color : #fff;\
            }\
            .Monkey-Config-Data {\
                height: 100px;\
                width: 200px;\
            }',

    load : function() {
        var that = this;
        body.bind('MonkeyConfig.config', function() {
            if(!that.isInit) {
                that.render();
                that.items = $('.Monkey-Config-Nav li');
                that.contents = $('.Monkey-Config-Content [monkey-data]');
                that.items.each(function(i) {
                   that.items[i].content = that.contents.eq(i);
                });
                that.oldItem = $(that.items.eq(0));
                body.bind('changeConfigPanel', $.proxy(that.changeConfigPanel, that));
            }
            that.el.show();
        });
        body.bind('closeConfig', function() {
            that.el.hide();
        });
        body.bind('saveConfig', function() {
            that.el.hide();
        });
    },

    render : function() {
        this.el = $(this.html);
        this.content = this.el.find('.Monkey-Config-Content');
        GM_addStyle(this.css);
        $(document.body).append(this.el);
        this.isInit = true;
    },

    changeConfigPanel : function(e, name, context) {
        var oldItem = this.oldItem;
        var target = $(context);
        if(target[0] != oldItem[0]) {
            oldItem.removeClass('monkeyConfigHover');
            oldItem[0].content.hide();
            target.addClass('monkeyConfigHover');
            target[0].content.show();
            this.oldItem = target;
        }
    }
});