//logs.js
const util = require('../../utils/util.js')
getApp();
Page({
  data: {
    logs: []
  },
  onLoad: function () {

    //解密微信运动步数
    wx.getWeRunData({
      success(res) {
        console.log(res)
        wx.Bmob.User.decryption(res).then(res => {
          console.log(res)
        })
      }
    })
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return util.formatTime(new Date(log))
      })
    })
  },

})
