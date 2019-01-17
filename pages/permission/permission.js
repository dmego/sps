//获取应用实例
const app = getApp()

Page({
  data: {
    title: "SPS共享停车位",
    userInfo: {},
    hasUserInfo: false,
  },
  onLoad: function () {
    var hasPermission = wx.getStorageSync("hasUserInfo");
    if (hasPermission) {
      wx.redirectTo({
        url: "../index/index"
      });
    }
  },
  onReady: function () {

  },

  //获取用户信息
  getUserInfo: function (e) {
    var that = this;
    app.globalData.userInfo = e.detail.userInfo;
    wx.setStorageSync("userInfo", e.detail.userInfo);
    wx.setStorageSync("hasUserInfo", true);
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    });
    //更新当前用户信息
    var info = e.detail.userInfo
    wx.Bmob.User.auth().then(res => {
      var id = res.objectId;
      var query = wx.Bmob.Query("_User");
      query.get(id).then(res => {
        if (res.status == undefined) { //如果没有初始化，则初始化
          console.log("第一次初始化")
          res.set("status", 1)
          res.set("balance", 0)
          res.set("income", 0)
        }
        res.set("nickname", info.nickName)
        res.set("userPic", info.avatarUrl)
        res.set("sex", info.gender)
        res.set("userInfo", info)
        res.save()
      }).catch(err => {
        console.log(err)
      })
    });

    //跳转到首页
    wx.redirectTo({
      url: "../index/index"
    });
  }
});