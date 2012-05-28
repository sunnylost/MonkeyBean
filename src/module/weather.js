/**
     * 天气模块
     * updateTime : 2012-3-10
     */
    MonkeyModule('MonkeyWeather', {
        attr : {
            url : 'http://www.google.com/ig/api?weather={1}&hl=zh-cn'
        },

        filter : /www.douban.com\/(mine|(people\/.+\/)$)/,

        css : '.Monkey-Weather{position:relative;top:10px;}',

        html : '<div class="Monkey-Weather">\
                    <div style="float:left;margin-right:10px;">\
                        <img height="40" width="40" alt="{1}" src="http://g0.gstatic.com{2}">\
                        <br>\
                    </div>\
                    <span><strong>{3}</strong></span>\
                    <span>{4}℃</span>\
                    <div style="float:">当前：&nbsp;{1}\
                    </div>\
                </div>',

        el : $('#profile'),

        load : function() {
            this.fetch();
        },

        fetch : function() {
            var place = $('.user-info > a'),
                a,
                that = this;
            if(!place || !$.trim(place.text())) return;
            a = place.attr('href').match(/http:\/\/(.*)\.douban\.com/);
            place = place.text();

            GM_xmlhttpRequest({
                method : 'GET',
                url : this.get('url').replace('{1}', RegExp.$1),
                headers :  {
                    Accept: 'text/xml'
                },
                onload : function(resp) {
                    var xml = $(resp.responseText);

                    that.set({
                        condition : xml.find('condition').attr('data'),
                        icon : xml.find('icon').attr('data'),
                        temp : xml.find('temp_c').attr('data'),
                        place : place
                    });
                    that.render();
                }
            });
        },

        render : function() {
            if(!this.el) return;
            GM_addStyle(this.css);
            var container = $(this.html.replace(/\{1\}/g, this.get('condition'))
                .replace('{2}', this.get('icon'))
                .replace('{3}', this.get('place'))
                .replace('{4}', this.get('temp')));
            container.insertBefore(this.el);
        }
    });