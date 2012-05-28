
MonkeyBean.UI = {
    css : {
        'button' : '.Monkey-Button {\
                      color : #4F946E;\
                      background-color: #F2F8F2;\
                      border: 1px solid #E3F1ED;\
                      padding : 0 8px;\
                      border-radius : 3px 3px 3px;\
                      cursor : pointer;\
                  }\
                  .Monkey-Button a {\
                      color : #4F946E;\
                      background-color: #F2F8F2;\
                  }\
                  .Monkey-Button:hover, .Monkey-Button:hover a {\
                    background-color: #0C7823;\
                    border-color: #C4E2D8;\
                    color: #FFFFFF;\
                  }',
        //只是向下的箭头
        'arrow' : ' .Monkey-Pointer {\
                        position : absolute;\
                        height : 0;\
                        left : 50px;\
                    }\
                    .Monkey-Pointer-Border {\
                        border: 9px solid;\
                    }\
                    .Monkey-a {\
                        border-color: #BBBBBB transparent transparent;\
                    }\
                    .Monkey-b {\
                        border-color: #FFFFFF transparent transparent;\
                        top: -20px;\
                        position : relative;\
                    }',

        //loading样式来源于http://www.alessioatzeni.com/blog/css3-loading-animation-loop/
        'loading' : '.Monkey-Loading {\
                        background-color: rgba(0,0,0,0);\
                        border:5px solid rgba(255,255,255,0.9);\
                        opacity:.9;\
                        border-left:5px solid rgba(0,0,0,0);\
                        border-right:5px solid rgba(0,0,0,0);\
                        border-radius:50px;\
                        box-shadow: 0 0 15px #fff;\
                        width:10px;\
                        height:10px;\
                        margin:0 auto;\
                        position:relative;\
                        -moz-animation:spinoffPulse 1s infinite linear;\
                        -webkit-animation:spinoffPulse 1s infinite linear;\
                    }\
                    @-moz-keyframes spinoffPulse {\
                        0% { -moz-transform:rotate(0deg); }\
                        100% { -moz-transform:rotate(360deg);  }\
                    }\
                    @-webkit-keyframes spinoffPulse {\
                        0% { -webkit-transform:rotate(0deg); }\
                        100% { -webkit-transform:rotate(360deg); }\
                    }\
                    .Monkey-Loading-stop {\
                        display : none;\
                        -moz-animation-play-state : paused;\
                    }'

    },

    html : {
        'arrow' : '<div class="Monkey-Pointer">\
                    <div class="Monkey-a Monkey-Pointer-Border"></div>\
                    <div class="Monkey-b Monkey-Pointer-Border"></div>\
                </div>'
    }
};

$.each(MonkeyBean.UI.css, function(i, v) {
    GM_addStyle(v);
})

