/**
    * 猴子相册——增强豆瓣相册浏览
    * updateTime : 2012-5-28
    */
   MonkeyModule('MonkeyPic', {
       css : '#MonkeyBeanPicFrame{\
                position: absolute;\
                top: 20px;\
                left: 10%;\
                z-index: 20;\
                width: 1100px;\
                display: none;\
             }\
             .MonkeyBean-PicComment{\
                float: right;\
                width: 400px;\
                background-color: #fff;\
                overflow: auto;\
                height: 500px;\
                padding: 20px;\
             }\
             .MonkeyBean-Pic {\
                float: left;\
                width: 590px;\
                margin-right: 10px;\
                height: 500px;\
                background-color: #fff;\
             }',

       html : {
           'button' : '<span class="MonkeyBean-Button" href="javascript:void 0;" monkey-action="MonkeyBean.Pic" style="float:left">开启增强浏览模式</span>',
           'frame' : '<div id="MonkeyBeanPicFrame">\
                           <div class="MonkeyBean-Pic"></div>\
                           <div class="MonkeyBean-PicComment"></div>\
                       </div>'
       },

       on : false,

       fit : function() {
           //翻页类型是photo就认为是相册页面
           return MonkeyBean.page.turnType == 'photo';
       },

       load : function() {
           this.overlay = MonkeyBean.TM.get('overlay');
           this.render();
           body.bind('MonkeyBean.Pic', $.proxy(this.turnOnOrOff, this));
           body.bind('MonkeyBean.HideOverlay', $.proxy(this.closeFrame, this));

           //大图http://img3.douban.com/view/photo/photo/public/p1450859575.jpg
           //小图http://img3.douban.com/view/photo/thumb/public/p1450859575.jpg
       },

       render : function() {
           var html = this.html;
           GM_addStyle(this.css);
           this.button = $(html.button);
           this.frame = $(html.frame);
           this.comments = this.frame.find('.MonkeyBean-PicComment'); //留言
           this.pic = this.frame.find('.MonkeyBean-Pic');
           this.wrapper = $('.article');
           $('.photitle').prepend(this.button);
           body.append(this.frame);
       },

       turnOnOrOff : function() {
           this.on = !this.on;
           if(this.on) {
               this.button.html('开启增强浏览模式');
               this.wrapper.undelegate('a', 'click');
           } else {
               this.button.html('关闭增强浏览模式');
               this.wrapper.delegate('a', 'click', $.proxy(this.loadPic, this));
           }
       },
        //加载图片
       loadPic : function(e) {
           console.log(e);
           var that = this;
           var tar = e.currentTarget;
           var href = tar.href;
           this.overlay.show();

           $.ajax({
               url : href,
               success : function(resp) {
                   var html = MonkeyBean.filterJS(resp);
                   var tmp = MonkeyBean.tempIframe;
                   //console.log(html);
                   var comments;
                   tmp.html(html);
                   tmp = tmp.find('.article');
                   comments = tmp.find("#comments");
                   console.log('Comment Height=' + comments.outerHeight());
                   that.setPicture(tmp);
                   that.setComments(comments.html());
                   that.showFrame();
                   MonkeyBean.tempIframe.remove();
                   that.showFrame();
               }
           });

           return false;
       },

       //设置图片
       setPicture : function(el) {
           var pl = el.find('.pl');
           var nextEl = pl.next();
           this.pic.html(pl.html() + nextEl.html());
           console.log('Picture Height=' + nextEl.find('img').height());
       },

       //设置留言
       setComments : function(html) {
           this.comments.html(html);
       },

       closeFrame : function() {
           this.frame.hide();
       },

       showFrame : function() {
           this.frame.show();
       }
   });