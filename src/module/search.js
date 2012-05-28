/**
     * 猴子搜索——多个网站的快捷搜索方式
     * updateTime : 2012-4-3
     */
    MonkeyModule('MonkeySearch', {
        css : '#MonkeySearch {\
                    position: relative;\
                }\
                #MonkeySearch span{\
                    display: inline-block;\
                    margin-bottom: 10px;\
               }\
               #MonkeySearchList {\
                    list-style: none;\
                    width: 180px;\
                    display: none;\
                    position: absolute;\
                    top: 22px;\
                    overflow: hidden;\
                    background-color: #fff;\
                    border-radius: 5px;\
                    border: 1px solid #CCCCCC;\
               }\
               #MonkeySearchList li {\
                    padding: 4px;\
                    border-radius: 5px;\
                    float: left;\
                    width: 50px;\
               }',

        html : '<div id="MonkeySearch">\
                    <span id="MonkeySearchBtn" class="Monkey-Button">\
                        网站搜索\
                    </span>\
                </div>',

        fit : function() {
            var type = MonkeyBean.page.type;
            return (type == 'book' || type == 'movie' || type == 'music') && MonkeyBean.path.indexOf('subject') != -1;
        },

        load : function() {
            var that = this;
            this.keyword = $('span[property=v:itemreviewed]').html();
            this.template = '<ul id="MonkeySearchList">\
                                <li><a href="http://www.google.com.hk/search?&q={word}">Google</a></li>\
                                <li><a href="http://www.baidu.com/s?ie=utf-8&wd={word}">百度一下</a></li>\
                                <li><a href="http://www.verycd.com/search/folders/{word}">VeryCD</a></li>\
                                <li><a href="http://zh.wikipedia.org/w/index.php?search={word}">维基百科</a></li>\
                                <li><a href="http://books.google.com/books?q={word}">谷歌书籍</a></li>\
                                <li><a href="http://shooter.cn/search/{word}">射手字幕</a></li>\
                                <li><a href="http://wenku.baidu.com/search?word={word}">百度文库</a></li>\
                                <li><a href="http://so.tudou.com/psearch/{word}">土豆豆单</a></li>\
                                <li><a href="http://www.douban.com/group/search?q={word}">百度文库</a></li>\
                                <li><a href="http://www.douban.com/group/search?q={word}">土豆豆单</a></li>\
                                <li><a href="http://so.tudou.com/isearch/{word}">土豆视频</a></li>\
                                <li><a href="http://so.youku.com/v?keyword={word}">优酷视频</a></li>\
                                <li><a href="http://so.youku.com/search_playlist/q_{word}">优酷列表</a></li>\
                                <li><a href="http://www.google.com.hk/search?&q=ed2k+{word}">ED2K</a></li>\
                                <li><a href="http://so.youku.com/v?keyword={word}">优酷视频</a></li>\
                            </ul>';
            this.render();
            $('#MonkeySearchBtn').hover(function() {
                clearTimeout(that.ID);
                !that.isShow && that.show();
            }, function() {
                that.ID = setTimeout(function(e) {
                    var flag = $.contains(that.el[0], e.relatedTarget);
                    clearTimeout(that.ID);
                    !flag && that.hide();
                }, 100);
            })
            this.list = $('#MonkeySearchList');
            this.list.hover(function() {
                clearTimeout(that.ID);
                that.isShown = true;
            }, function() {
                that.hide();
            })
        },

        render : function() {
            GM_addStyle(this.css);
            this.el = $(this.html);
            $('.aside').prepend(this.el);
            //var list = MonkeyBean.get('MonkeySearchList');
            this.el.append(this.template.replace(/\{word\}/g, this.keyword));
        },

        show : function() {
            var that = this;
            clearTimeout(this.ID);
            this.ID = setTimeout(function() {
                that.list.fadeIn();
                that.isShown = true;
            }, 100);
        },

        hide : function() {
            if(!this.isShown) return;
            var that = this;
            clearTimeout(this.ID);
            this.ID = setTimeout(function() {
                that.list.fadeOut();
                that.isShown = false;
            }, 100);
        }

    });