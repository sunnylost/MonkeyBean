var userName = MonkeyBean.get(MonkeyBeanConst.USER_NAME),
    userLocation = MonkeyBean.get(MonkeyBeanConst.USER_LOCATION);

    //获得用户ID与地址
    (function () {
        if (!userName) {
            GM_xmlhttpRequest({
                method:'GET',
                url:'http://www.douban.com/mine',
                onload:function (resp) {
                    //没有cookie~会自动跳转到登录页面
                    if (location.href.indexOf('www.douban.com/accounts/login') != -1) return;
                    //响应头部信息中，包含了最终的url，其中就有用户名
                    var arr = resp.finalUrl.split('/');
                    userName = arr[arr.length - 2];
                    MonkeyBean.set(MonkeyBeanConst.USER_NAME, userName);
                }
            })
        }

        if (!userLocation) {
            GM_xmlhttpRequest({
                method:'GET',
                url:'http://www.douban.com/location',
                onload:function (resp) {
                    if (location.href.indexOf('www.douban.com/accounts/login') != -1) return;
                    //响应头部信息中，包含了最终的url，其中就有地址
                    var arr = $.trim(resp.finalUrl).split('.');
                    userLocation = arr[0].slice(7);
                    MonkeyBean.set(MonkeyBeanConst.USER_LOCATION, userLocation);
                }
            })
        }
    })()