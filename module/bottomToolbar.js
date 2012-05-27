/**
     * 猴子底部工具栏——提供回到顶部、回到底部等功能
     * updateTime : 2012-3-13
     */
    MonkeyModule('MonkeyBottomToolbar', {
        css : '#MonkeyBottomToolbar {\
                    position : fixed;\
                    bottom : -1px;\
                    right : 50px;\
                    height : 25px;\
                    width : 100%;\
               }\
               #MonkeyBottomToolbar .Monkey-Button {\
                    display : inline-block;\
                    width : 40px;\
                    height : 25px;\
                    line-height : 25px;\
                    text-align : center;\
                    float : right;\
               }',

        html : '<div id="MonkeyBottomToolbar">\
                    <!--span class="Monkey-Button">广播</span-->\
                    <span class="Monkey-Button" monkey-action="GoDown" title="回到底部">向下</span>\
                    <span class="Monkey-Button" monkey-action="GoUp" title="回到顶部">向上</span>\
                </div>',

        fit : function() {
            return MonkeyBean.page.type != 'fm';
        },

        load : function() {
            var that = this;
            this.render();

            body.bind('GoUp', function() {
                log('UP');
                unsafeWindow.scrollTo(0, 0);
            })
            body.bind('GoDown', function() {
                unsafeWindow.scrollTo(0, document.documentElement.scrollHeight);
            })
        },

        render : function() {
            GM_addStyle(this.css);
            GM_addStyle(MonkeyBean.UI.css.button);
            this.el = $(this.html);
            $(document.body).append(this.el);
        }
    });