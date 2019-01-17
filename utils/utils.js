function e(e) {
  return (e = e.toString())[1] ? e : "0" + e;
}

module.exports = {
  formatTime: function (t, n) {
    var r = ["Y", "M", "D", "h", "m", "s"],
      u = [],
      o = new Date(t);
    u.push(o.getFullYear()), u.push(e(o.getMonth() + 1)), u.push(e(o.getDate())), u.push(e(o.getHours())),
      u.push(e(o.getMinutes())), u.push(e(o.getSeconds()));
    for (var i in u) n = n.replace(r[i], u[i]);
    return n;
  },
  formatDate: function (t) {
    return [t.getFullYear(), t.getMonth() + 1, t.getDate()].map(e).join("-");
  },
  formatTimedetail: function (t) {
    return [t.getHours(), t.getMinutes()].map(e).join(":");
  },
  formatSecondTimedetail: function (t) {
    return [t.getHours(), t.getMinutes(), t.getSeconds()].map(e).join(":");
  },
  telphoneNumberTimeEncryption: function (t) {
    return [t.getFullYear(), t.getMonth() + 1, t.getDate(), t.getHours()].map(e).join("");
  },
  getWeekOfDate: function (e) {
    return e.getDay();
  }
};