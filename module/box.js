
/**
 * 猴子箱——在个人链接上出现一个层，包含对该用户的快捷操作，例如用户的电影、读书、音乐等，还包括加关注和拉入黑名单等等。
 * 样式借鉴了知乎：www.zhihu.com
 * updateTime : 2012-3-17
 */
MonkeyModule('MonkeyBox', {
    css : '#MonkeyBox {\
              position : absolute;\
              border-radius : 5px;\
        }\
        #MonkeyBox .xtb {\
            border: 1px solid #BBBBBB;\
        }\
        #xcd {\
            background: none repeat scroll 0 0 #FFFFFF;\
            width: 280px;\
        }\
        .xd {\
            border-radius : 5px;\
        }\
        .xye {\
            background: none repeat scroll 0 0 white;\
            border: 3px solid #F4F4F4;\
            padding: 10px;\
        }\
        .xsb {\
            line-height: 18px;\
            margin: 0 0 0 4px;\
        }\
        .xbd {\
            border-top: 1px solid #E9E9E9;\
            margin: 5px 0 0;\
            padding: 10px 0 0;\
        }\
        .xuv {\
            color: #999999 !important;\
            font-size: 12px;\
        }\
        .xjw {\
            border-radius: 3px 3px 3px 3px;\
            display: block;\
            font-size: 12px;\
            font-weight: normal;\
            line-height: 18px;\
            padding: 1px;\
            text-align: center;\
            text-decoration: none !important;\
            width: 52px;\
        }\
        .xiw {\
            background: -moz-linear-gradient(center top , #ADDA4D, #86B846) repeat scroll 0 0 transparent;\
            border: 1px solid #6D8F29;\
            box-shadow: 0 1px 0 rgba(255, 255, 255, 0.5) inset, 0 1px 0 rgba(0, 0, 0, 0.15);\
            color: #3E5E00 !important;\
            text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);\
        }\
        .xwv {\
            float: right;\
        }\
        .Monkey-Pointer {\
            position : absolute;\
            height : 0;\
            left : 50px;\
        }\
        .Monkey-Pointer-Border {\
            border: 9px solid;\
        }\
        .Monkey-a {\
            border-color: #BBBBBB transparent transparent;\
        }\
        .Monkey-b {\
            border-color: #FFFFFF transparent transparent;\
            top: -20px;\
            position : relative;\
        }',

    html : '<div id="MonkeyBox" style="left: 290px; top: 150.5px; display: none;z-index:10000;">\
                <div class="xd xtb" id="xcd">\
                    <div class="xd xye">\
                        <div class="xsb">\
                        </div>\
                        <div class="xbd">\
                        </div>\
                    </div>\
                </div>\
                <div class="Monkey-Pointer">\
                    <div class="Monkey-a Monkey-Pointer-Border"></div>\
                    <div class="Monkey-b Monkey-Pointer-Border"></div>\
                </div>\
            </div>',

    fit : function() {
        return true;
    },

    load : function() {
        var that = this;
        this.set({'text': '<h1>{name}</h1>\
                        <br>\
                        <span class="Monkey-Button"><a href="{prefix}notes">日记</a></span>\
                        <span class="Monkey-Button"><a href="{prefix}photos">相册</a></span>\
                        <span class="Monkey-Button"><a href="{prefix}favorites">喜欢</a></span>\
                        <span class="Monkey-Button"><a href="{prefix}miniblogs">广播</a></span>\
                        <span class="Monkey-Button"><a href="{prefix}doulists">豆列</a></span>',
                    'tool' : '<a class="xwv xuv" href="http://www.douban.com/doumail/write?to={nickname}">豆邮</a>\
                               <a class="xjw xiw" data-focustype="people" name="focus" href="javascript:;">关注</a>'
        });
        this.people = /^http:\/\/(www|movie)\.douban\.com\/people\/([^/]+)\/$/;
        this.render();
        $(document).delegate('a', 'mouseenter', function(e) {
            var _this = this;
            clearTimeout(that.ID);
            that.ID = setTimeout(function() {
                var a = $(_this);
                if(that.people.test(_this.href) && a.find('img').length == 0) {
                    that.nickname = RegExp.$2;
                    that.url = _this.href;
                    that.show($(_this).offset(), _this.innerHTML);
                }
            }, 500);

        });
        $(document).delegate('a', 'mouseleave', function(e) {
            if(that.people.test(this.href) && this.getElementsByTagName('img').length == 0) {
                var flag = $.contains(that.box[0], e.relatedTarget);
                clearTimeout(that.ID);
                !flag && that.hide();
            }
        })
    },

    render : function() {
        var that = this;
        GM_addStyle(this.css);
        GM_addStyle(MonkeyBean.UI.css.button);
        this.box = $(this.html);
        this.text = this.box.find('.xsb');
        this.tool = this.box.find('.xbd');
        document.body.appendChild(this.box[0]);

        this.box.hover(function() {
            clearTimeout(that.ID);
            that.isShown = true;
        }, function() {
            that.hide();
        })
    },

    show : function(position, text) {
        var that = this;
        clearTimeout(this.ID);
        this.ID = setTimeout(function() {
            that.box.show();
            that.box.css({
                'left' : position.left - 40 + 'px',
                'top' : position.top - 160 + 'px'
            });
            that.text.html(that.get('text').replace('{name}', text).replace(/\{prefix\}/g, that.url));
            that.tool.html(that.get('tool').replace('{nickname}', that.nickname));
            that.isShown = true;
        }, 500);
    },

    hide : function() {
        if(!this.isShown) return;
        var that = this;
        clearTimeout(this.ID);
        this.ID = setTimeout(function() {
            that.box.fadeOut();
            that.isShown = false;
        }, 500);
    }
});