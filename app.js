//app.js
var Bmob = require("/dist/Bmob-1.6.4.min.js");
//初始化 Bmob.initialize("你的Application ID", "你的REST API Key", "你的MasterKey");
Bmob.initialize("948684ef13e5576d82f597da3c1ed0b0", "f02c9cb5cede8c63d8e7f2698d1cdb84", "9c94a43f85c5ea44ef6d64c3d0566de8");
App({
  onLaunch: function () {
    var that = this;
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 一键登录
    Bmob.User.auth().then(res => {
      console.log(res);
      console.log("一键登录成功");
      var userData = {
        nickName: res.nickName,
        objectId: res.objectId,
        openid: res.openid,
        userPic: res.userPic,
        username: res.username
      };
      wx.setStorageSync('userData', userData);
      wx.setStorageSync('openid', res.openid)
    }).catch(err => {
      console.log(err);
    })
  },
  globalData: {
    userInfo: null
  }
})