var e = getApp()
Page({
  data: {
    serviceNumber: "",
    personInfo: null,
    user: null,
    userMenuList: [{
      groupName: "我的账单",
      icon: "/images/user-bill.png",
      rightImage: "/images/tip.png"
    }, {
      groupName: "车辆管理",
      icon: "/images/user-carNo.png",
      rightImage: "/images/tip.png"
    }, {
      groupName: "车位管理",
      icon: "/images/user-space.png",
      rightImage: "/images/tip.png"
    }, {
      groupName: "关于",
      icon: "/images/user-set.png",
      rightImage: "/images/tip.png"
    }]
  },
  toPage: function (e) {
    var r = this,
      a = e.currentTarget.dataset.index;
    switch (console.log(a), a) {
      case 0: //我的账单
        wx.navigateTo({
          url: "/pages/bill/bill"
        });
        break;

      case 1: //车辆管理
        wx.navigateTo({
          url: "/pages/parkingSpaceUser/car"
        });
        break;

      case 2: //车位管理
        wx.navigateTo({
          url: "/pages/parkingSpace/parkingSpace"
        });
        break;

      case 3: //关于
        wx.navigateTo({
          url: "/pages/about/about"
        });
    }
  },
  onLoad: function () {
    var that = this;
    var info = wx.getStorageSync('userInfo');
    that.setData({
      personInfo: info
    });

  },

  btnAmount: function () {
    wx.navigateTo({
      url: "/pages/banlance/banlance"
    });
  },

  btnCountProfit: function () {
    wx.navigateTo({
      url: "/pages/countProfit/countProfit"
    });
  },

  onShow: function () {
    this.requestUser();
  },

  requestUser: function () {
    var that = this;
    let userData = wx.getStorageSync("userData")
    let query = wx.Bmob.Query("_User")
    query.get(userData.objectId).then(res => {
      that.setData({
        user: res
      })
    })
  },
});