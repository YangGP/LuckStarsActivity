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

var pomelo = require('pomelo');
var async = require('async');
var utils = require('../../../../utils/utils');

module.exports = function (app) {
    return new ActiveRemote(app);
};

var ActiveRemote = function (app) {
    this.app = app;
};

var activeRemote = ActiveRemote.prototype;

/**
 * 用户登陆活动页面
 * @param userName
 * @param callback
 */
activeRemote.userLogin = function (userName, callback) {
    this.app.world.activeServices.userLogin(userName, function (err, res) {
        utils.invokeCallback(callback, err, res);
    });
};

/**
 * 用户当前充值档位当天是否允许充值
 * @param userName
 * @param activeType
 * @param callback
 */
activeRemote.userPayFlag = function (userName, activeType, callback) {
    this.app.world.activeServices.userPayFlag(userName, activeType, function (err, res) {
        utils.invokeCallback(callback, err, res);
    });
};

/**
 *修改该用户该天该档位的充值状态
 * @param userName
 * @param activeType
 * @param callback
 */
activeRemote.updateUserPay = function (userName, activeType, callback) {
    this.app.world.activeServices.updateUserPay(userName, activeType, function (err, res) {
        utils.invokeCallback(callback, err, res);
    });
};

/**
 * 累加用户充值金额
 * @param userName
 * @param activeType
 * @param callback
 */
activeRemote.addUserTotalPay = function (userName, activeType, callback) {
    this.app.world.activeServices.addUserTotalPay(userName, activeType, function (err, res) {
        utils.invokeCallback(callback, err, res);
    });
};

/**
 * 获取用户领取大奖档位信息
 * @param userName
 * @param level
 * @param callback
 */
activeRemote.getUserBigPrizeFlag = function (userName, level, callback) {
    this.app.world.activeServices.getUserBigPrizeFlag(userName, level, function (err, res) {
        utils.invokeCallback(callback, err, res);
    });
};

/**
 * 修改该用户该大奖领取状态
 * @param userName
 * @param level
 * @param state
 * @param callback
 */
activeRemote.updateBigPrizeFlag = function (userName, level, state, callback) {
    this.app.world.activeServices.updateBigPrizeFlag(userName, level, state, function (err, res) {
        utils.invokeCallback(callback, err, res);
    });
};


