// pages/charge/charge.js
Page({


  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var price = options.price;
    var cost = options.cost;
    that.setData({
      price: price,
      cost: cost
    })
  },
  rule() {
    wx.showModal({
      title: "提示",
      content: "根据业主拟定的规则计价",
      confirmText: "知道了",
      confirmColor: "#02BB00",
      showCancel: !1
    })
  }
})