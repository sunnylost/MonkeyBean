
/**
 * 猴子相册——增强豆瓣相册浏览
 * updateTime : 2012-5-28
 */
MonkeyModule('MonkeyPic', {
    css : '#MonkeyBeanPicFrame{\
        }',

    html : {
        'button' : '<span class="MonkeyBean-Button" href="javascript:void 0;" monkey-action="MonkeyBean.Pic" style="float:left">开启增强浏览模式</span>',
        'frame' : '<div id="MonkeyBeanPicFrame">\
                        <div mokney-action="MonkeyBean.NextPic"></div>\
                        <div></div>\
                    </div>'
    },

    on : false,

    fit : function() {
        //翻页类型是photo就认为是相册页面
        return MonkeyBean.page.turnType == 'photo';
    },

    load : function() {
        this.overlay = MonkeyBean.TM.get('overlay');
        this.render();
        body.bind('MonkeyBean.Pic', $.proxy(this.turnOnOrOff, this));

        //大图http://img3.douban.com/view/photo/photo/public/p1450859575.jpg
        //小图http://img3.douban.com/view/photo/thumb/public/p1450859575.jpg
    },

    render : function() {
        var html = this.html;
        GM_addStyle(this.css);
        this.button = $(html.button);
        this.frame = $(html.frame);
        this.img = $('<img id="MonkeyBeanPic">');
        this.wrapper = $('.article');
        $('.photitle').prepend(this.button);
        body.append(this.img);
    },

    turnOnOrOff : function() {
        this.on = !this.on;
        if(this.on) {
            this.button.html('开启增强浏览模式');
            this.wrapper.undelegate('a', 'click');
        } else {
            this.button.html('关闭增强浏览模式');
            this.wrapper.delegate('a', 'click', $.proxy(this.browse, this));
        }
    },

    browse : function(e) {
       console.log(e.target);
       this.overlay.show();
       return false;
    }
});