/**
 *----------------------------------------------
 * Author: SCH
 * Create Time: 2018/2/6 14:04
 * Desc: active
 *
 * Changed list:
 *        Change author:(若修改请指明修改者)
 *        Change desc:(修改描叙)
 *        Change time:(修改的时间)
 *----------------------------------------------
 **/

var util = require('util');
var pomelo  = require('pomelo');

var active = function(opts){
    //自己的数据定义
    this.id = opts.id || 'none';                                        //记录的id
    this.userName = opts.userName || 'none';                            //用户Id
    this.buyTime = opts.buyTime || 'none';                              //用户领取充值奖励的时间 年月日
    this.awardStateList = opts.awardStateList || '[0,0,0,0,0,0,0,0]';   //用户领取奖励的档位状态
    this.totalPay = opts.totalPay || 0;                                 //用户的累计充值
    this.receiveLeave = opts.receiveLeave || '[0,0,0,0,0,0,0]';         //用户的累计奖励领取档位 0表示还未领取过
};

module.exports = active;



