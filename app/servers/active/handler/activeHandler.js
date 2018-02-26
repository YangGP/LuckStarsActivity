/**
 *----------------------------------------------
 * Author: SCH
 * Create Time: 2018/2/6 13:06
 * Desc: 活动服务器，处理活动业务
 *
 * Changed list:
 *        Change author:(若修改请指明修改者)
 *        Change desc:(修改描叙)
 *        Change time:(修改的时间)
 *----------------------------------------------
 **/

module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
};

var handler = Handler.prototype;