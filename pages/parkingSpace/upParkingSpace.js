//获取应用实例
var app = getApp()
var common = require("../../utils/common.js")
var that;
var userId; //用户Id
var optionId;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    statusArr: ["可租用", "使用中", "已停租"],
    statusIndex: 0,
    isAgree: false,
    ownname: '',
    ownphone: '',
    address: '点击选择位置',
    longitude: 0, //经度
    latitude: 0, //纬度
    parkNumber: '',
    remark: '',
    noteMaxLen: 200, //备注最多字数
    noteNowLen: 0, //备注当前字数
  },
  //改变车位状态
  binStatusChange: function (e) {
    this.setData({
      statusIndex: e.detail.value
    })
  },
  //字数改变触发事件
  bindTextAreaChange: function (e) {
    var that = this
    var value = e.detail.value,
      len = parseInt(value.length);
    if (len > that.data.noteMaxLen)
      return;
    that.setData({
      remark: value,
      noteNowLen: len
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    optionId = options.parkid;
    var userData = wx.getStorageSync("userData");
    userId = userData.objectId;
    var query = wx.Bmob.Query("Park");
    query.equalTo("objectId", "==", optionId);
    query.include("publisher", "_User");
    query.find().then(res => {
      var start = res[0].timeStart.split(" ");
      var end = res[0].timeEnd.split(" ");
      that.setData({ //初始化数据
        ownname: res[0].ownname,
        ownphone: res[0].ownphone,
        address: res[0].address,
        startdate: start[0],
        starttime: start[1],
        enddate: end[0],
        endtime: end[1],
        parkNumber: res[0].parkNumber,
        price: res[0].price,
        remark: res[0].remark,
        src: res[0].parkpic.url,
        parkPic: res[0].parkpic.url,
        statusIndex: that.getStatusIndex(res[0].status),
        isSrc: true,
        isLoading: false,
        loading: true,
        isdisabled: false
      })
    }).catch(err => {
      console.log(err);
    });

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideToast()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  //上传车位图片
  uploadPic: function () { //选择图标
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], //压缩图
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        for (let item of tempFilePaths) {
          var src = item
        }
        that.setData({
          upnew: true, //上传了新图片
          isSrc: true,
          src: src
        })
      }
    })
  },

  //删除图片
  clearPic: function () { //删除图片
    that.setData({
      isSrc: false,
      src: ""
    })
  },

  bindStartDateChange: function (e) {
    this.setData({
      startdate: e.detail.value
    })
  },
  bindEndDateChange: function (e) {
    this.setData({
      enddate: e.detail.value
    })
  },
  bindStartTimeChange: function (e) {
    this.setData({
      starttime: e.detail.value
    })
  },
  bindEndTimeChange: function (e) {
    this.setData({
      endtime: e.detail.value
    })
  },

  //选择地点
  addressChange: function (e) {
    this.addressChoose(e);
  },
  addressChoose: function (e) {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          upadnew: true, //更新了地址
          address: res.name,
          longitude: res.longitude, //经度
          latitude: res.latitude, //纬度
        })
        if (e.detail && e.detail.value) {
          this.data.address = e.detail.value;
        }
      },
      fail: function (e) {},
      complete: function (e) {}
    })
  },

  //同意相关条例
  bindAgreeChange: function (e) {
    this.setData({
      isAgree: !!e.detail.value.length,
    });
  },

  //提交表单
  submitForm: function (e) {
    var that = this;
    var ownname = e.detail.value.ownname;
    var ownphone = e.detail.value.ownphone;
    var address = this.data.address;
    var longitude = this.data.longitude; //经度
    var latitude = this.data.latitude; //纬度
    var timeStart = this.data.startdate + " " + this.data.starttime;
    var timeEnd = this.data.enddate + " " + this.data.endtime;
    var parkNumber = e.detail.value.parkNumber;
    var price = e.detail.value.price;
    var remark = e.detail.value.remark;
    var statusIndex = this.data.statusIndex;
    if (statusIndex == 0) {
      var status = "可租用";
    } else if (statusIndex == 1) {
      var status = "使用中";
    } else if (statusIndex == 2) {
      var status = "已停租";
    }

    if (ownname == "") {
      that.showTopTips('请输入车位名称')
    } else if (ownphone == "") {
      that.showTopTips('请输入业主电话')
    } else if (address == '点击选择位置') {
      that.showTopTips('请选择地点')
    } else if (parkNumber == "") {
      that.showTopTips('请输入车位号')
    } else if (price == "") {
      that.showTopTips('请输入租用价格')
    } else if (remark == "") {
      that.showTopTips('请输入备注')
    } else if (that.data.isSrc == false) {
      that.showTopTips('请上传车位正面照片')
    } else {
      console.log('校验完毕');
      that.setData({
        isLoading: true,
        isdisabled: true
      })
      //更新一条数据
      var query = wx.Bmob.Query("Park");
      query.get(optionId).then(park => {
        park.set("ownname", ownname);
        park.set("ownphone", ownphone);
        if (that.data.upadnew) { //如果改变了地点
          park.set("address", address);
          park.set("longitude", longitude); //经度
          park.set("latitude", latitude); //纬度
        }
        park.set("timeStart", timeStart);
        park.set("timeEnd", timeEnd);
        park.set("parkNumber", parkNumber);
        park.set("price", price);
        park.set("remark", remark);
        park.set("status", status); //初始化车位状态：1：可租用，2：租用中，3：已停租
        if (that.data.upnew == true) { //如果更新了活动图片
          wx.Bmob.File().destroy(that.data.parkPic).then(res => { //删除原先的照片
            if (res.msg == "ok") {
              console.log('删除旧图片成功');
            }
          }).catch(err => {
            console.log(err)
          })
          var timestamp = Date.parse(new Date());
          var extension = /\.([^.]*)$/.exec(that.data.src);
          extension = extension[1].toLowerCase();
          var name = timestamp + "." + extension; //上传图片的别名
          var file = wx.Bmob.File(name, that.data.src);
          var success = false;
          file.save().then(res => {
            park.set("parkpic", JSON.parse(res[0])); //转JSON对象后存入
            park.save().then(res => {
              success = true;
            }).catch(err => {
              console.log(err)
            })
          })
        } else {
          park.save().then(res => {
            success = true;
          }).catch(err => {
            console.log(err)
          })
        }
        if (success = true) {
          console.log("更新成功");
          that.setData({
            isLoading: false,
            isdisabled: false,
            parkId: park.objectId,
          })
          common.showTip("更新成功", "success", function () {
            wx.navigateTo({
              url: "/pages/parkingSpace/parkingSpace"
            });
          });
        }
      }).catch(err => {
        console.log("更新失败=" + err);
        common.showTip("更新失败", "loading");
        that.setData({
          isLoading: false,
          isdisabled: false
        })
      })
    }
  },

  getStatusIndex: function (name) {
    var statusIndex = 0;
    if (name == "可租用") statusIndex = 0;
    else if (name == "使用中") statusIndex = 1;
    else if (name == "已停租") statusIndex = 2;
    return statusIndex;
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})