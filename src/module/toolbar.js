
/**
 * 猴子工具条——包括电梯、分页导航栏等等
 * 整个豆瓣页面仅仅占据全部页面的中间部分，所以悬浮工具条放在右边是比较不错的。
 * updateTime : 2012-2-29
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
            </div>',

    fit : function() {
        return false;
    },

    load : function() {
        this.render();
    },

    render : function() {
        GM_addStyle(this.css);
        var el = $(this.html);
        $(document.body).append(el);
    }
});