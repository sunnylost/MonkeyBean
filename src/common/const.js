/**
 * author:sunnylost
 * 静态变量
 */
/**
     * 静态变量
     */
    var MonkeyBeanConst = {
        PAGE_ITEM_COUNTS : 100,   //每页显示条目

        API_COUNT : 'MonkeyBean.API.count',
        API_LAST_REQUEST_TIME : 'MonkeyBean.API.lastTime',
        API_INTERVAL : 60000, //请求api的间隔
        API_LIMIT : 10,       //在以上间隔内，最多请求次数，默认10次
        API : {                //豆瓣API
            'PEOPLE' : 'http://api.douban.com/people/{1}'  //用户信息
        },

        DATA_SPLITER : '[-]',  //monkey-data中的分隔符

        DOUBAN_MAINPAGE : 'http://www.douban.com/',  //豆瓣主页

        MODULE_NAME_PREFIX : 'MonkeyBean.Module.',

        HIGHLIGHT_COLOR : '#46A36A' , //高亮用户发言的颜色
        BLANK_STR : '',                  //空字符串

        SEARCH_INPUT : {    //搜索框选项
            'www' : {
                'placeholder' : '成员、小组、音乐人、主办方',
                'url' : 'http://www.douban.com/search',
                'cat' : ''
            },
            'movie' : {
                'placeholder' : '电影、影人、影院、电视剧',
                'url' : 'http://movie.douban.com/subject_search',
                'cat' : '1002'
            },
            'book' : {
                'placeholder' : '书名、作者、ISBN',
                'url' : 'http://book.douban.com/subject_search',
                'cat' : '1001'
            },
            'music' : {
                'placeholder' : '唱片名、表演者、条码、ISRC',
                'url' : 'http://music.douban.com/subject_search',
                'cat' : '1003'
            },
            'location' : {
                'placeholder' : '活动名称、地点、介绍',
                'url' : 'http://www.douban.com/event/search',
                'cat' : ''
            }
        },

        USER_NAME : 'monkey.username',
        USER_LOCATION : 'monkey.location'
    };