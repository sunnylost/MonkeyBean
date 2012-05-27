/**
     * 猴子杂货铺——这些功能不知道怎么分类，暂时扔在这里
     * updateTime : 2012-3-18
     */
    MonkeyModule('MonkeyGroceries', {
        load : function() {
            //log('aaa');
            var discussion = /subject\/\d+\/discussion\/\d+/;
            //log('------' + MonkeyBean.page.turnType);
            //为电影、书籍的讨论页面增加回到电影/书籍的链接
            if(MonkeyBean.page.turnType == 'discussion') {
                if(discussion.test(MonkeyBean.path)) {
                    var el = $('div.aside p.pl2'),
                        a = el.find('a'),
                        str = el.html();
                    el.html(str + '</br></br>&gt; <a href="' + a.attr('href').replace('discussion/', '') + '">去' + a.text().match(/去(.*)的论坛/)[1] + '的页面</a>')
                }
            }
        }
    });