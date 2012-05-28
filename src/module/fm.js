/**
     *  猴子FM，豆瓣FM的下载、播放列表功能
     *  updateTime : 2012-3-13
     */
    MonkeyModule('MonkeyFM', {
        css : '',

        html : '<div>\
                </div>',

        fit : function() {
            return MonkeyBean.page.type == 'fm'
        },

        load : function() {
            var that = this,
                fm_js = /http:\/\/\w+\.douban\.com\/js\/radio\/packed_fm_player\d+\.js/;

            $(document.head).on('DOMNodeInserted', function(e) {
                if(fm_js.test(e.target.src)) {                  //判断js是否加载
                    setTimeout(function() {
                        eval('\
                            unsafeWindow._extStatusHandler = unsafeWindow.extStatusHandler;\
                            log(unsafeWindow.extStatusHandler);\
                            unsafeWindow.extStatusHandler = function(o) {\
                                unsafeWindow._extStatusHandler(o);\
                                that.fm(o);\
                        }')
                    }, 1000)
                }
            })
        },

        fm : function(o) {
            o = eval('(' + o + ')');
            console.dir(o);
            //log('--------------------------------------------');
        }
    });