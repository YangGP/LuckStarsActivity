/**
 *----------------------------------------------
 * Author: SCH
 * Create Time: 2018/2/6 14:13
 * Desc: activeDao
 *
 * Changed list:
 *        Change author:(若修改请指明修改者)
 *        Change desc:(修改描叙)
 *        Change time:(修改的时间)
 *----------------------------------------------
 **/

var pomelo = require('pomelo');
var Active = require('../entity/active');
var utils = require('../../utils/utils');

var activeDao = module.exports;

/**
 * 新增用户活动记录
 * @param user
 * @param callback
 */
activeDao.addUserActive = function(user, callback) {

    var userName = user.userName || 'none';
    var buyTime = user.buyTime || 'none';
    var awardStateList = user.awardStateList || '[0,0,0,0,0,0,0,0]';
    var totalPay = user.totalPay || 0;
    var receiveLeave = user.receiveLeave || '[0,0,0,0,0,0,0]';

    var sql = 'insert into active ' +
        '(userName, buyTime, awardStateList, totalPay, receiveLeave) values ' +
        '(?, ?, ?, ?, ?)';

    var args = [userName, buyTime, awardStateList, totalPay, receiveLeave];

    pomelo.app.get('dbClient').query(sql, args, function(err, res){
        utils.invokeCallback(callback, err, res);
    });
};

/**
 * 获取用户活动信息
 * @param userName 用户名
 * @param callback  将用户信息反馈出去
 */
activeDao.getUserActive = function(userName, callback){
    var sql = 'select * from active where userName=?';
    var args = [userName];

    pomelo.app.get('dbClient').query(sql, args, function(err, res){
        if(err)
        {
            var result = {};
            result.flag = false;
            result.msg = 'query db error';

            utils.invokeCallback(callback, new Error('query db error'), result);
        }
        else
        {
            if(res && res.length > 0)
            {
                var userActiveList = new Array();

                for(var index=0 ; index<res.length ; index++)
                {
                    var user = new Active(res[index]);

                    userActiveList.push(user);
                }

                utils.invokeCallback(callback, null, userActiveList);
            }
            else
            {
                utils.invokeCallback(callback, null, []);
            }
        }
    })
};

/**
 * 修改用户充值档位状态
 * @param userName   用户账号
 * @param awardStateList   用户充值档位状态
 * @param callback
 */
activeDao.updateUserAwardStateList = function(userName, awardStateList, callback){
    var sql = 'update active set awardStateList=? where userName=?';
    var args = [awardStateList, userName];

    pomelo.app.get('dbClient').query(sql, args, function(err, res){
        utils.invokeCallback(callback, err, res);
    });
};

/**
 * 修改用户充值时间
 * @param userName   用户账号
 * @param buyTime   用户充值时间
 * @param callback
 */
activeDao.updateUserBuyTime = function(userName, buyTime, callback){
    var sql = 'update active set buyTime=? where userName=?';
    var args = [buyTime, userName];

    pomelo.app.get('dbClient').query(sql, args, function(err, res){
        utils.invokeCallback(callback, err, res);
    });
};

/**
 * 累加用户充值金额
 * @param userName   用户账号
 * @param totalPay  充值总额
 * @param callback
 */
activeDao.updateUserTotalPay = function(userName, totalPay, callback){
    var sql = 'update active set totalPay=? where userName=?';
    var args = [totalPay, userName];

    pomelo.app.get('dbClient').query(sql, args, function(err, res){
        utils.invokeCallback(callback, err, res);
    });
};

/**
 * 累加用户大奖领取档位
 * @param userName      用户账号
 * @param receiveLeave  大奖档位
 * @param callback
 */
activeDao.updateUserReceiveLeave = function(userName, receiveLeave, callback){
    var sql = 'update active set receiveLeave=? where userName=?';
    var args = [receiveLeave, userName];

    pomelo.app.get('dbClient').query(sql, args, function(err, res){
        utils.invokeCallback(callback, err, res);
    });
};








