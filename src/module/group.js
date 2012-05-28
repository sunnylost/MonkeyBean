
/**
 * 猴子小组模块——包括隐藏小组介绍、加入小组时的分类选择、小组分类
 * updateTime : 2012-2-27
 */
MonkeyModule('MonkeyGroup', {
    css : {
        'sort' : '#Monkey-Group-Btn span {\
                    margin-right : 4px;\
                }\
                .Monkey-Group {\
                    border-radius : 5px;\
                }\
                .Monkey-Group .title{\
                    background-color : #e2e2e2;\
                    height : 20px;\
                    line-height : 20px;\
                    width : 100%;\
                    display: inline-block;\
                    vertical-align: middle;\
                }\
                .Monkey-Group .dissolve {\
                    float : right;\
                    border-radius : 15px;\
                    margin-right : 10px;\
                    cursor : pointer;\
                }\
                .Monkey-Group .dissolve:hover {\
                    background-color : #FF7676\
                }'
    },

    html : {
        'toggle' : '<span class="Monkey-Button" monkey-action="toggleGroupDescription" style="float:right;">\
                        显示小组介绍\
                     </span>',

        'sort' : '<div id="Monkey-Group-Btn">\
                        <span class="Monkey-Button" monkey-action="save" style="float:right;display:none;">\
                            保存分类\
                        </span>\
                        <span class="Monkey-Button" monkey-action="cancel" style="float:right;display:none;" title="放弃本次操作">\
                            放弃\
                        </span>\
                        <span class="Monkey-Button" monkey-action="modify" style="float:right;">\
                            修改分类\
                        </span>\
                        <span class="Monkey-Button" monkey-action="add" style="float:right;">\
                            添加分类\
                        </span>\
                   </div>',

        'groupArea' : '<div class="Monkey-GroupArea"></div>',

        'group' : ' <div class="Monkey-Group">\
                            <div class="title">\
                                <span monkey-action="title">标题(双击修改)</span>\
                                <input type="text" style="display:none;"/>\
                                <span title="解散分组" class="dissolve" monkey-action="dissolve">x</span>\
                            </div>\
                            <div>拖拽小组图标到此区域</div>\
                    </div>'
    },

    fit : function() {
        var path = MonkeyBean.path,
            type = /www\.douban\.com\/group\/([^/]+)\/?$/,
            result = '';

        //小组分类
        if(path == 'www.douban.com/group/mine') {
            this.set('type', 'sort');
            return true;
        }
        //隐藏小组介绍信息
        if(type.test(path)) {
            this.set('type', 'toggle');
            return true;
        }
        return false;
    },

    load : function() {
        var type = this.get('type'),
            that = this;
        this.render(type);

        //初始化事件
        body.bind('toggleGroupDescription', $.proxy(this.toggleGroupDescription, this));


        /*this.el.delegate('span[monkey-action]', 'click', function() {
                        that[this.getAttribute('monkey-action')]();
                    })*/
       /* //开始拖拽
        this.bind('begin', this.begin, this);
        //结束拖拽
        this.bind('end', this.end, this);*/
    },

    render : function(type) {
        var that = this;
        GM_addStyle(MonkeyBean.UI.css.button);

        if(type == 'toggle') {
            var el = $(this.html.toggle);
            $('div.article').prepend(el);
            this.description = $('div.article').find('div.bd');
            this.el = el;
            this.el.clicked = false;
            this.description.hide();
        } else {
            GM_addStyle(this.css.sort);

            var tmp = $('#content .article h2');
            this.el = $(this.html.sort);
            this.el.insertBefore(tmp);
            this.groupArea = $(this.html.groupArea); //用于放置分组区域
            this.groupArea.insertAfter(tmp);
            this.ungrouptArea = $('#content div.obssin dl'); //未分组区域
            this.group = $(this.html.group)[0]; //每一个分组，
        }

    },
    /**
     * 显示/隐藏小组介绍
     */
    toggleGroupDescription : function(e) {
        var flag = (this.el.clicked = !this.el.clicked);
        if(flag) {
            this.el.html('隐藏小组介绍');
            this.description.show();
        } else {
            this.el.html('显示小组介绍');
            this.description.hide();
        }
        return true;
    },

    begin : function() {
        this.isBegin = true;
        this.toggleSaveBtn(true);
        //使未分组区域中的每个dl可以拖拽
        this.ungrouptArea.attr('draggable', true);
        this.ungrouptArea.css('cursor', 'move');
        this.ungrouptArea.each(function() {
            this.ondragstart = function(e) {
                e.dataTransfer.effectAllowed = 'copy'; // only dropEffect='copy' will be dropable
                e.dataTransfer.setData('Text', this.id); // required otherwise doesn't work
            }
        })
    },

    end : function() {
        this.isBegin = false;
        this.toggleSaveBtn(false);
        this.ungrouptArea.attr('draggable', false);
        this.ungrouptArea.css('cursor', '');
        this.ungrouptArea.attr('ondragstart', null);
    },
    /**
     * 增加小组分类
     */
    add : function() {
        !this.isBegin && $.trigger('begin');
        var group = this.group.cloneNode(true);
        this.groupArea.append(group);
        return true;
    },

    /**
     * 修改小组分类
     */
    modify : function() {
        !this.isBegin && $.trigger('begin');
        return true;
    },
    /**
     * 放弃本次操作
     */
    cancel : function() {
        if(confirm('你确定放弃本次操作吗？')) {
            $.trigger('end', false);
        }
        return true;
    },

    /**
     * 保存小组分类
     */
    save : function() {
        $.trigger('end', false);
        return true;
    },
    /**
     * 修改分组标题
     */
    title : function() {

    },
    //显示/隐藏 保存按钮
    toggleSaveBtn : function(flag) {
        this.el.find('[monkey-action=cancel]')[flag ? 'show' : 'hide']();
        this.el.find('[monkey-action=save]')[flag ? 'show' : 'hide']();
    }
});
