/*********************************Common Function****************************************************************/
    /**
     * 通用留言工具函数
     * updateTime : 2012-2-21
     */
    var monkeyCommentToolbox = {
        //快捷回复
        reply : function(data, el) {
            var form = MonkeyBean.TM.get('reply');
            form.show();
            form.setContent('@' + data.split(MonkeyBeanConst.DATA_SPLITER)[1] + '\n');
        },
        //引用用户发言
        quote : function(data) {
            var commentId = data.split(MonkeyBeanConst.DATA_SPLITER)[2],
                comment = null,
                quoteHeader = '',
                quoteContent = '',
                spliter = '-------------------------------------------------------------------\n';
            //log('-----=====' + commentId);
            comment = $('#' + commentId);
            quoteHeader = comment.find('h4').text().replace(/\s+/g, ' ') + '\n';
            quoteContent = comment.find('.reply-doc p').text() + '\n';
            //log(quoteHeader);
            //log(quoteContent);
            MonkeyBean.TM.get('reply').setContent(spliter + quoteHeader + quoteContent + spliter);
        },
        //只看该用户发言
        only : function(data) {
            var items = this.cache || (this.cache = $('[monkey-sign]')),
                len = items.length,
                i = 0,
                tmp = null;
            while(len--) {
                tmp = items.eq(len);
                tmp.attr('monkey-sign') != data.split(MonkeyBeanConst.DATA_SPLITER)[0] && tmp.hide();
            }
        },
        //高亮该用户所有发言
        highlight : function(data) {
            var items = $('[monkey-sign=' + data.split(MonkeyBeanConst.DATA_SPLITER)[0] + ']'),
                len = items.length,
                tmpColor = '';
            tmpColor = (this.clicked = !this.clicked) ? MonkeyBeanConst.HIGHLIGHT_COLOR : MonkeyBeanConst.BLANK_STR;
            while(len--) {
                items.eq(len).css('backgroundColor', tmpColor);
            }
        },
        //忽略该用户所有发言
        ignore : function(data) {
            var items = $('[monkey-sign=' + data.split(MonkeyBeanConst.DATA_SPLITER)[0] + ']'),
                len = items.length;
            while(len--) {
                items.eq(len).hide();
            }
        },
        //还原为原始状态
        reset : function(data) {
            var items = this.cache || $('[monkey-sign]'),
                len = items.length,
                tmp = null;
            this.clicked = false;  //"高亮"里需要这个参数
            while(len--) {
                tmp = items.eq(len);
                tmp.show();
                tmp.css('backgroundColor', MonkeyBeanConst.BLANK_STR);
            }
        }
    };