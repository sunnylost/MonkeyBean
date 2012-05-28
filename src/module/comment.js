
/**
 * 猴子回复增强模块，适用于小组回复，书籍影视评论等，功能包括楼层数显示。
 * 我忍不住要吐槽啦！为啥豆瓣很多页面功能类似，html结构全完全不同！搞啥啊……
 * TODO:等待重构——2012-3-12

    bug：
        翻页后功能失效
 * updateTime : 2012-3-12
 */
MonkeyModule('MonkeyComment', {
    //第一个为小组讨论，第二个为影评书评乐评，第三个为论坛
    filter : [
        /www.douban.com\/group\/topic\/\d+/,
        /(book|movie|music).douban.com\/review\/\d+/,
        /(book|movie|music).douban.com\/subject\/\d+\/discussion\/\d+/,
        /www.douban.com\/note\/\d+/
    ],

    els : {
        //回复区域，判断楼层数，放置楼层数的位置，放置工具栏的位置
        '0' : $('.topic-reply'),  //小组
        '1' : $('#comments'),                //电影 书籍 音乐
        //楼主信息：#db-usr-profile .info a，xxx的主页，或者从头像的alt里获取，楼主工具在sns-bar上面添加  #comments 为整个留言区域，每一条留言是div.comment-item，留言人的信息：div.author a，楼层数就在author这里加。其余功能在div.group_banned处追加
        '2' : $('#comments'),                                          //论坛
        '3' : $('#comments')                                           //日志
    },

    attr : {
        'commentItem' : 'li',
        'floor' : 'h4',
        'commentTool' : 'div.operation_div'
    },

    fit : function() {
        var len = this.filter.length,
            i = 0;
        for(; i<len; i++) {
            if(this.filter[i].test(MonkeyBean.path)) {
                this.el = this.els[i];
                if(!this.el) return false;
                this.set('index', i);
                if(i == 1) {
                    this.refactor();
                } else if(i == 2) {  //论坛
                    this.set({
                        'commentItem' : 'table.wr',
                        'commentTool' : 'td:eq(1)'
                    });
                }
                return true;
            }
        }
        return false;
    },

    css : '.Monkey-floor{ float:right; margin-right:5px;font-size:12px;}',

    html : '<span name="monkey-commenttool" monkey-data="{1}" style="float:right;">\
                <span>|</span>\
                <a href="javascript:void(0);" monkey-action="MonkeyComment" monkey-action-name="reply" rel="nofollow" title="回复该用户发言" style="display: inline;margin-left:0;">回</a>\
                <a href="javascript:void(0);" monkey-action="MonkeyComment" monkey-action-name="quote" rel="nofollow" title="引用该用户发言" style="display: inline;margin-left:0;">引</a>\
                <a href="javascript:void(0);" monkey-action="MonkeyComment" monkey-action-name="only" rel="nofollow" title="只看该用户的发言" style="display: inline;margin-left:0;">只</a>\
                <a href="javascript:void(0);" monkey-action="MonkeyComment" monkey-action-name="highlight" rel="nofollow" title="高亮该用户的所有发言" style="display: inline;margin-left:0;">亮</a>\
                <a href="javascript:void(0);" monkey-action="MonkeyComment" monkey-action-name="ignore" rel="nofollow" title="忽略该用户的所有发言" style="display: inline;margin-left:0;">略</a>\
                <a href="javascript:void(0);" monkey-action="MonkeyComment" monkey-action-name="reset" rel="nofollow" title="还原到原始状态" style="display: inline;margin-left:0;">原</a>\
            </span>',

    prepare : function() {
        //小组的回复区域：class为topic-reply的UL，影视书籍的回复：ID为comments的DIV
        //分页栏：class为paginator的DIV，当前页码：class为thispage的span
        var currentPage = $('.paginator .thispage'),
            items,
            len = 0,
            start = 0;

        items = this.el.find(this.get('commentItem'));
        len = items.length;
        if(len < 1) return;

        //楼层数。一般来说，多页的链接后面都有一个start参数，表示这页的楼层是从多少开始的。但这个参数并不可靠，考虑分析class为paginator的DIV，里面的a标签更可靠些。
        start = +(query['start']) || (currentPage.length != 0 && !isNaN(+(currentPage.text())) && MonkeyBeanConst.PAGE_ITEM_COUNTS * (+(currentPage.text()) - 1)) || 0;
        this.set({
            'start' : start,
            'items' : items,
            'length' : len
        });
    },

    /**
     * 重构页面，影评与书评的留言结构很怪异……
     */
    refactor : function() {
        //return false;
        var comments = this.el.detach(),
            oldContent = comments.html();
        comments.html(oldContent.replace(/(<span class="wrap">)/, '<li class="clearfix"><div class="reply-doc">$1')
                                .replace(/(<h2>你的回应.*\s*<\/h2>\s*<div class="txd">)/, '</p><div class="operation_div" style="display:none;"></div><br></div></li>$1')
                                .replace(/<\/h3><\/span>/g, '</h4></span><p>')
                                .replace(/<h3>/g, '<h4>')
                                .replace(/(<span class="wrap">)/g, '</p><div class="operation_div" style="display:none;"></div><br></div></li>' +
                                '<li class="clearfix"><div class="reply-doc">$1'));

        $('.piir').append(comments);
        //将第一个元素替换为换行
        comments.find('li').first().replaceWith('<br>');
        comments.delegate('li', 'mouseover', function() {
            var toolbar = this.querySelector('div.operation_div');
            toolbar && (toolbar.style.display = 'block');
        });
        comments.delegate('li', 'mouseout', function() {
            var toolbar = this.querySelector('div.operation_div');
            toolbar && (toolbar.style.display = 'none');
        });
    },

    load : function() {
        //这里注册的事件同样适用于楼主工具条。
        var that = this;
        body.bind('MonkeyComment', function(e, actionName, context) {
            monkeyCommentToolbox[actionName] && monkeyCommentToolbox[actionName](context.parentNode.getAttribute('monkey-data'), context);
        });

        this.prepare();
        this.render();

        MonkeyBean.TM.get('MonkeyPosterToolbar').load(this.get('index'));
        body.bind('loadPage', function() {
            that.prepare();
            that.render();
        });
    },

    render : function() {
        var tmp1 = null
            tmp2 = null,
            userId = '',
            nickName = '',
            items = this.get('items'),
            start = this.get('start'),
            len = this.get('length'),
            i = start,
            itemId = '';

        GM_addStyle(this.css);
        for(; i<len; i++) {
            tmp1 = items.eq(i);

            tmp1.find(this.get('floor'))
                .append('<span class="Monkey-floor">' + (i + 1) + '楼</span>');
            tmp2 = tmp1.find('a img').length > 0 ? tmp1.find('a')[1] : tmp1.find('a')[0];

            userId = tmp2.href.replace('http://www.douban.com/people/', '').split('/')[0];
            nickName = tmp2.innerHTML;

            tmp1.attr('monkey-sign', userId);

            (itemId = tmp1.attr('id')) === '' && (tmp1.attr('id', itemId = MonkeyBean.CommentId()));
            //log('-----' + itemId + '----' + tmp.attr('id'));
            //monke-data中保存的数据：用户ID，用户昵称，该条留言的ID
            //log(this.el[3]);
            tmp2 = tmp1.find(this.get('commentTool'));
            tmp2.append(this.html.replace('{1}', userId + MonkeyBeanConst.DATA_SPLITER + nickName + MonkeyBeanConst.DATA_SPLITER + itemId));
            //tmp2.parent().hover(function() {
            tmp1.hover(function() {
                //$(this).find('[name=monkey-commenttool]').css('visibility', 'visible');
                $(this).find('div.operation_div').css('display', 'block');
            }, function() {
                $(this).find('div.operation_div').css('display', 'none');
                //$(this).find('[name=monkey-commenttool]').css('visibility', 'hidden');
            });
        }
    }
});