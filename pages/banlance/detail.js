var userId; //用户Id
getApp();
Page({
  data: {
    bills: [],
    userData: null,
    limit: 5,
    isEmpty: false,
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
  //获取当前用户明细
  fetchData: function (t) {
    var that = t;
    var count;
    var query = wx.Bmob.Query("balDetail");
    query.equalTo("userid", "==", userId); //当前用户的明细
    query.limit(that.data.limit);
    query.order("-createdAt"); //按照时间降序
    query.include("userid", "_User");
    query.count().then(res => {
      count = res;
    });
    query.find().then(res => {
      for (var i = 0; i < res.length; i++) {
        let typeId = that.getType(res[i])
        res[i].typeId = typeId;
      }
      console.log(res);
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
  getType: function (res) {
    var typeId
    if (res.type == '充值') {
      typeId = 0
    } else if (res.type == '车位收益') {
      typeId = 1
    } else if (res.type == '车位租用') {
      typeId = 2
    }
    return typeId;
  }
});