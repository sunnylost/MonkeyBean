
/**
 * 猴子相册——增强豆瓣相册浏览
 * updateTime : 2012-3-13
 */
MonkeyModule('MonkeyPic', {
    html : '<a href="javascript:void 0;" monkey-action="monkeyPic" style="float:left"></a>',

    on : false,

    fit : function() {
        //翻页类型是photo就认为是相册页面
        return MonkeyBean.page.turnType == 'photo';
    },

    load : function() {

        var title = $('.photitle');
        //大图http://img3.douban.com/view/photo/photo/public/p1450859575.jpg
        //小图http://img3.douban.com/view/photo/thumb/public/p1450859575.jpg
    },

    render : function() {

    },

    turnOnOrOff : function() {
        this.on = !this.on;
    }
});