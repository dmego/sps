var common = require("../../utils/common.js");
Page({
  data: {
    showCash: ""
  },
  onLoad: function (n) {

  },
  onReady: function () {},
  onShow: function () {
    console.log("加载余额")
    this.requestAmount();
  },
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {},

  //充值
  formSubmit: function (event) {
    var that = this;
    var recharge = parseFloat(event.detail.value.recharge);
    wx.Bmob.User.auth().then(res => {
      var id = res.objectId;
      var oldBalance = res.balance;
      var newBalance = oldBalance + recharge;
      var query = wx.Bmob.Query("_User");
      query.get(id).then(res => {
        res.set("balance", newBalance)
        res.save().then(res => {
          //明细表添加数据
          var balDetail = wx.Bmob.Query("balDetail");
          const pointer = wx.Bmob.Pointer('_User');
          const poiID = pointer.set(id);
          balDetail.set("userid", poiID)
          balDetail.set("type", "充值")
          balDetail.set("value", recharge)
          balDetail.save()

          common.showTip("充值成功", "success");
          that.onShow();
        })
      }).catch(err => {
        console.log(err)
        console.log("充值失败");
      })

    });
  },

  requestAmount: function () {
    var that = this;
    let cur = wx.Bmob.User.current();
    console.log("当前余额：" + cur.balance)
    that.setData({
      showCash: cur.balance
    })
  }
});