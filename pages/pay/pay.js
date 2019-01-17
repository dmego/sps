const app = getApp()
var common = require("../../utils/common.js");
var userId; //用户Id
Page({
  /**
   * 页面的初始数据
   */
  data: {
    coupon: 1,
    price: 1.00
  },
  onLoad: function (options) {
    var userData = wx.getStorageSync("userData");
    userId = userData.objectId;

    var parkId = options.parkId
    var parkcost = options.parkcost
    var parktime = options.parktime

    //八折优惠算
    var coupon = parkcost * 0.2
    var price = parkcost * 0.8
    this.setData({
      parkId: parkId,
      coupon: coupon,
      price: price,
      parkcost: parkcost,
      parktime: parktime
    })
  },

  toPay() {
    wx.showLoading({
      title: '支付中',
    })
    var that = this
    let parkId = that.data.parkId
    var query = wx.Bmob.Query("Park")
    query.include("publisher", "_User");
    query.get(parkId).then(res => {
      //创建订单表
      var parkPublisher = res.publisher.objectId
      var order = wx.Bmob.Query("Order")
      const pointer = wx.Bmob.Pointer('_User');
      const hireID = pointer.set(userId);
      const parkID = pointer.set(parkPublisher);
      const pointer2 = wx.Bmob.Pointer('Park');
      const poiID = pointer2.set(parkId)
      order.set("hireuser", hireID)
      order.set("parkuser", parkID)
      order.set("park", poiID)
      order.set("parktime", that.data.parktime)
      order.set("parkcost", Number(parseFloat(that.data.parkcost).toFixed(2)))
      order.set("afcoupon", Number(parseFloat(that.data.price).toFixed(2)))

      order.save().then(res => {
        //车位拥有者余额增加，,收益增加，余额明细表增加一条
        var parkuser = wx.Bmob.Query("_User")
        parkuser.get(parkPublisher).then(res => {
          let balance = parseFloat(res.balance) + parseFloat(that.data.parkcost)
          let income = parseFloat(res.income) + parseFloat(that.data.parkcost)
          res.set("balance", Number(balance.toFixed(2)))
          res.set('income', Number(income.toFixed(2)))
          res.save().then(res => {
            //车位使用者余额减少，余额明细表增加一条
            var hireuser = wx.Bmob.Query("_User")
            hireuser.get(userId).then(res => {
              let balance = parseFloat(res.balance) - parseFloat(that.data.price)
              res.set("balance", Number(balance.toFixed(2)))
              res.save().then(res => {
                var bal = wx.Bmob.Query("balDetail")
                bal.set("value", Number(parseFloat(that.data.price).toFixed(2)))
                bal.set("userid", hireID)
                bal.set("type", "车位租用")
                bal.save().then(res => {
                  var bal = wx.Bmob.Query("balDetail")
                  bal.set("value", Number(parseFloat(that.data.parkcost).toFixed(2)))
                  bal.set("userid", parkID)
                  bal.set("type", "车位收益")
                  bal.save().then(res => {
                    let park = wx.Bmob.Query("Park")
                    park.get(parkId).then(res => {
                      res.set("status", '可租用');
                      res.save().then(res => {
                        common.showTip("支付成功", "success");
                        wx.hideLoading();
                        setTimeout(() => {
                          wx.reLaunch({
                            url: '/pages/index/index'
                          })
                        }, 2000)
                      })
                    })
                  })
                })
              })
            }).catch(err => {
              console.log(err)
            })
          })
        }).catch(err => {
          console.log(err)
        })
      }).catch(err => {
        console.log(err)
      })
    })
  }
})