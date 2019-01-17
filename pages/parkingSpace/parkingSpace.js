var userId; //用户Id
var common = require("../../utils/common.js")
getApp();
Page({
  data: {
    isHiddenToast: !0,
    idx: 0,
    loading: !1,
    isHave: !0,
    count: 0,
    bills: [],
    limit: 5,
    isEmpty: false,
    hasPark: false,
    menuId: -1,

    showModal: !1,
    inputChange: "",
  },
  onLoad: function (t) {
    var userData = wx.getStorageSync("userData");
    userId = userData.objectId;
  },
  onReady: function () {},
  onShow: function () {
    this.fetchData(this);
  },
  onHide: function () {},
  onUnload: function () {},
  onLoadMore: function () {
    wx.showLoading({
      title: '正在加载',
      mask: true
    });
    setTimeout(function () {
      wx.hideLoading()
    }, 500)
    var limit = this.data.limit + 5;
    this.setData({
      limit: limit
    })
    this.onShow();
  },
  onPullDownRefresh: function () {
  },
  onReachBottom: function () {
  },
  //获取当前用户的车位
  fetchData: function (t) {
    var that = t;
    var count;
    var query = wx.Bmob.Query("Park");
    query.equalTo("publisher", "==", userId); //当前用户的明细
    query.limit(that.data.limit);
    query.order("-createdAt"); //按照时间降序
    query.include("publisher", "_User");
    query.count().then(res => {
      count = res;
      if (count > 0) {
        that.setData({
          hasPark: true
        })
      }
    });
    query.find().then(res => {
      if (res.length == count) {
        that.setData({
          isEmpty: true
        })
      }
      that.setData({
        bills: res
      })
    }).catch(err => {
      console.log(err);
    });
  },
  toPage: function (t) {
    var a = this,
      n = t.currentTarget.dataset.index;
    a.setData({
      menuId: n
    });
  },
  moveLis: function (t) {
    console.log(t),
      console.log(t.target.offsetTop), -1 != this.data.menuId && t.target.offsetTop > 200 && this.setData({
        menuId: -1
      });
  },
  btnFreeWay: function () {
    var t = this,
      n = t.data.bills[t.data.menuId];
    3 != n.status ? wx.navigateTo({
      url: "../freeWay/freeWay?park=" + JSON.stringify(n)
    }) : a.showToast({
      title: "车位还未审核通过呢",
      duration: 500,
      mark: !1
    });
  },
  btnBuild: function () {
    var t = this,
      a = t.data.bills[t.data.menuId];
    wx.navigateTo({
      url: "upParkingSpace?parkid=" + a.objectId
    });
  },
  //转到详情页面
  btnDetail: function () {
    var t = this,
      a = t.data.bills[t.data.menuId];
    wx.navigateTo({
      url: "/pages/parkingSpaceDetail/parkingSpaceDetail?parkId=" + a.objectId
    });
  },
  btnDel: function () {
    var t = this;
    wx.showModal({
      title: "提示",
      confirmText: "删除",
      content: "确定删除吗？",
      confirmColor: "#F00000",
      success: function (a) {
        a.confirm ? t.requstDel(t.data.menuId) : a.cancel;
      }
    });
  },
  requstDel: function (menuId) {
    console.log(menuId)
    var that = this;
    var bills = that.data.bills;
    var parkId = bills[menuId].objectId
    var park = wx.Bmob.Query("Park");
    park.destroy(parkId).then(res => {
      common.showTip("删除成功", "success");
      this.onShow()
    }).catch(err => {
      console.log(err)
    })
  },
  btnOpen: function (t) {
    var a = this;
    console.log(JSON.stringify(t));
    var n = t.currentTarget.id,
      e = a.data.bills[n];
    console.log(JSON.stringify(e)), i.connectBle(e.clientMac, e.spacePwd, e.BLEService, e.BLECharacteristic, "open");
  },
  //添加车位
  btnAddPark: function () {
    wx.navigateTo({
      url: "addParkingSpace"
    });
  },
});