//猴子爱问——代码来自于另外一个脚本：爱问共享资料豆瓣插件+，代码风格不统一，暂时不改了
    MonkeyModule('MonkeyIAsk', {
        'fit' : function() {
            var type = MonkeyBean.page.type;
            return (type == 'book' || type == 'movie' || type == 'music') && MonkeyBean.path.indexOf('subject') != -1;
        },

        load : function() {
            this.isakFunction();
        },

        isakFunction : function() {

            var title = $('html head title').text(),
                styleContent = '.douban_iask_format{overflow:hidden; font-size:12px; margin:-10px 0 2px;} ' +
                               '.douban_iask_format li{ float:left; margin:0 2px 0; padding:0 3px 0; border-radius:4px; border:1px solid #ccc; cursor:pointer;}' +
                               '.douban_iask_format li.check {background-color:#a8c598;}',
                keyword1 = title.replace( '(豆瓣)', '' ).trim(),
                keyword2 = encodeURIComponent( keyword1 ),
                formatLabel = '<ul class="douban_iask_format"><li class="check">全部</li><li>TXT</li><li>DOC</li><li>PDF</li><li>PPT</li><li>CHM</li><li>RAR</li><li>EXE</li></ul>',
                format = '',
                html_title = '<div class="da3" style="margin-bottom:0;padding-bottom:10px;overflow: hidden;"><dl><dt style="display:inline;"><img src="http://iask.com/favicon.ico" width="15px;" height="15px;" style="margin-bottom:-2px;" /> <b><a href="http://ishare.iask.sina.com.cn/?from=douban" target="_blank">爱问共享资料</a>推荐：</b></dt><a href="http://ishare.iask.sina.com.cn/upload/?from=douban" target="_blank">我要分享资料</a><dd>最大的中文在线资料分享站，数百万资料免费下载</dd></dl>' + formatLabel + '</div>',
                html_body_start = '<div class="indent" id="db-doulist-section" style="padding-left:5px;border:1px #F4F4EC solid;"><ul class="bs" style="clear:left;">',
                html_body_no = '<li>没有找到相关资料，<a href="http://ishare.iask.sina.com.cn/upload/?from=douban" title="资料上传" target="_blank"><b>立即上传</b></a>即可与豆友们分享！</li>',
                html_body_end = '</ul>',
                html_body_endmore = '<div style="text-align:right; padding:5px 10px 5px 0px;"><a href="http://api.iask.sina.com.cn/api/search2.php?key=' + keyword2 + '&from=douban&format=" target="_blank">更多&hellip;</a></div>',
                html_body_endend = '</div>',
                length = 30,
                unitname = new Array('Y','Z','E','P','T','G','M','K'),
                unitsize = new Array(1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,1024 * 1024 * 1024 * 1024 * 1024 * 1024,1024 * 1024 * 1024 * 1024 * 1024,1024 * 1024 * 1024 * 1024,1024 * 1024 * 1024,1024 * 1024,1024);
            var iask = {
                format : '',
                url : 'http://api.iask.sina.com.cn/api/isharesearch.php?key=' + keyword2 + '&datatype=json&start=0&num=5&keycharset=utf8&format=',

                init : function() {
                    var that = this;
                    that.addStyle(styleContent);
                    $.ajax({
                        type : 'GET',
                        dataType : 'script',
                        url : that.url,
                        success : function() {
                            var result = unsafeWindow.iaskSearchResult;
                            if( result.sp.m > 0 ) {
                                var result = that.generate(result);
                                $(html_title + html_body_start + result + html_body_end + html_body_endmore + html_body_endend ).insertAfter($('#MonkeySearch'));
                                that.bindListener();
                                that.content = $('#db-doulist-section ul')[0];
                                that.contentP = that.content.parentNode;
                                that.checked = $('.douban_iask_format .check')[0];
                            } else {
                                $(html_title + html_body_start + html_body_no + html_body_end + html_body_endend).insertAfter($('#MonkeySearch'));
                                //$( '.aside' ).prepend( html_title + html_body_start + html_body_no + html_body_end + html_body_endend );
                            }
                        },
                        failure : function() {
                            console.log('fail');
                        }
                    });
                },

                addStyle : function(style) {
                    var s = document.createElement('style');
                    s.type = 'text/css';
                    s.innerHTML = style;
                    document.getElementsByTagName('head')[0].appendChild(s);
                },

                bindListener : function() {
                    var that = this;
                    //绑定事件

                    $('.douban_iask_format li').bind('click', function(e) {
                        var tar = e.target;
                        that.format = tar.innerHTML == '全部' ? '' : tar.innerHTML;
                        if(that.checked != tar) {
                            that.checked.className = '';
                            that.checked = tar;
                            tar.className = 'check';
                        }
                        that.getContent(that.url + that.format);
                    });
                },

                generate : function(iaskSearchResult) {
                    var title,title2, image, filesize, url, unit, html_body_yes='';
                    var regex = /([A-Z\u0391-\uffe5])/g,
                        searchResult = iaskSearchResult.sp.result;

                    for( var resultIndex = 0,resultTotal = searchResult.length; resultIndex < resultTotal; resultIndex++) {
                         var result = searchResult[resultIndex];
                            title = result.title;
                            title2 = title.replace( regex, "$1*" );
                            ellipsis = title2.length > length ? '..' : '' ;
                            title2 = title2.substr( 0, length ).replace( /\*/g, '' ) + ellipsis;
                            image = result.format;
                            filesize = result.filesize;
                            if( filesize < 1024 ) filesize = filesize+'B';
                            for( var i=0; i<unitname.length; i++ ){
                                if( filesize > unitsize[i] || filesize==unitsize[i] ){
                                    filesize = Math.round( filesize / unitsize[i] * 10 ) / 10 + unitname[i];
                                }
                            }
                            url = result.url;
                            html_body_yes += '<li><img src="http://www.sinaimg.cn/pfp/ask/images/'
                                             + image + '.gif" style="margin-bottom:-2px;" /> <a href="' + url + '?from=douban" title="' + title + '" target="_blank">'
                                             + title2 + '</a><span class="pl">(大小:' + filesize + ' 积分:' + result.price + ')</span></li>';
                    }
                    return html_body_yes;
                },

                getContent : function(url) {
                    var that = this;
                    $.ajax({
                        type : 'GET',
                        dataType : 'script',
                        url : url,
                        success : function() {
                            var searchResult = unsafeWindow.iaskSearchResult;
                            if( searchResult.sp.m > 0 ) {
                                var result = that.generate(searchResult);
                                that.contentP.style.display = 'block';
                                that.content.innerHTML = '';
                                that.content.innerHTML = result;
                            } else {
                                that.content.innerHTML = html_body_no;
                            }
                        }
                    });
                }
            };
            iask.init();
        }
    });