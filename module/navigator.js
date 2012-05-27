

var unreadDouMail = $('.top-nav-info em').html();  //未读豆邮
unreadDouMail = unreadDouMail == null ? '' : unreadDouMail;
/**
 * 猴子导航栏——用于显示顶部导航栏的二级菜单
 * updateTime : 2012-4-24
 */
MonkeyModule('MonkeyNavigator', {
    css : '.Monkey-Nav-top {\
            clear: both;\
            color: #D4D4D4;\
            height: 30px;\
            margin-bottom: 20px;\
            width: 100%;\
        }\
        .Monkey-Nav-top a:link, .Monkey-Nav-top a:visited, .Monkey-Nav-top a:hover, .Monkey-Nav-top a:active {\
            color: #566D5E;\
        }\
        .Monkey-Nav-top a:hover {\
            color : #566D5E;\
            background-color : #fff;\
        }\
        .Monkey-Nav-top em {\
            color: #1398B0;\
        }\
        .Monkey-Nav-bd {\
            position : fixed;\
            left : {left}px;\
            height : 35px;\
            width : 950px;\
            z-index : 1000;\
            padding-top : 7px;\
            margin-top : -4px;\
            background-color : #E9F4E9;\
            border-radius : 3px;\
        }\
        .Monkey-Nav{\
            display:block;\
            font-size: 12px;\
            margin-left : 15px;\
        }\
        .Monkey-Nav ul, .Monkey-Nav li {\
            text-align : center;\
            margin : 0;\
            padding : 0;\
        }\
        .Monkey-Nav ul li ul li {\
            text-align : center;\
            width : 60px;\
        }\
        .Monkey-Nav:after .Monkey-Nav li ul:after{\
            clear: both;\
            content: " ";\
            display: block;\
            height: 0;\
        }\
        .Monkey-Nav ul li{\
            float : left;\
            height : 26px;\
            line-height : 26px;\
            width : 60px;\
            position : relative;\
            padding : 0;\
        }\
        .Monkey-Nav ul li ul {\
            position : absolute;\
            top : 26px;\
            width : 60px;\
            background-color : #E9F4E9;\
            z-index : 100;\
            display : none;\
        }\
        .Monkey-Nav ul li:hover ul {\
            display : block;\
        }\
        .Monkey-Nav ul li ul a:hover {\
            background-color : #0C7823;\
            padding : 0 5px;\
            color : #fff;\
        }\
        .Monkey-Nav li ul li {\
            float: none;\
            height: 26px;\
            line-height: 26px;\
            padding : 0;\
        }\
        .Monkey-Setting {\
            float : right;\
            padding-left : 20px;\
            margin : 0;\
        }\
        .Monkey-Setting ul li, .Monkey-Setting ul li ul, .Monkey-Setting ul li ul li {\
            width : 80px;\
        }\
        .Monkey-Nav-Search {\
            background: url("/pics/nav/ui_ns_sbg4.png") no-repeat scroll 0 0 transparent;\
            float: right;\
            height: 30px;\
            padding-left: 5px;\
        }\
        .Monkey-Nav-Search form {\
            background: url("/pics/nav/ui_ns_sbg4.png") no-repeat scroll 100% 0 transparent;\
            height: 30px;\
            padding: 0 1px 0 0;\
            width : 260px;\
        }\
        .Monkey-Nav-Search inp {\
            width : 300px;\
            padding-top : 5px;\
        }\
        .Monkey-Nav-Search input {\
            background: none repeat scroll 0 0 #FFFFFF;\
            border: 1px solid #A6D098;\
            float: left;\
            height: 26px;\
            line-height: 26px;\
            padding: 0 2px;\
            width: 300px;\
        }\
        .Monkey-Nav-Search input.text {\
            border: 1px solid #DCDCDC;\
            border-radius: 5px;\
            height: 1em;\
            line-height: 1;\
            padding: 8px 6px;\
            width: 260px;\
        }\
        .Monkey-Nav-Search .bn-srh {\
            background: url("/pics/nav/ui_ns_sbg4.png") no-repeat scroll -191px -100px transparent;\
            border: 0 none;\
            cursor: pointer;\
            height: 23px;\
            margin-left: -28px;\
            overflow: hidden;\
            text-indent: -100px;\
            width: 23px;\
        }\
        .Monkey-ext-btn {\
            color : #0C7823;\
            background-color : #E9F4E9;\
            cursor : pointer;\
            border-radius : 3px;\
            position : relative;\
            width : 275px;\
            top : -3px;\
            display : none;\
            float : left;\
        }\
        .Monkey-ext-btn div {\
            float : left;\
            padding : 5px 15px;\
            margin : 0 0 2px;\
            background-color : #E9F4E9;\
        }\
        .Monkey-ext-btn div:hover {\
            background-color : #fff;\
            border-bottom:1px solid #dcdcdc;\
            border-left:1px solid #dcdcdc;\
            border-right:1px solid #dcdcdc;\
        }\
        .Monkey-Nav-Search:hover .Monkey-ext-btn {\
            display : block;\
        }',

    html:'<div class="Monkey-Nav-top">\
               <div class="Monkey-Nav-bd">\
                   <div class="Monkey-Nav Monkey-Setting">\
                        <ul>\
                            <li>\
                                <a href="http://www.douban.com/accounts/" target="_blank">我的帐号<em>' + unreadDouMail + '</em></a>\
                                <ul>\
                                    <li><a href="http://www.douban.com/doumail/">豆邮<em>' + unreadDouMail + '</em></a></li>\
                                    <li><a href="javascript:void(0);" monkey-action="MonkeyConfig.config" title="MonkeyBean插件设置">MonkeyBean</a></li>\
                                    <li><a href="http://www.douban.com/accounts/logout?ck=' + MonkeyBean.getCk() + '">退出</a></li>\
                                </ul>\
                            </li>\
                        </ul>\
                   </div>\
                   <div class="Monkey-Nav-Search">\
                           <form action="/search" method="get" name="ssform" id="Monkey-Search-Form">\
                               <div class="inp">\
                                   <span>\
                                        <input type="text" value="" class="text" maxlength="60" size="22" placeholder="" title="" name="search_text" style="color: rgb(212, 212, 212);">\
                                    </span>\
                                   <span>\
                                        <input type="submit" value="搜索" class="bn-srh"/>\
                                        <div title="双击：立即搜索；单击：选择搜索范围" class="Monkey-ext-btn">\
                                                <div monkey-data="www" monkey-action="search">社区</div>\
                                                <div monkey-data="book" monkey-action="search">读书</div>\
                                                <div monkey-data="movie" monkey-action="search">电影</div>\
                                                <div monkey-data="music" monkey-action="search">音乐</div>\
                                                <div monkey-data="location" monkey-action="search">同城</div>\
                                                <input type="hidden" value="" name="cat">\
                                                <input type="hidden" value="' + (userLocation || 'location') + '" name="loc">\
                                        </div>\
                                   </span>\
                               </div>\
                           </form>\
                       </div>\
                   <div class="Monkey-Nav" style="float:left;">\
                        <ul>\
                            <li name="Monkey-Nav-mine">\
                                <a href="http://www.douban.com/mine">我的豆瓣</a>\
                                <ul>\
                                    <li><a href="http://www.douban.com/people/' + userName + '/notes">日记</a></li>\
                                    <li><a href="http://www.douban.com/people/' + userName + '/photos">相册</a></li>\
                                    <li><a href="http://www.douban.com/mine/discussions">讨论</a></li>\
                                    <li><a href="http://www.douban.com/people/' + userName + '/recs">推荐</a></li>\
                                    <li><a href="http://www.douban.com/people/' + userName + '/favorites">喜欢</a></li>\
                                    <li><a href="http://www.douban.com/people/' + userName + '/miniblogs">广播</a></li>\
                                    <li><a href="http://www.douban.com/people/' + userName + '/offers">二手</a></li>\
                                    <li><a href="http://www.douban.com/mine/doulists">豆列</a></li>\
                                    <li><a href="http://www.douban.com/people/' + userName + '/board">留言板</a></li>\
                                    <li><a href="http://www.douban.com/settings/">设置</a></li>\
                                </ul>\
                            </li>\
                            <li name="Monkey-Nav-www">\
                                <a href="http://www.douban.com/">豆瓣社区</a>\
                                <ul>\
                                    <li><a href="http://www.douban.com/">豆瓣猜</a></li>\
                                    <li><a href="http://www.douban.com/update/">友邻广播</a></li>\
                                    <li><a href="http://www.douban.com/mine/">我的豆瓣</a></li>\
                                    <li><a href="http://www.douban.com/group/">我的小组</a></li>\
                                    <li><a href="http://www.douban.com/site/">我的小站</a></li>\
                                </ul>\
                            </li>\
                            <li name="Monkey-Nav-book">\
                                <a href="http://book.douban.com/">豆瓣读书</a>\
                                <ul>\
                                    <li><a href="http://book.douban.com/mine">我读</a></li>\
                                    <li><a href="http://book.douban.com/updates">动态</a></li>\
                                    <li><a href="http://book.douban.com/recommended">豆瓣猜</a></li>\
                                    <li><a href="http://book.douban.com/chart">排行榜</a></li>\
                                    <li><a href="http://book.douban.com/tag/">分类浏览</a></li>\
                                    <li><a href="http://book.douban.com/review/best/">书评</a></li>\
                                    <li><a href="http://read.douban.com/">阅读</a><img src="http://img3.douban.com/pics/new_menu.gif" style="top: 4px; position: absolute;"></li>\
                                    <li><a href="http://book.douban.com/cart">购书单</a></li>\
                                </ul>\
                            </li>\
                            <li name="Monkey-Nav-movie">\
                                <a href="http://movie.douban.com/">豆瓣电影</a>\
                                <ul>\
                                    <li><a href="http://movie.douban.com/mine">我看</a></li>\
                                    <li><a style="color:#FF9933;" href="http://movie.douban.com/nowplaying/' + (userLocation || 'location') + '/">影讯</a></li>\
                                    <li><a href="http://movie.douban.com/celebrities/">影人</a></li>\
                                    <li><a href="http://movie.douban.com/tv/">电视剧</a></li>\
                                    <li><a href="http://movie.douban.com/chart/">排行榜</a></li>\
                                    <li><a href="http://movie.douban.com/tag/">分类</a></li>\
                                    <li><a href="http://movie.douban.com/review/best/">影评</a></li>\
                                </ul>\
                            </li>\
                            <li name="Monkey-Nav-music">\
                                <a href="http://music.douban.com/">豆瓣音乐</a>\
                                <ul>\
                                    <li><a href="http://music.douban.com/artists/">音乐人</a></li>\
                                    <li><a href="http://music.douban.com/chart">排行榜</a></li>\
                                    <li><a href="http://music.douban.com/tag/">分类浏览</a></li>\
                                    <li><a href="http://music.douban.com/mine">我的音乐</a></li>\
                                    <li><a target="blank" href="http://douban.fm/">豆瓣FM</a></li>\
                                </ul>\
                            </li>\
                            <li name="Monkey-Nav-location">\
                                <a href="http://www.douban.com/location/">豆瓣同城</a>\
                                <ul>\
                                    <li><a href="http://www.douban.com/events">同城活动</a></li>\
                                    <li><a href="http://' + userLocation + '.douban.com/hosts">主办方</a></li>\
                                    <li><a href="http://www.douban.com/location/mine">我的同城</a></li>\
                                </ul>\
                            </li>\
                            <li name="Monkey-Nav-fm">\
                                <a target="_blank" href="http://douban.fm/">豆瓣FM</a>\
                                <ul>\
                                    <li><a href="http://douban.fm/mine" target="_blank">我的电台</a></li>\
                                    <li><a href="http://douban.fm/app" target="_blank">应用下载</a></li>\
                                </ul>\
                            </li>\
                            <li name="Monkey-Nav-9">\
                                <a target="_blank" href="http://9.douban.com">九点</a>\
                                <ul>\
                                    <li><a href="http://9.douban.com/channel/culture">文化</a></li>\
                                    <li><a href="http://9.douban.com/channel/life">生活</a></li>\
                                    <li><a href="http://9.douban.com/channel/fun">趣味</a></li>\
                                    <li><a href="http://9.douban.com/channel/technology">科技</a></li>\
                                    <li><a href="http://9.douban.com/reader/">我的订阅</a></li>\
                                </ul>\
                            </li>\
                            <li name="Monkey-Nav-alphatown">\
                                <a target="_blank" href="http://alphatown.com/">阿尔法城</a>\
                            </li>\
                        </ul>\
                   </div>\
                </div>\
            </div>',

    el : $('div.top-nav'),

    fit : function() {
        var type = MonkeyBean.page.type;
        return type != 'fm' && type != '9' && type != 'alpha';
    },

    load : function() {
        //在未登录的状态下，首页不显示导航栏
        if(window.location.href == MonkeyBeanConst.DOUBAN_MAINPAGE && !MonkeyBean.isLogin()) return false;

        var that = this,
            pageType = MonkeyBean.page.type;


        this.render(pageType);
        this.form = $('#Monkey-Search-Form');
        this.input = this.form.find('[name="search_text"]');
        this.cat = this.form.find('[name="cat"]');
        this.navBd = $('.Monkey-Nav-bd'); //用于设置导航栏位置

        this.input.val(query['search_text'] || '');  //设置搜索框的默认值

        pageType == 'movie' && this.suggest();  //影视搜索提示

        this.form.delegate('[monkey-action]', 'click', function(e) {
            var target = e.target,
                 type = target.getAttribute('monkey-data'),
                 data = MonkeyBeanConst.SEARCH_INPUT[type];
            that.search(data);
            if(that.lastClick) {
                that.lastClick.style.cssText = '';
            }
            target.style.cssText = 'background-color : #fff;\
                            border-bottom:1px solid #dcdcdc;\
                            border-left:1px solid #dcdcdc;\
                            border-right:1px solid #dcdcdc;';
            that.lastClick = target;
        });
        this.form.delegate('[monkey-action]', 'dblclick', function(e) {
            var type = e.target.getAttribute('monkey-data'),
                 data = MonkeyBeanConst.SEARCH_INPUT[type];
            that.search(data);
            that.form[0].submit();
        });

        this.search(MonkeyBeanConst.SEARCH_INPUT[pageType]);

        $(window).resize(function() {
            that.navBd.css('left',that.navWidth());
        })
    },

    render : function(type) {
        GM_addStyle(this.css.replace('{left}', this.navWidth()));
        //console.log($('.top-nav-info em').html());
        this.el.replaceWith(this.html);
        $('[name=Monkey-Nav-' + type + ']').addClass('on');
        $('.nav-srh').hide();//隐藏原始的搜索栏
    },

    search : function(data) {
        this.form.attr('action', data.url);
        this.cat.val(data.cat);
        this.input.attr('placeholder', data.placeholder);
    },

    //影视搜索的提示功能，iSuggest为豆瓣写的jQuery插件
    //TODO 切换到其他类型时，该功能依然有效。
    suggest : function() {
        this.input.iSuggest({
            api: '/j/subject_suggest',
            tmplId: 'suggResult',
            item_act: function(item){
                window.location = item.data("link");
            }
        });
    },

    //根据窗口大小来改变导航栏左边的距离
    navWidth : function() {
        //TODO 频繁访问offsetWidth，是否会有问题？
        var bodyWidth = document.body.offsetWidth; //body宽度，用于计算导航栏的位置
        return (bodyWidth / 2 - 475); //导航栏宽度为950
    }
});