/*********************************UI begin**************************************************************/
    /**
     * 提示便签
     * TODO : 默认3秒的延迟消失，这里的时间应该可以配置
     * updateTime : 2012-3-13
     */
    MonkeyModule('tip', {
        css : '#MonkeyUI-tip {\
                    background-color: #F9EDBE;\
                    border: 1px solid #F0C36D;\
                    -webkit-border-radius: 2px;\
                    -webkit-box-shadow: 0 2px 4px rgba(0,0,0,0.2);\
                    border-radius: 2px;\
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);\
                    font-size: 13px;\
                    line-height: 18px;\
                    padding: 16px;\
                    position: absolute;\
                    vertical-align: middle;\
                    width: 160px;\
                    z-index: 6000;\
                    border-image: initial;\
                    display:none;\
                }\
                #MonkeyUI-tip .Monkey-Pointer {\
                    top : 95px;\
                }\
                #MonkeyUI-tip .Monkey-a {\
                    border-color : #F0C36D transparent transparent;\
                }\
                #MonkeyUI-tip .Monkey-b {\
                    border-color : #F9EDBE transparent transparent;\
                }',

        html : '<div id="MonkeyUI-tip">\
                    <p name="MonkeyUI-tip-content"></p>\
                    <a href="javascript:void(0)" style="position:relative;left:45%;" monkey-action="TipClose" >关闭</a>\
                    ' + MonkeyBean.UI.html.arrow +
                '</div>',

        load : function() {
            var that = this;
            this.render();
            body.bind('TipClose', function() {
                that.hide();
            })
        },

        render : function() {
            this.el = $(this.html);
            this.content = this.el.find('p[name=MonkeyUI-tip-content]');
            document.body.appendChild(this.el[0]);
            GM_addStyle(this.css);
            GM_addStyle(MonkeyBean.UI.css.arrow);
        },

        show : function(msg, pos) {
            var that = this;
            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(function() {
                that.hide();
            }, 3000);
            this.content.html(msg);
            this.el.css({
                'left' : pos.left + 'px',
                'top' : pos.top + 'px'
            })
            this.el.fadeIn();
        },

        hide : function() {
            clearTimeout(this.timeoutId);
            this.el.fadeOut();
        }

    });

    /**
     * 回复框
     * updateTime : 2012-2-19
     */
    MonkeyModule('reply', {
        css : '#Monkey-ReplyForm{\
                -moz-border-bottom-colors: none;\
                -moz-border-image: none;\
                -moz-border-left-colors: none;\
                -moz-border-right-colors: none;\
                -moz-border-top-colors: none;\
                background-color: #FFFFFF;\
                border-color: #ACACAC #ACACAC #999999;\
                border-style: solid;\
                border-width: 1px;\
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);\
                color: #000000;\
                outline: 0 none;\
                z-index: 1101;\
                display : none;\
                height : 320px;\
                width : 350px;\
                position: fixed;\
                left : 60%;\
                top : 20%;\
            }\
            #Monkey-ReplyToolbox {\
                position : absolute;\
                margin-left : 15px;\
                text-align : center;\
                padding-bottom : 2px;\
                left : 60px;\
                bottom : 2px;\
                height : 25px;\
            }\
            #Monkey-ReplyText {\
                position : absolute;\
                top : 2px;\
                height : 85%;\
                width : 99%;\
                padding : 2px 3px 0 3px;\
            }\
            #Monkey-ReplyText textarea {\
                font-size: 12px;\
                width : 96%;\
                height : 100%;\
                padding : 2px;\
                margin : 3px;\
            }\
            .Monkey-FormButton {\
                background-color: #3FA156;\
                border: 1px solid #528641;\
                border-radius: 3px 3px 3px 3px;\
                color: #FFFFFF;\
                cursor: pointer;\
                height: 25px;\
                padding: 5px 10px 6px;\
            }\
            .Monkey-FormButton:hover {\
                background-color: #4FCA6C;\
                border-color: #6AAD54;\
            }\
            .Monkey-FormButton-flat {\
                border-color: #BBBBBB #BBBBBB #999999;\
                border-radius: 3px 3px 3px 3px;\
                border-style: solid;\
                border-width: 1px;\
                color: #444444;\
                display: inline-block;\
                overflow: hidden;\
                vertical-align: middle;\
            }\
            .Monkey-FormButton-flat input {\
                background-image: -moz-linear-gradient(-90deg, #FCFCFC 0pt, #E9E9E9 100%);\
                border: 0 none;\
                border-radius: 2px 2px 2px 2px;\
                color: #333333;\
                cursor: pointer;\
                font-size: 12px;\
                height: 25px;\
                margin: 0 !important;\
                padding: 0 14px;\
            }\
            .Monkey-FormButton-flat:hover {\
                border-color: #999999 #999999 #666666;\
                color: #333333;\
            }',

        html : '<div id="Monkey-ReplyForm">\
                    <form name="comment_form" method="post" action="add_comment">\
                        <div style="display: none;">\
                            <input name="ck" value="' + MonkeyBean.getCk() + '" type="hidden">\
                        </div>\
                        <div id="Monkey-ReplyText">\
                            <textarea id="re_text" name="rv_comment" rows="10" cols="40">\
                            </textarea>\
                        </div>\
                        <div id="Monkey-ReplyToolbox">\
                            <input value="加上去" type="submit" monkey-action="submit" class="Monkey-FormButton">\
                            <span class="Monkey-FormButton-flat">\
                                <input value="清空" type="button" monkey-action="reset" class="Monkey-FormButton-flat">\
                            </span>\
                            <span class="Monkey-FormButton-flat">\
                                <input value="取消" type="button" monkey-action="cancel" class="Monkey-FormButton-flat">\
                            </span>\
                        </div>\
                    </form>\
                </div>',

        load : function() {
            //log('loading reply');
            this.render();
        },

        render : function() {
            var that = this;
            GM_addStyle(this.css);
            this.form = $(this.html);
            this.form.appendTo(document.body);
            this.text = $('#Monkey-ReplyForm #re_text');
            this.text.val('');  //默认光标会出现在textare的第一行正中间，手动清除一下
            this.form.delegate('input[monkey-action]', 'click', function() {
                that[this.getAttribute('monkey-action')]();
            });
        },

        show : function() {
            this.form.show();
            focusToTheEnd(this.text[0]);
        },

        submit : function() {
            //log('submit');
        },
        //清除回复框中的内容
        reset : function() {
            this.text.val('');
            this.text.focus();
        },
        //隐藏回复框
        cancel : function() {
            this.reset();
            this.form.hide();
        },
        //向文本框中输入内容，如果文本框中有内容，则增加一个换行，再添加新内容
        setContent : function(content) {
            this.show();  //如果不显示，那么执行focusToTheEnd会报错
            var oldContent = this.text.val();
            this.text.val(($.trim(oldContent) == '' ? '' : oldContent + '\n') + content);
            focusToTheEnd(this.text[0]);
        }
    });

    //遮罩
    MonkeyModule('overlay', {
        css : '#Monkey-Overlay {\
                background-color: #ccc;\
                z-index: 10;\
                opacity: 0.7;\
                position: absolute;\
                left: 0;\
                top: 0;\
              }',

        html : '<div id="Monkey-Overlay" monkey-action="overlay"></div>',

        load : function() {
            this.render();
            body.bind('overlay', $.proxy(this.overlay, this));
        },

        render : function() {
            this.el = $(this.html);
            body.append(this.el);
            GM_addStyle(this.css);
            this.isShown = true;
        },

        overlay : function() {
            this.isShown ? this.hide() : this.show();
        },

        show : function() {
            this.el.height(body.height()).width(body.width());
            this.el.show();
            this.isShown = true;
        },

        hide : function() {
            this.el.hide();
            this.isShown = false;
        }

    });


    $.each(MonkeyBean.UI.css, function(i, v) {
        GM_addStyle(v);
    })