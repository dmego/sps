var t = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) {
    return typeof t;
} : function (t) {
    return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
};

module.exports = {
    showToast: function (o) {
        if ("object" == (void 0 === o ? "undefined" : t(o)) && o.title) {
            o.duration && "number" == typeof o.duration || (o.duration = 1500);
            var e = getCurrentPages()[getCurrentPages().length - 1];
            o.isShow = !0, o.duration < 1e4 && setTimeout(function () {
                o.isShow = !1, o.cb && "function" == typeof o.cb && o.cb(), e.setData({
                    "showToast.isShow": o.isShow
                });
            }, o.duration), e.setData({
                showToast: o
            });
        } else console.log("showToast fail:请确保传入的是对象并且title必填");
    },
    hideToast: function () {
        var t = getCurrentPages()[getCurrentPages().length - 1];
        t.data.showToast && t.setData({
            "showToast.isShow": !1
        });
    }
};