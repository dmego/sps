getApp();
var userId; //用户Id
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
  //获取当前用户账单
  fetchData: function (t) {
    var that = t;
    var count;
    var query = wx.Bmob.Query("Order");
    const query1 = query.equalTo("hireuser", '==', userId);
    const query2 = query.equalTo("parkuser", '==', userId);
    query.or(query1, query2);
    query.limit(that.data.limit);
    query.order("-createdAt"); //按照时间降序
    query.include("hireuser", "_User");
    query.include("parkuser", "_User");
    query.count().then(res => {
      count = res;
    });
    query.find().then(res => {
      for (var i = 0; i < res.length; i++) {
        let typeId = that.getType(res[i])
        if (typeId == 0) { //收益
          res[i].billAmount = res[i].parkcost
        } else if (typeId == 1) { //支出
          res[i].billAmount = res[i].afcoupon
        }
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
    if (res.hireuser.objectId == userId) {
      typeId = 1 //当前用户是使用者，账单为支出
    } else if (res.parkuser.objectId == userId) {
      typeId = 0 //当前用户是租用者，账单为收益
    }
    return typeId;
  }
});