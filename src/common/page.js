/**
        TODO:需要重写

     * 页面类型：
           www : 我的豆瓣
           book : 读书
           movie : 电影
           music : 音乐
           location : 同城
           9 : 9点
           fm : FM
           alpha : 阿尔法城

           group : 小组
                topic : 话题
                category : 分类
           discussion : 讨论
           list : 包括豆列、搜索列表
           update : 友邻广播
           photo : 相册

     */
    MonkeyBean.page = (function() {
        var type = '',
            turnType = '', //翻页类型
            path = MonkeyBean.path,
            hostname = location.hostname,
            normalType = /(www|book|movie|music|9)\.douban\.com\/.*/,
            list = /(book|movie|music)\.douban\.com\/(doulist\/\d+)|(subject_search)|(review\/best\/)/,
            group = /www\.douban\.com\/group\/?/,
            topic = /group\/topic\/\d+/,
            discussion = /((group\/[^\/]+)|(subject\/\d+))\/discussion/,
            category = /group\/category\/\d+\//,
            update = /www\.douban\.com\/update\//,
            photo = /^www\.douban\.com\/photos\/album\/\d+\/$/;

        if(hostname == 'douban.fm') {
            type = 'fm';
        } else if(hostname == 'alphatown.com') {
            type = 'alpha';
        } else {
            if(list.test(path)) {
                turnType = 'list';
            }
            type = path.replace(normalType, '$1');
            if(group.test(path)) {
                (topic.test(path) && (turnType = 'topic')) ||
                (discussion.test(path) && (turnType = 'discussion')) ||
                (category.test(path) && (turnType = 'category'));
            } else if(update.test(path)) {
                turnType = 'update';
            } else if(photo.test(path)) {
                turnType = 'photo';
            } else if(discussion.test(path)) {
                turnType = 'discussion';
            } else if(type.indexOf('douban.com') != -1) {
                type = 'location';
            }
        }

        return {
            'type' : type,
            'turnType' : turnType
        };
    })();