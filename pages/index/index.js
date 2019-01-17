var o = getApp();
//高德地图API
var amapFile = require('../../dist/amap-wx.js');
var myAmapFun = new amapFile.AMapWX({
  key: 'd2602f5d52c03f6bfebe6ca5dc2dc3e8'
});

Page({
  data: {
    hasMarker: false,
    //底部显示对象
    bottomObj: {
      name: '',
      address: '',
      distance: '',
      price: '',
      lat: '',
      lng: '',
    },
    minIndex: 0,
    latitude: "",
    longitude: "",
    parkpicno: '../../images/paring-no.png', //可以使用
    parkpicdo: '../../images/icon_markDe.png', //正在使用
    parkpicnear: '../../images/icon_mark.png', //距离最近

    //当前地图的缩放级别
    scale: 16,
    //车位标记物
    markers: [],
    point: {
      latitude: 0,
      longitude: 0
    },
    circles: [],
    currentMarkId: -1,
    parkSearchs: [],
    nearestParkSearch: {
      distance: "",
      parkerName: "",
      freeSpace: "",
      fristPrice: "",
      lastPrice: ""
    }
  },
  onShow: function () {
    var that = this;
    var userInfo = wx.getStorageSync("userInfo");
    this.setData({
      userInfo: userInfo
    })
    that.requestParkMarker();


  },
  onReady: function (e) {
    // 创建map上下文  保存map信息的对象
    this.mapCtx = wx.createMapContext("myMap");
  },

  onLoad: function () {
    var e = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.getLocation({
      type: "gcj02",
      altitude: "true",
      success: function (t) {
        e.setData({
          latitude: t.latitude,
          longitude: t.longitude,
          circles: [{
            latitude: t.latitude,
            longitude: t.longitude,
            fillColor: "#7cb5ec22",
            radius: 1e3,
            color: "#7cb5ec11"
          }]
        });

        setTimeout(() => {
          e.mapCtx.getCenterLocation({
            type: 'gcj02',
            success: (res) => {
              e.handleMarkers(res)
            }
          })
          wx.hideLoading();
        }, 1000)
      }
    });
  },

  //视野发生变化触发
  regionchange: function (e) {
    if (e.type == 'begin') {
      this.mapCtx.getCenterLocation({
        type: 'gcj02',
        success: (res) => {
          this.setData({
            polyline: []
          })
        }
      })
    }
    if (e.type == 'end') {
      this.mapCtx.getCenterLocation({
        type: 'gcj02',
        success: (res) => {
          console.log("地图移动中点longitude：" + res.longitude)
          console.log("地图移动中点latitude：" + res.latitude)
          this.setData({
            markers: [],
            hasMarker: false,
            circles: [{
              latitude: res.latitude,
              longitude: res.longitude,
              fillColor: "#7cb5ec22",
              radius: 1e3,
              color: "#7cb5ec11"
            }]
          })
        }
      })
      this.mapCtx.getCenterLocation({
        type: 'gcj02',
        success: (res) => {
          this.handleMarkers(res) //重新计算距离最近的车位
        }
      })
    }
  },

  //定位到用户当前位置
  toReset: function () {
    this.mapCtx.moveToLocation();
    this.setData({
      scale: 16
    })
  },

  /**
   * 点击标记点时触发
   * 1.将最近距离点上的旧气泡删除，添加新气泡
   * 2.改变颜色
   * 3.计算距离
   */
  markertap: function (e) {
    let park = e.markerId;
    console.log(park)
    let markers = this.data.markers;
    this.route(markers[park]) //先规划路径
    //再改变气泡颜色,清除旧气泡,设置新气泡
    let bottomObj = this.setBottomObj(markers[park], markers[park].distance)

    for (let i = 0; i < markers.length; i++) {
      if (markers[i].iconPath == this.data.parkpicnear) {
        markers[i].iconPath = this.data.parkpicno
      }
      markers[i].callout = ''
    }
    let callout = `markers[${park}].callout`;

    var title = markers[park].name
    if (title.length > 5) {
      title = title.substring(0, 5) + "...";
    }
    markers[park].iconPath = this.data.parkpicnear
    this.setData({
      hasMarker: true,
      markers: markers,
      bottomObj: bottomObj,
      currentMarkId: park,
      [callout]: {
        "content": title,
        "color": "#ffffff",
        "fontSize": "16",
        "borderRadius": "50",
        "padding": "10",
        "bgColor": "#0082FCaa",
        "display": 'ALWAYS'
      }
    })
  },

  //转个人中心
  toUser: function () {
    wx.navigateTo({
      url: "../personalCenter/personalCenter"
    });
  },

  //导航
  btnNavacation: function () {
    var e = this.data.bottomObj;
    wx.openLocation({
      latitude: e.lat,
      longitude: e.lng,
      scale: 18,
      name: e.name,
      address: e.address
    });
  },

  //转到详情页面
  toDetail: function () {
    var e = this
    var t = e.data.currentMarkId
    var a = e.data.markers
    null != a && a.length > 0 && -1 != t && wx.navigateTo({
      url: "/pages/parkingSpaceDetail/parkingSpaceDetail?parkId=" + a[t].point.objectId
    });
  },

  //计算两点之间的距离/m
  getDistance: function (lat1, lng1, lat2, lng2) {
    var radLat1 = lat1 * Math.PI / 180.0;
    var radLat2 = lat2 * Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137; // EARTH_RADIUS;
    s = Math.round(s * 10000) / 10;
    return s;
  },

  /*计算距离
    1.并找出最近的车位的位置
    2.只显示在1200米内的车位
  */
  handleMarkers: function (res) {
    let markers = wx.getStorageSync("parklist");
    let returnMarkers = [];
    let minIndex = 0; //最短距离的下标
    let distanceArr = [];
    let lat1 = res.latitude;
    let lng1 = res.longitude;
    for (let i = 0; i < markers.length; i++) {
      let lng2 = markers[i].longitude;
      let lat2 = markers[i].latitude;
      //计算距离
      let t = this.getDistance(lat1, lng1, lat2, lng2);
      if (parseFloat(t) <= 1200) {
        //从中找出在1200米内的
        markers[i].distance = t
        returnMarkers.push(markers[i])
        // 将每一次计算的距离加入数组 distanceArr
        distanceArr.push(t)
      }
    }

    //如果1200米内有车位
    if (returnMarkers.length > 0) {
      console.log(distanceArr)
      let min = distanceArr[0];
      for (let i = 0; i < distanceArr.length; i++) {
        //从距离数组中找出最小值，js是弱类型，数字不能直接比较大小。需要进行转换用 parseFloat（小数）  | parseInt（整数）
        if (parseFloat(distanceArr[i]) < parseFloat(min)) {
          min = distanceArr[i];
          minIndex = i;
        }
      }
      returnMarkers = this.diffMarker(returnMarkers);
      console.log(returnMarkers)
      let bottomObj = this.setBottomObj(returnMarkers[minIndex], min)
      let callout = `markers[${minIndex}].callout`;
      //清除旧气泡,设置新气泡
      returnMarkers[minIndex].iconPath = this.data.parkpicnear
      this.setData({
        hasMarker: true,
        minIndex: minIndex,
        markers: returnMarkers,
        bottomObj: bottomObj,
        currentMarkId: minIndex,
        [callout]: {
          "content": '离我最近',
          "color": "#ffffff",
          "fontSize": "16",
          "borderRadius": "50",
          "padding": "10",
          "bgColor": "#0082FCaa",
          "display": 'ALWAYS'
        }
      })
    }
  },

  //设置bottomObj
  setBottomObj: function (marker, min) {
    let bottomObj = this.data.bottomObj
    bottomObj.name = marker.point.ownname
    if (marker.point.address.length > 12) {
      marker.point.address = marker.point.address.substring(0, 12) + "...";
    }
    bottomObj.address = marker.point.address
    bottomObj.distance = min
    bottomObj.price = marker.point.price
    bottomObj.lat = marker.point.latitude
    bottomObj.lng = marker.point.longitude
    return bottomObj;
  },

  //获取车位
  /*
    e:latitude: 纬度
    o:longitude：经度
  */
  requestParkMarker: function () {
    var that = this;
    var park = wx.Bmob.Query("Park");
    park.equalTo("status", "!=", '已停租');
    park.include("publisher", "_User");
    park.find().then(res => {
      //数据暂时存储到本地
      wx.setStorageSync('parklist', res);
    })
  },

  //根据车位不是状态设置不同的标记
  diffMarker(res) {
    let markers = [];
    for (let i = 0; i < res.length; i++) {
      let marker;
      if (res[i].status == '可租用') {
        marker = this.createMarker(res[i], this.data.parkpicno, i)
      } else if (res[i].status == '使用中') {
        marker = this.createMarker(res[i], this.data.parkpicdo, i)
      }
      markers.push(marker)
    }
    return markers;
  },

  //创建地图上的点
  createMarker(point, pic, i) {
    let marker = {
      point: point,
      distance: point.distance,
      iconPath: pic,
      id: i || 0,
      name: point.ownname || '',
      latitude: point.latitude,
      longitude: point.longitude,
      width: 36,
      height: 49,
    };
    return marker;
  },

  //最短路径规划
  route: function (park) {
    // 获取当前中心经纬度
    this.mapCtx.getCenterLocation({
      success: (res) => {
        // 调用高德地图步行路径规划API
        myAmapFun.getWalkingRoute({
          origin: `${res.longitude},${res.latitude}`,
          destination: `${park.longitude},${park.latitude}`,
          success: (data) => {
            let points = [];
            if (data.paths && data.paths[0] && data.paths[0].steps) {
              let steps = data.paths[0].steps;
              for (let i = 0; i < steps.length; i++) {
                let poLen = steps[i].polyline.split(';');
                for (let j = 0; j < poLen.length; j++) {
                  points.push({
                    longitude: parseFloat(poLen[j].split(',')[0]),
                    latitude: parseFloat(poLen[j].split(',')[1])
                  })
                }
              }
            }
            // 设置map组件polyline，绘制线路
            this.setData({
              polyline: [{
                points: points,
                color: "#ffffffaa",
                arrowLine: true,
                borderColor: "#3891f8",
                borderWidth: 2,
                width: 5,
              }]
            });
          }
        })
      }
    })
  },
});