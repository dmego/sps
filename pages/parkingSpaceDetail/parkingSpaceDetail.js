var common = require("../../utils/common.js")
getApp();
var userId; //用户Id
Page({
  data: {
    isMe: false,
    messages: [],
    park: '',
    ids: 0,
    loading: !1,
    isHave: !0,
    count: 0,
    bills: [],
    currentPage: 1,
    section: [],
    currentId: null,
    parkingId: null,
    Ind: ""
  },

  onLoad: function (t) {
    wx.showLoading({
      title: '加载中',
    })
    var parkId = t.parkId;
    var userData = wx.getStorageSync("userData");
    userId = userData.objectId;
    var park = wx.Bmob.Query("Park")
    park.include("publisher", "_User");
    park.get(parkId).then(res => {
      if (res.publisher.objectId == userId) {
        this.setData({
          isMe: true,
        })
      }
      this.setData({
        parkId: parkId,
        park: res,
        parkstatus: this.getParkStatus(res)
      })
      wx.hideLoading();
    }).catch(err => {
      console.log(err)
    })
  },


  onReady: function () {},
  onShow: function () {},
  onHide: function () {},
  onUnload: function () {},

  //导航
  btnNavacation: function () {
    var e = this.data.park;
    wx.openLocation({
      latitude: e.latitude,
      longitude: e.longitude,
      scale: 18,
      name: e.ownname,
      address: e.address
    });
  },

  //查看车位大图
  seeParkBig: function (e) {
    var http = this.data.park.parkpic.url
    wx.previewImage({
      current: http, // 当前显示图片的http链接
      urls: [http] // 需要预览的图片http链接列表
    })
  },

  //生成二维码
  toGenCode: function () {
    var that = this;
    wx.showLoading({
      title: '生成中',
    })
    var path = "pages/parkingSpaceDetail/parkingSpaceDetail?parkId=" + this.data.parkId;
    var width = 430;
    let qrData = {
      path: path,
      width: width,
      interface: 'c',
      type: 1
    }
    wx.Bmob.generateCode(qrData).then(function (obj) {
      console.log(obj);
      that.setData({
        imageurl: obj.url,
        codeHehe: true
      })
      wx.hideLoading();
    }, function (err) {
      common.showTip('生成二维码失败' + err);
    });
  },

  //关闭二维码弹窗
  closeCode: function () {
    this.setData({
      codeHehe: false
    })
  },

  //查看车位大图
  seeCodeBig: function (e) {
    var http = this.data.imageurl
    wx.previewImage({
      current: http, // 当前显示图片的http链接
      urls: [http] // 需要预览的图片http链接列表
    })
  },

  // 扫码租用
  /**
   * 条件:1.钱包里要有钱
   * 2.提示，请务必在车位停租时间内结束本次租用，以免影响业主正常使用
   */
  toScan: function () {
    var query = wx.Bmob.Query("_User");
    query.get(userId).then(res => {
      if (res.balance <= 0) {
        wx.showModal({
          title: "提示",
          content: "余额不足,请先充值",
          confirmText: "知道了",
          confirmColor: "#02BB00",
          showCancel: !1
        })
      } else if (this.data.parkstatus == 1) { //正在使用中
        wx.showModal({
          title: "提示",
          content: "该车位正在使用中",
          confirmText: "知道了",
          confirmColor: "#02BB00",
          showCancel: !1
        })
      } else {
        wx.scanCode({
          success: (res) => {
            onlyFromCamera: false,
            console.log(res)
            console.log('扫码成功');
            let path = res.path;
            let pathArr = path.split("?");
            let parkArr = pathArr[1].split("=");
            if (pathArr != null && parkArr != null && parkArr[1] == this.data.parkId) { //如果这个码是这个车位的，则进入使用中的状态
              wx.showModal({
                title: '停车须知',
                content: '请务必在车位停租时间内结束本次租用，以免影响业主正常使用',
                confirmColor: "#02BB00",
                success: (res) => {
                  if (res.confirm) {
                    //该车位的状态改变
                    var park = wx.Bmob.Query("Park")
                    park.get(this.data.parkId).then(res => {
                      res.set('status', '使用中')
                      res.save().then(res => {
                        wx.reLaunch({
                          url: '/pages/unlock/unlock?parkId=' + this.data.parkId,
                        })
                      })
                    }).catch(err => {
                      console.log(err)
                    })
                  }
                }
              })
            } else {
              wx.showModal({
                title: "提示",
                content: "该二维码不是本车位生成",
                confirmText: "知道了",
                confirmColor: "#02BB00",
                showCancel: !1
              })
            }
          }
        })
      }
    })
  },


  getParkStatus: function (res) {
    var parkstatus;
    if (res.status == "可租用") {
      parkstatus = 0
    } else if (res.status == "使用中") {
      parkstatus = 1
    } else if (res.status == "已停租") {
      parkstatus = 2
    }
    return parkstatus;
  }
});