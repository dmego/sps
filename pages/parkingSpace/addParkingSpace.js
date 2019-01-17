//获取应用实例
var app = getApp()
var r = require("../../utils/utils.js")
var common = require("../../utils/common.js")
var that;
var userId; //用户Id
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
    that = this;
    var userData = wx.getStorageSync("userData");
    userId = userData.objectId;
    that.setData({ //初始化数据
      src: "",
      isSrc: false,
      isLoading: false,
      loading: true,
      isdisabled: false
    })
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
    this.setData({
      startdate: r.formatTime(new Date(new Date((r.formatDate(new Date()) + " " + r.formatTimedetail(new Date())).replace(new RegExp("-", "gm"), "/")).getTime() + 3e5), "Y-M-D"),
      starttime: r.formatTime(new Date(new Date((r.formatDate(new Date()) + " " + r.formatTimedetail(new Date())).replace(new RegExp("-", "gm"), "/")).getTime() + 3e5), "h:m"),
      enddate: r.formatTime(new Date(new Date((r.formatDate(new Date()) + " " + r.formatTimedetail(new Date())).replace(new RegExp("-", "gm"), "/")).getTime() + 39e5), "Y-M-D"),
      endtime: r.formatTime(new Date(new Date((r.formatDate(new Date()) + " " + r.formatTimedetail(new Date())).replace(new RegExp("-", "gm"), "/")).getTime() + 39e5), "h:m"),
    })
  },
  //初始化日期时间数据
  initTime: function () {
    this.setData({
      startdate: r.formatTime(new Date(new Date((r.formatDate(new Date()) + " " + r.formatTimedetail(new Date())).replace(new RegExp("-", "gm"), "/")).getTime() + 3e5), "Y-M-D"),
      starttime: r.formatTime(new Date(new Date((r.formatDate(new Date()) + " " + r.formatTimedetail(new Date())).replace(new RegExp("-", "gm"), "/")).getTime() + 3e5), "h:m"),
      enddate: r.formatTime(new Date(new Date((r.formatDate(new Date()) + " " + r.formatTimedetail(new Date())).replace(new RegExp("-", "gm"), "/")).getTime() + 39e5), "Y-M-D"),
      endtime: r.formatTime(new Date(new Date((r.formatDate(new Date()) + " " + r.formatTimedetail(new Date())).replace(new RegExp("-", "gm"), "/")).getTime() + 39e5), "h:m"),
    })
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
  //表单验证
  showTopTips: function (tips) {
    var that = this;
    this.setData({
      showTopTips: true,
      TopTips: tips
    });
    setTimeout(function () {
      that.setData({
        showTopTips: false,
        TopTips: ''
      });
    }, 2000);
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
    //先进行表单验证
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
      //向车位表中新增一条数据
      var park = wx.Bmob.Query("Park");
      const pointer = wx.Bmob.Pointer('_User');
      const poiID = pointer.set(userId);
      park.set("publisher", poiID)
      park.set("ownname", ownname);
      park.set("ownphone", ownphone);
      park.set("address", address);
      park.set("longitude", longitude); //经度
      park.set("latitude", latitude); //纬度
      park.set("timeStart", timeStart);
      park.set("timeEnd", timeEnd);
      park.set("parkNumber", parkNumber);
      park.set("price", price);
      park.set("remark", remark);
      park.set("status", status); //初始化车位状态：1：可租用，2：租用中，3：已停租
      if (that.data.isSrc == true) {
        var timestamp = Date.parse(new Date());
        var extension = /\.([^.]*)$/.exec(that.data.src);
        extension = extension[1].toLowerCase();
        var name = timestamp + "." + extension; //上传图片的别名
        var file = wx.Bmob.File(name, that.data.src);
        file.save().then(res => {
          park.set("parkpic", JSON.parse(res[0])); //转JSON对象后存入
          park.save().then(res => {
            console.log(res)
            console.log("发布成功,objectId:" + res.objectId);
            that.setData({
              isLoading: false,
              isdisabled: false,
              parkId: res.objectId,
            })
            common.showTip("发布成功", "success", function () {
              //重置表单
              that.initTime;
              that.setData({
                isAgree: false,
                ownname: '',
                ownphone: '',
                address: '点击选择位置',
                longitude: 0, //经度
                latitude: 0, //纬度
                parkNumber: '',
                price: '',
                remark: '',
                noteMaxLen: 200, //备注最多字数
                noteNowLen: 0, //备注当前字数  
                src: "",
                isSrc: false,
              })
            });
          }).catch(err => {
            //添加失败
            console.log("发布失败=" + err);
            common.showTip("发布失败", "loading");
            that.setData({
              isLoading: false,
              isdisabled: false
            })
          })
        })
      }
    }
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