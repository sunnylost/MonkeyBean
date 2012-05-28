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
 *
 * 命名规范：
 *      class：MonkeyBean-Overlay    MonkeyBean+连字符+模块名(首字母大写)
 *      id：MonkeyBeanOverlay
 *      monkey-action：MonkeyBean.Overlay  用点号连接。(喜欢这么写，没别的理由)
 *      monkey-data: {a:1,b:2}  采用JSON格式
 */
(function(window, undefined) {
    if(window !== window.top) return false;  //防止在iframe中执行

    var $ = $ || unsafeWindow.$;  //默认使用1.7.2版本的jQuery，如果不存在则使用豆瓣提供的，目前版本1.4.4
    var body = $(document.body);

    /*-------------------Begin--------------------*/
    var hasOwn = Object.prototype.hasOwnProperty,
        mine = /\/mine/,
        people = /\/people\/(.*)\//;
