function t(t) {
    return (t = t.toString())[1] ? t : "0" + t;
}

function n(t, n) {
    return t.indexOf(n) >= 0;
}

function e(t) {
    var n = parseInt(Math.floor(t / 1440)),
        e = n > 0 ? Math.floor((t - 1440 * n) / 60) : Math.floor(t / 60),
        r = e > 0 ? Math.floor(t - 1440 * n - 60 * e) : t,
        o = "";
    return n > 0 && (o += n + "天"), e > 0 && (o += e + "小时"), r > 0 && (o += r + "分钟"),
        o;
}

module.exports = function (t, n, e) {
    return n in t ? Object.defineProperty(t, n, {
        value: e,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : t[n] = e, t;
}({
    formatTime: function (n) {
        var e = n.getFullYear(),
            r = n.getMonth() + 1,
            o = n.getDate(),
            i = n.getHours(),
            u = n.getMinutes(),
            a = n.getSeconds();
        return [e, r, o].map(t).join("/") + " " + [i, u, a].map(t).join(":");
    },
    isContains: n,
    device: function () {
        var t = wx.getSystemInfoSync().system;
        t.indexOf("iOS");
        return n(t, "iOS") ? 1 : 2;
    },
    setStorage: function (t, n) {
        try {
            wx.setStorageSync(t, n);
        } catch (t) {}
    },
    getStorage: function (t) {
        try {
            var n = wx.getStorageSync(t);
            if (n) return n;
        } catch (t) {
            return null;
        }
    },
    json2Form: function (t) {
        var n = [];
        for (var e in t) n.push(encodeURIComponent(e) + "=" + encodeURIComponent(t[e]));
        return n.join("&");
    },
    formatMinutes: e
}, "formatMinutes", e);