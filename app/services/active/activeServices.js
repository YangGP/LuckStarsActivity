/**
 *----------------------------------------------
 * Author: SCH
 * Create Time: 2018/2/6 14:02
 * Desc: 活动服务器，处理活动相关业务
 *
 * var userBuff = {
 *                      userName:{
 *                          userName ：userName，                 用户Id
 *                          buyTime ：buyTime，                   用户领取充值奖励的时间
 *                          awardStateList ：awardStateList，     用户领取奖励的档位状态
 *                          totalPay ：totalPay，                 用户的累计充值
 *                          receiveLeave ：receiveLeave          用户的累计奖励领取档位 0表示还未领取过
 *                      }
 *                  }
 *
 * Changed list:
 *        Change author:(若修改请指明修改者)
 *        Change desc:(修改描叙)
 *        Change time:(修改的时间)
 *----------------------------------------------
 **/
var async = require('async');
var utils = require('../../../utils/utils');
var myTools = require('../../../utils/myTools');
var activeDao = require('../../../app/dao/activeDao');
var userConst = require('../../../consts/userConst');
var activeConst = require('../../../consts/activeConst');

module.exports = function(app){
    return new Services(app);
};

var Services = function(app) {
    this.app = app;

    this.activeStartTime = '2018-02-14 00:00:00';       //活动开始时间
    this.activeEndTime = '2018-02-24 23:59:59';         //活动结束时间
    this.currentDay = 'none';                           //程序启动时的日期
    this.userBuff = {};                                 //缓存用户相关信息
};

var services = Services.prototype;

/**
 * 进程启动时执行
 * @param next
 */
services.startup = function(next){
    //获取相关的初始化数据信息
    utils.invokeCallback(next, null, null);
};

/**
 * 进程运行中的帧渲染
 */
services.update = function(){
    //凌晨的判断
    this._IsNextDay();
};

/**
 * 进程关闭之前执行
 * @param next
 */
services.shutdown = function(next){

};

/**
 * 在循环中判断，当前是否已经经过了凌晨
 * @private
 */
services._IsNextDay = function(){

    var today = myTools.getTime_YYMMDD(0);
    var self = this;

    //程序才启动,获取当前的日期
    if(this.currentDay == 'none')
    {
        this.currentDay = today;

        return;
    }

    //新的一天开始了
    if(this.currentDay != today)
    {
        this.currentDay = today;

    }

};

/**
 * 用户登陆活动页面
 * 1）先判断该用户内存中是否有相关信息
 * 2）没有则从数据库读取并缓存
 * 3）有则直接用
 * @param userName
 * @param callback
 */
services.userLogin = function (userName, callback) {
    var self = this;

    this._getUser(userName, function (err, res) {
        if(!!err)
        {
            console.log('get userActive wrong!');
            utils.invokeCallback(callback, new Error('get userActive wrong!'), null);
            return
        }

        var result = {};
        result.userName = res.userName;
        result.awardStateList = JSON.stringify(res.awardStateList);
        result.totalPay = res.totalPay;
        result.receiveLeave = JSON.stringify(res.receiveLeave);

        result.webBuy = activeConst.webBuy;
        result.awardLeave = activeConst.awardLeave;

        //活动状态判断
        if(new Date(self.activeStartTime) > new Date(myTools.getNowFormatDate(0)))
        {
            result.activeFlag = 'before'
        }
        else if(new Date(self.activeEndTime) < new Date(myTools.getNowFormatDate(0)))
        {
            result.activeFlag = 'after'
        }
        else
        {
            result.activeFlag = 'starting'
        }

        //判断用户最后支付时间是否是今天，如果不是，则需要更新awardStateList
        var buyTime = res.buyTime.substr(0,10);
        if(buyTime != self.currentDay)
        {
            self.userBuff[userName].awardStateList = [0,0,0,0,0,0,0,0];               //修改内存
            result.awardStateList = '[0,0,0,0,0,0,0,0]';
            activeDao.updateUserAwardStateList(userName, '[0,0,0,0,0,0,0,0]', null);    //修改数据库
        }

        utils.invokeCallback(callback, null, result);
    })
};

/**
 * 用户当前档位当天是否允许充值
 * @param userName
 * @param activeType
 * @param callback      true=未充值，允许充值，false=已充值，不允许充值
 */
