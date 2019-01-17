Page({
    data: {
        showCash: ""
    },
    onLoad: function (n) {
    },
    onReady: function () {},
    onShow: function () {
        this.requestAmount();
    },
    onHide: function () {},
    onUnload: function () {},
    onPullDownRefresh: function () {},
    onReachBottom: function () {},
    onShareAppMessage: function () {},
    btnDetail: function () {
        wx.navigateTo({
            url: "detail"
        });
    },
    btnRecharge: function () {
        wx.navigateTo({
            url: "../recharge/recharge"
        });
    },
    btnPosta: function () {
        wx.navigateTo({
            url: "posta"
        });
    },
    requestAmount: function () {
        var that = this;
        let userData = wx.getStorageSync("userData")
        let query = wx.Bmob.Query("_User")
        query.get(userData.objectId).then(res => {
            that.setData({
                showCash: res.balance
            })
        })
    }
});