var userId;
var common = require("../../utils/common.js")
var d = getApp();

Page({
  data: {
    plates: "",
    interval: 5e3,
    circular: !0,
    indicatorDots: !1,
    indicatorcolor: "#000",
    vertical: !1,
    autoplay: !1,
    duration: 1e3,
    imgheights: [],
    imgwidth: 750,
    current: 0,
    isKeyboard: !1,
    isNumberKB: !1,
    tapNum: !1,
    phoneNumber: "4006262660",
    disableKey: "1234567890港澳学",
    keyboardNumber: "1234567890ABCDEFGHJKLMNPQRSTUVWXYZ港澳学",
    keyboard1: "京沪粤津冀晋蒙辽吉黑苏浙皖闽赣鲁豫鄂湘桂琼渝川贵云藏陕甘青宁新",
    textArr: [],
    inputPlates: {
      index0: "冀",
      index1: "A",
      index2: "",
      index3: "",
      index4: "",
      index5: "",
      index6: "",
      index7: ""
    },
    inputOnFocusIndex: "",
    submitButtonEnabled: !1,
    automaticPayment: {}
  },

  onLoad: function () {
    var userData = wx.getStorageSync("userData");
    userId = userData.objectId;
  },

  onReady: function () {},

  onShow: function () {

  },

  onHide: function () {},
  onUnload: function () {},

  submitButtonClick: function () {
    this.setData({
      isKeyboard: !1,
      isNumberKB: !1,
      inputOnFocusIndex: ""
    });
    var a = this,
      e = this.data.inputPlates,
      n = e.index0 + e.index1 + e.index2 + e.index3 + e.index4 + e.index5 + e.index6 + e.index7;
    console.log(n)
    //先查询这个车牌号在车辆表中有没有
    var car = wx.Bmob.Query("Car");
    var bool = false;
    var itemCar;
    var hasMore = 0;
    car.include("owner", "_User");
    car.find().then(res => {
      for (let item of res) {
        if (item.carNumber == n) {
          itemCar = item;
          bool = true;
          break;
        }
      }
      if (bool == true) { //说明存在一样的车牌号
        if (itemCar.owner.objectId == userId) { //如果是自己的
          wx.showModal({
            title: "",
            content: "您已添加过该车牌",
            confirmText: "知道了",
            confirmColor: "#02BB00",
            showCancel: !1
          })
        } else {
          wx.showModal({
            title: "",
            content: "该车牌已被其他用户绑定\n如需找回请联系我们",
            confirmText: "知道了",
            confirmColor: "#02BB00",
            showCancel: !1
          });
        }
      } else {
        var car2 = wx.Bmob.Query("Car");
        car2.equalTo("owner", "==", userId);
        car2.find().then(res => {
          console.log(res)
          if (res.length > 0) {
            hasMore = 1;
          }
          //车辆表添加数据
          const pointer = wx.Bmob.Pointer('_User');
          const poiID = pointer.set(userId);
          car.set("owner", poiID)
          car.set("carNumber", n)
          console.log("hasMore:" + hasMore)
          if (hasMore == 0) { //没有添加车位。则添加的为默认的
            car.set("status", 1) //默认属性，
          } else {
            car.set("status", 0) //非默认属性，
          }
          car.save().then(res => {
            common.showTip("添加成功", "success", function () {
              a.setData({
                inputPlates: {
                  index0: "冀",
                  index1: "A",
                  index2: "",
                  index3: "",
                  index4: "",
                  index5: "",
                  index6: "",
                  index7: ""
                },
              })
              wx.navigateTo({
                url: "/pages/parkingSpaceUser/car"
              });
            });
          }).catch(err => {
            console.log(err + "添加失败")
          })
        })
      }
    });
  },

  swiperClicked: function (t) {},

  inputClick: function (t) {
    console.log(t), console.log(t.target.dataset.id), this.setData({
      inputOnFocusIndex: t.target.dataset.id,
      isKeyboard: !0
    });
    var a = this;
    "0" == this.data.inputOnFocusIndex ? a.setData({
      tapNum: !1,
      isNumberKB: !1
    }) : "1" == this.data.inputOnFocusIndex ? a.setData({
      tapNum: !1,
      isNumberKB: !0
    }) : a.setData({
      tapNum: !0,
      isNumberKB: !0
    });
  },

  tapKeyboard: function (t) {
    t.target.dataset.index;
    var a = t.target.dataset.val;
    switch (this.data.inputOnFocusIndex) {
      case "0":
        this.setData({
          "inputPlates.index0": a,
          inputOnFocusIndex: "1"
        });
        break;

      case "1":
        this.setData({
          "inputPlates.index1": a,
          inputOnFocusIndex: "2"
        });
        break;

      case "2":
        this.setData({
          "inputPlates.index2": a,
          inputOnFocusIndex: "3"
        });
        break;

      case "3":
        this.setData({
          "inputPlates.index3": a,
          inputOnFocusIndex: "4"
        });
        break;

      case "4":
        this.setData({
          "inputPlates.index4": a,
          inputOnFocusIndex: "5"
        });
        break;

      case "5":
        this.setData({
          "inputPlates.index5": a,
          inputOnFocusIndex: "6"
        });
        break;

      case "6":
        this.setData({
          "inputPlates.index6": a,
          inputOnFocusIndex: "7"
        });
        break;

      case "7":
        this.setData({
          "inputPlates.index7": a,
          inputOnFocusIndex: "7"
        });
    }
    this.checkedSubmitButtonEnabled();
  },

  tapSpecBtn: function (t) {
    var a = this,
      e = t.target.dataset.index;
    if (0 == e) {
      switch (parseInt(this.data.inputOnFocusIndex)) {
        case 0:
          this.setData({
            "inputPlates.index0": "",
            inputOnFocusIndex: "0"
          });
          break;

        case 1:
          this.setData({
            "inputPlates.index1": "",
            inputOnFocusIndex: "0"
          });
          break;

        case 2:
          this.setData({
            "inputPlates.index2": "",
            inputOnFocusIndex: "1"
          });
          break;

        case 3:
          this.setData({
            "inputPlates.index3": "",
            inputOnFocusIndex: "2"
          });
          break;

        case 4:
          this.setData({
            "inputPlates.index4": "",
            inputOnFocusIndex: "3"
          });
          break;

        case 5:
          this.setData({
            "inputPlates.index5": "",
            inputOnFocusIndex: "4"
          });
          break;

        case 6:
          this.setData({
            "inputPlates.index6": "",
            inputOnFocusIndex: "5"
          });
          break;

        case 7:
          this.setData({
            "inputPlates.index7": "",
            inputOnFocusIndex: "6"
          });
      }
      this.checkedSubmitButtonEnabled();
    } else 1 == e && a.setData({
      isKeyboard: !1,
      isNumberKB: !1,
      inputOnFocusIndex: ""
    });
  },

  checkedKeyboard: function () {
    var t = this;
    "0" == this.data.inputOnFocusIndex ? t.setData({
      tapNum: !1,
      isNumberKB: !1
    }) : "1" == this.data.inputOnFocusIndex ? t.setData({
      tapNum: !1,
      isNumberKB: !0
    }) : this.data.inputOnFocusIndex.length > 0 && t.setData({
      tapNum: !0,
      isNumberKB: !0
    });
  },

  checkedSubmitButtonEnabled: function () {
    this.checkedKeyboard();
    var t = !0;
    for (var a in this.data.inputPlates)
      if ("index7" != a && this.data.inputPlates[a].length < 1) {
        t = !1;
        break;
      }
    this.setData({
      submitButtonEnabled: t
    });
  },

  bindchange: function (t) {
    this.setData({
      current: t.detail.current
    });
  }
});