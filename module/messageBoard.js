//未完成
/**
 * 留言板，增加回复功能
 * 适用页面：个人主页与留言板页
 * updateTime : 2012-2-19
 */
    //TODO:未完成
MonkeyModule('MonkeyMessageBoard', {
    //TODO：<span class="gact">
    html:{
        'doumail' : '&nbsp; &nbsp; <a href="/doumail/write?to={1}">回豆邮</a>',
        'reply' : '&nbsp; &nbsp; <a href="JavaScript:void(0);" monkey-data="{1}' + MonkeyBeanConst.DATA_SPLITER + '{2}" title="回复到对方留言板">回复</a>',
        'form' : '<form style="margin-bottom:12px" id="fboard" method="post" name="bpform">\
                     <div style="display:none;"><input type="hidden" value="' + MonkeyBean.getCk() + '" name="ck"></div>\
                     <textarea style="width:97%;height:50px;margin-bottom:5px" name="bp_text"></textarea>\
                     <input type="submit" value=" 留言 " name="bp_submit">\
                     <a href="javascript:void(0);" id="monkey_resetBtn" style="float:right;display:none;">点击恢复原状</a>\
                 </form>'
    },

    filter : /www.douban.com\/(people\/.+\/)(board)$/,

    el : $('ul.mbt'),

    load : function () {
        return true;
        this.render();
    },

    render : function () {
        this.form = $(this.html['form']);
        this.form.insertBefore(this.el);
        this.resetBtn = $('#monkey_resetBtn');
        this.resetBtn.bind('click', $.proxy(this.reset, this));
        this.bind('reply', this.reply, this);

        if (!this.el || (this.el = this.el.find('li.mbtrdot')).length < 1) return;
        var len = this.el.length,
            i = 0,
            that = this,
            id,
            nickName,
            tmp;
        for (; i < len; i++) {
            tmp = this.el[i];
            var tempVar = tmp.getElementsByTagName('a')[0];
            nickName = tempVar.innerHTML;
            tempVar.href.match(people);
            id = RegExp.$1;
            if (id != 'sunnylost') {
                tmp = tmp.getElementsByTagName('span');
                if (tmp.length == 1) {
                    tmp[0].parentNode.innerHTML += '<br/><br/><span class="gact">' + (this.html['doumail'] + this.html['reply']).replace(/\{1\}/g, id).replace('{2}', nickName) + '</span>';
                } else if (tmp.length == 2) {
                    tmp[1].innerHTML += this.html['reply'].replace(/\{1\}/g, id).replace('{2}', nickName);
                }

            }
        }
        this.el.delegate('a[monkey-data]', 'click', function () {
            that.trigger('reply', $(this).attr('monkey-data'));
        });
    },

    //TODO:点击回复按钮时，应该可以回复到对方留言板
    reply : function (userMsg) {
        var tmpArr = userMsg.split(MonkeyBeanConst.DATA_SPLITER);
        this.form.find('[type="submit"]').val('回复到的' + tmpArr[1] + '的留言板');
        this.form.attr('action', 'http://www.douban.com/people/' + tmpArr[0] + '/board');
        this.resetBtn.css('display', 'block');
    },

    reset : function () {
        this.form.find('[type="submit"]').val('回复');
        this.form.attr('action', '');
        this.resetBtn.css('display', 'none');
    }
});