services.userPayFlag = function (userName, activeType, callback) {
    this._getUserPayInfo(userName, function (err, res) {
        if(!!err)
        {
            utils.invokeCallback(callback, new Error(), null);
            return
        }
        if(res[activeType-1] == 0)
        {
            utils.invokeCallback(callback, null, true);
            return
        }
        utils.invokeCallback(callback, null, false);
    })
};

/**
 * 修改该用户该天该档位的充值状态
 * 1,获取用户信息
 * 2,用户充值时间若不是今天，更新内存与数据库
 * 3,更新用户当日充值档位状态
 * @param userName
 * @param activeType
 * @param callback
 */
services.updateUserPay = function (userName, activeType, callback) {
    var self = this;
    this._pushUserToDB(userName, function (err, res) {
        if(!!err)
        {
            utils.invokeCallback(callback, new Error('没有该玩家账号'), null);
            return
        }
        //充值时间不是今日，修改内存与数据库充值时间
        if(self.userBuff[userName].buyTime != self.currentDay)
        {
            self.userBuff[userName].buyTime = self.currentDay;
            activeDao.updateUserBuyTime(userName, self.userBuff[userName].buyTime, null);
        }
        //修改用户充值档位状态，内存与数据库
        self.userBuff[userName].awardStateList[activeType-1] = 1;
        activeDao.updateUserAwardStateList(userName, JSON.stringify(self.userBuff[userName].awardStateList), null);

        utils.invokeCallback(callback, null, null);
    })
};

/**
 * 累加用户充值金额
 * 1，内存与数据库
 * 2，充值金额达到累计档位，通知集群发送邮件
 * @param userName
 * @param payCount      分
 * @param callback
 */
services.addUserTotalPay = function (userName, payCount, callback) {
    var self = this;
    self._getUser(userName, function (err, res) {
        if(!!err)
        {
            utils.invokeCallback(callback, new Error('没有该玩家账号'), null);
            return
        }

        var left = self.userBuff[userName].totalPay/100;
        var right = self.userBuff[userName].totalPay/100 + payCount/100;
        var list = [50, 100, 200, 500, 1000, 2000, 5000];

        self.userBuff[userName].totalPay += payCount;
        activeDao.updateUserTotalPay(userName, self.userBuff[userName].totalPay, null);

        for(var i = 0;i< list.length;i++)
        {
            if(left <= list[i] <= right && left != right)
            {
                utils.invokeCallback(callback, null, '发送邮件');
                return
            }
        }
        utils.invokeCallback(callback, null, 'none')
    })
};

/**
 * 用户该档位累计大奖是否允许领取
 * 1,查询玩家信息
 * 2,充值总额大于领取档位且该档位未领取
 * @param userName
 * @param level
 * @param callback          true=未领取，允许领取，false=已领取，不允许领取
 */
services.getUserBigPrizeFlag = function (userName, level, callback) {

    this._pushUserToDB(userName, function (err, res) {
        if(!!err)
        {
            utils.invokeCallback(callback, null, false);
            return
        }

        var userInfo = res;
        var totalPay = userInfo.totalPay;
        var receiveLeave = userInfo.receiveLeave;
        var index = activeConst.awardLeave.leaves.indexOf(parseInt(level));

        if(receiveLeave[index] == 0 && totalPay/100 >= level)
        {
            utils.invokeCallback(callback, null, true);
            return
        }
        utils.invokeCallback(callback, null, false);
    })
};

/**
 * 修改该用户该大奖领取状态（内存与数据库）
 * @param userName
 * @param level
 * @param state       0 or 1
 * @param callback
 */
services.updateBigPrizeFlag = function (userName, level, state, callback) {
    var self = this;
    this._pushUserToDB(userName, function (err, res) {
        if(!!err)
        {
            utils.invokeCallback(callback, new Error('没有该玩家账号'), null);
            return
        }

        //修改内存与数据库
        var index = activeConst.awardLeave.leaves.indexOf(parseInt(level));
        self.userBuff[userName].receiveLeave[index] = state;
        activeDao.updateUserReceiveLeave(userName, JSON.stringify(self.userBuff[userName].receiveLeave), null);

        utils.invokeCallback(callback, null, null);
    });

};

