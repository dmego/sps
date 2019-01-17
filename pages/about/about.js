getApp();
Page({
  data: {
    versionData: "1.012",
    aboutImg: ""
  },
  onLoad: function(t) {
    this.requestAbout();
  },
  requestAbout: function() {
    var o = this;
    o.setData({
      aboutMenuList: [{
          groupName: "版本号",
          aboutText: "V1.0",
        }, {
          groupName: "开发团队",
          aboutText: "SPS团队",
        },
        {
          groupName: "联系电话",
          aboutText: "157-XXXX-XXXX",
        }
      ]
    });
  },
});