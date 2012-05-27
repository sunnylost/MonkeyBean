// ==UserScript==
// @name           MonkeyBean
// @namespace      sunnylost
// @version        1.2
// @include        http://*.douban.*/*
// @include        http://douban.fm/*
// @require http://userscript-autoupdate-helper.googlecode.com/svn/trunk/autoupdatehelper.js
// @require http://code.jquery.com/jquery-1.7.2.min.js
/* @reason
 @end*/
// ==/UserScript==

typeof Updater != 'undefined' && new Updater({
    name: "MonkeyBean",
    id: "124760",
    version:"1.2"
}).check();

/**
 * 说明：
 *      monkey-action：用于触发事件
 *      monkey-data：用于保存信息
 *      monkey-sign：标记的元素
 */
(function(window, undefined) {
    if(window !== window.top) return false;  //防止在iframe中执行

    var $ = $ || unsafeWindow.$;  //默认使用1.7.2版本的jQuery，如果不存在则使用豆瓣提供的，目前版本1.4.4
    var body = $(document.body);

    /*-------------------Begin--------------------*/


    var hasOwn = Object.prototype.hasOwnProperty,
        mine = /\/mine/,
        people = /\/people\/(.*)\//,
        //快捷键对应的code
        keyCode = {
            'enter' : 13
        };

})(window)