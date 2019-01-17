// 实例化API核心类
//高德地图API
var amapFile = require('../../dist/amap-wx.js');
var myAmapFun = new amapFile.AMapWX({
  key: 'd2602f5d52c03f6bfebe6ca5dc2dc3e8'
});
const app = getApp()
var userId; //用户Id
var park;
var parkId;
Page({
  data: {
    loading: true,
    longitude: 0,
    latitude: 0,
    markers: [],
    scale: 16,
    status: '正在识别',
    minute: 0,
    second: 0,
    cost: 1,
    distance: 0
  },
  onLoad(t) {
    var that = this;
    parkId = t.parkId;
    //parkId = "ed996161b7"
    console.log(parkId)
    var userData = wx.getStorageSync("userData");
    userId = userData.objectId;
    var query = wx.Bmob.Query("Park")
    query.include("publisher", "_User");
    query.get(parkId).then(res => {
      console.log(res)
      park = res
      that.riding(res);
      wx.getLocation({
        type: "gcj02",
        altitude: "true",
        success: function (t) {
          that.mapCtx.getCenterLocation({
            type: 'gcj02',
            success: (res) => {
              that.reDistance(res) //计算距离停车点的距离
            }
          })
          that.setData({
            cost: res.price,
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
        }
      });
    }).catch(err => {
      console.log(err)
    })
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
          this.reDistance(res) //重新计算距离停车点的距离
        }
      })
    }
  },
  //路径规划
  markertap: function () {
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
  //计算当前点到停车位的距离
  reDistance: function (res) {
    let lat1 = res.latitude;
    let lng1 = res.longitude;
    let lng2 = park.longitude;
    let lat2 = park.latitude;
    //计算距离
    let t = this.getDistance(lat1, lng1, lat2, lng2);
    this.setData({
      distance: t
    })
  },
  //获取当前车位
  getPark: function (parkId) {
    var point;
    return point;
  },
  onReady() {
    // 创建map上下文  保存map信息的对象
    this.mapCtx = wx.createMapContext('myMap');
  },
  //定位到用户当前位置
  toReset: function () {
    this.mapCtx.moveToLocation();
    this.setData({
      scale: 16
    })
  },
  //导航回到车位
  btnNavacation: function () {
    wx.openLocation({
      latitude: park.latitude,
      longitude: park.longitude,
      scale: 16,
      name: park.ownname,
      address: park.address
    });
  },
  toLock() {
    clearInterval(this.timer);
    this.timer = "";
    var parktime = this.data.minute + "分" + this.data.second + "秒"
    wx.redirectTo({
      url: '/pages/pay/pay?parkId=' + parkId + "&parkcost=" + this.data.cost + "&parktime=" + parktime
    })
  },
  charge() {
    wx.navigateTo({
      url: '/pages/charge/charge?price=' + park.price + "&cost=" + this.data.cost,
    })
  },
  // 重置租用中的车位
  riding(res) {
    let longitude = res.longitude;
    let latitude = res.latitude;
    let markers = [{
      "id": 0,
      "iconPath": "/images/icon_markDe.png",
      "callout": {},
      "longitude": longitude,
      "latitude": latitude,
      "width": 36,
      "height": 49
    }]
    this.setData({
      markers
    })
    //模拟识别过程 耗时1.5秒
    setTimeout(() => {
      let callout = "markers[" + 0 + "].callout";
      this.setData({
        loading: false,
        status: '识别成功',
        [callout]: {
          "content": '租用中',
          "color": "#ffffff",
          "fontSize": "16",
          "borderRadius": "50",
          "padding": "10",
          "bgColor": "#0082FCaa",
          "display": 'ALWAYS'
        }
      })
    }, 1500)
    this.Time()
  },
  Time() {
    let s = 0;
    let m = 0
    // 计时开始
    this.timer = setInterval(() => {
      this.setData({
        second: s++
      })
      if (s == 60) {
        s = 0;
        m++;
        setTimeout(() => {
          this.setData({
            minute: m,
            cost: Math.ceil(m / 60) * park.price
          });
        }, 1000)
      };
    }, 1000)
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
})