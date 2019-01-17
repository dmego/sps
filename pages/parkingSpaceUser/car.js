var userId;
var defaultId;
var common = require("../../utils/common.js")
getApp();

Page({
  data: {
    isHiddenToast: !0,
    idx: 0,
    cars: [],
    hasCar: false

  },
  isShowToast: function () {
    this.setData({
      isHiddenToast: !1
    });
  },
  toastChange: function () {
    this.setData({
      isHiddenToast: !0
    });
  },
  toPage: function (t) {
    var a = this,
      s = t.currentTarget.dataset.index;
    console.log(s), wx.showActionSheet({
      itemList: ["修改", "设为默认", "删除"],
      itemColor: "#007aff",
      success: function (t) {
        0 === t.tapIndex ? wx.navigateTo({
          url: "updataCar?carId=" + a.data.cars[s].objectId
        }) : 1 === t.tapIndex ? a.requstDefaultCars(a.data.cars[s].objectId) : 2 === t.tapIndex && wx.showModal({
          title: "确定删除",
          content: "车牌号为" + a.data.cars[s].carNumber + "的车辆吗",
          confirmColor: "#388EF3",
          success: function (t) {
            t.confirm && a.requstDelCars(a.data.cars[s].objectId);
          }
        });
      }
    });
  },
  onLoad: function (t) {
    var userData = wx.getStorageSync("userData");
    userId = userData.objectId;
  },
  onReady: function () {},
  onShow: function () {
    var that = this;
    var car = wx.Bmob.Query("Car");
    car.equalTo("owner", "==", userId);
    car.find().then(res => {
      if (res.length > 0) {
        that.setData({
          hasCar: true,
          cars: res
        })
      }
      //找到默认的
      for (let item of res) {
        if (item.status == 1) {
          defaultId = item.objectId;
        }
      }

    })
  },
  onHide: function () {},
  onUnload: function () {},
  bindtap: function (t) {},


  btnAddCar: function () {
    wx.navigateTo({
      url: "addCar"
    });
  },

  //删除车辆
  requstDelCars: function (carId) {
    console.log(carId)
    var that = this;
    var car = wx.Bmob.Query("Car");
    car.destroy(carId).then(res => {
      common.showTip("删除成功", "success");
      this.onShow()
    }).catch(err => {
      console.log(err)
    })
  },

  //设置为默认
  requstDefaultCars: function (carId) {
    var that = this;
    var car = wx.Bmob.Query("Car");
    //先取消原先默认的
    car.get(defaultId).then(res => {
      res.set("status", 0)
      res.save().then(res => {
        //再设置默认的
        car.get(carId).then(res => {
          res.set("status", 1)
          res.save().then(res => {
            common.showTip("设置成功", "success");
            this.onShow()
          })
        }).catch(err => {
          console.log(err)
        })
      })
    }).catch(err => {
      console.log(err)
    })
  }
});