/**
 * 获取用户当天的充值档位信息
 * @param userName
 * @param callback
 */
services._getUserPayInfo = function (userName, callback) {
    var self = this;
    self._pushUserToDB(userName, function (err, res) {
        if(!!err)
        {
            utils.invokeCallback(callback, new Error('没有该玩家账号'), null);
            return
        }
        //判断用户最后支付时间是否是今天，如果不是，则需要更新awardStateList
        var buyTime = res.buyTime.substr(0,10);
        if(buyTime != self.currentDay)
        {
            self.userBuff[userName].awardStateList = [0,0,0,0,0,0,0,0];               //修改内存
            activeDao.updateUserAwardStateList(userName, '[0,0,0,0,0,0,0,0]', null);    //修改数据库
        }
        utils.invokeCallback(callback, null, self.userBuff[userName].awardStateList);
    })
};

/**
 * 用户登陆，创建用户信息
 * 1）先从内存中查找
 * 2）没有则从数据库读取并缓存
 * 3）数据库中没有则创建后反馈
 * @param userName
 * @param callback
 * @private
 */
services._getUser = function (userName, callback) {
    var self = this;

    this._pushUserToDB(userName, function (err, res) {
        if(!!err)
        {
            //数据库中没有，创建记录并缓存
            var user = {
                userName : userName
            };
            activeDao.addUserActive(user, function (err, res) {
                if(!!err)
                {
                    utils.invokeCallback(callback, new Error('add userActive wrong!'), null);
                    return
                }
                self.userBuff[userName] = {};
                self.userBuff[userName].userName = userName;
                self.userBuff[userName].buyTime = 'none';
                self.userBuff[userName].awardStateList = [0,0,0,0,0,0,0,0];
                self.userBuff[userName].totalPay = 0;
                self.userBuff[userName].receiveLeave = [0,0,0,0,0,0,0];
                self.userBuff[userName].tid = setTimeout(function(){
                    self._userActiveClear(userName);
                }, userConst.USER_CLEAR);

                utils.invokeCallback(callback, null, self.userBuff[userName]);
            });

            return
        }

        utils.invokeCallback(callback, null, res);

    });
};

/**
 * 时间到了，清除用户活动信息
 * @param userName
 * @private
 */
services._userActiveClear = function (userName) {

    if(!userName || !(userName in this.userBuff))
    {
        return;
    }

    this.userBuff[userName].id = null;
    this.userBuff[userName].userName = null;
    this.userBuff[userName].buyTime = null;
    this.userBuff[userName].awardStateList = null;
    this.userBuff[userName].totalPay = null;
    this.userBuff[userName].receiveLeave = null;
    this.userBuff[userName].tid = null;
    delete this.userBuff[userName];
};

/**
 * 查询玩家信息，若内存没有则从数据库取出放入内存，！！err说明没有该玩家
 * @param userName
 * @param callback
 * @private
 */
services._pushUserToDB = function (userName, callback) {
    var self = this;

    //内存中有，直接取出使用
    if(userName in this.userBuff)
    {
        utils.invokeCallback(callback, null, this.userBuff[userName]);
        return
    }

    //内存中没有，查询数据库
    activeDao.getUserActive(userName, function (err, res) {
        if (!!err) {
            utils.invokeCallback(callback, new Error('get userActive wrong!'), null);
            return
        }
        //数据库中有，取出缓存并反馈
        if (!!res && res.length > 0) {
            var userActive = res[0];
            self.userBuff[userName] = {};
            self.userBuff[userName].userName = userActive.userName;
            self.userBuff[userName].buyTime = userActive.buyTime;
            self.userBuff[userName].awardStateList = JSON.parse(userActive.awardStateList);
            self.userBuff[userName].totalPay = userActive.totalPay;
            self.userBuff[userName].receiveLeave = JSON.parse(userActive.receiveLeave);
            self.userBuff[userName].tid = setTimeout(function () {
                self._userActiveClear(userName);
            }, userConst.USER_CLEAR);

            utils.invokeCallback(callback, null, self.userBuff[userName]);
            return
        }
        utils.invokeCallback(callback, new Error(), null);
    })
};




