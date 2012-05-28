
/**
 * 楼主工具条——依赖于下面的回复增强模块
 * updateTime：2012-2-27
 */
MonkeyModule('MonkeyPosterToolbar', {
    html : '<div style="margin-bottom:10px;font-size: 14px;">\
                <span monkey-data="{1}">\
                    <span monkey-action="MonkeyComment" monkey-action-name="reply" rel="nofollow" title="回复楼主发言" class="Monkey-Button">回复</span>\
                    <span monkey-action="MonkeyComment" monkey-action-name="only" rel="nofollow" title="只看楼主的发言" class="Monkey-Button">只看</span>\
                    <span monkey-action="MonkeyComment" monkey-action-name="highlight" rel="nofollow" title="高亮楼主的所有发言" class="Monkey-Button">高亮</span>\
                    <span monkey-action="MonkeyComment" monkey-action-name="ignore" rel="nofollow" title="忽略楼主的所有发言" class="Monkey-Button">忽略</span>\
                    <span monkey-action="MonkeyComment" monkey-action-name="reset" rel="nofollow" title="还原到原始状态" class="Monkey-Button">还原</span>\
                </span>\
            </div>',

    fit : function() {
        return false;
    },

    els : [
        [$('div.topic-doc a')[0], $('div.topic-opt')],   //第一个包含了楼主的ID，第二个是插入工具条的位置
        [$('span.pl2 a')[0], $('div.review-panel')],
        [$('span.pl2 a')[0], $('div.review-stat')]
    ],

    load : function(index) {
        this.el = this.els[index];

        if(index === undefined ||  typeof this.el === 'undefined' || typeof this.el[0] === 'undefined') return false;

        var posterId = this.el[0].href.replace('http://www.douban.com/people/', '').split('/')[0],
            posterNickName = this.el[0].textContent;
        this.set({
            'posterId' : posterId,
            'posterNickName' : posterNickName
        });
        this.render();
    },

    render : function() {
        GM_addStyle(MonkeyBean.UI.css.button);
        this.el[1] && (this.el[1].prepend(this.html.replace('{1}', this.get('posterId') + MonkeyBeanConst.DATA_SPLITER + this.get('posterNickName'))));
    }
});