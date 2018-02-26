/**
 *----------------------------------------------
 * Author: xujie
 * Create Time: 2016/06/16 17:26
 * Desc: (这里写描叙)
 * http服务器的路由
 * Changed list:
 *        Change author:(若修改请指明修改者)
 *        Change desc:(修改描叙)
 *        Change time:(修改的时间)
 *----------------------------------------------
 **/
var crypto = require('crypto');
var myTools = require('../../../../utils/myTools');
var url = require('url');
var request = require('request');
var utils = require('../../../../utils/utils');
var async = require('async');


module.exports = function (app, http) {
    return new Handler(app, http);
};

var Handler = function (app, http) {
    this.app = app;
    this.http = http;
    this.str = '1XcsBhAjreWlresV';                                              //密匙
    this.key = 'ynD8BJqmvfTnC3oz8Uwl3YUuzOQgDrLi8EnS5BM9VRmw0RrdFA';            //key值
    this.activeStartTime = '2018-02-14 00:00:00';       //活动开始时间
    this.activeEndTime = '2018-02-24 23:59:59';         //活动结束时间

    this.setRoutes();

};

var handler = Handler.prototype;

handler.setRoutes = function () {

    //路由中间件，用于通信报文加密
    var self = this;
    this.http.post('*', function (req, res, next) {
        var baseUrl = req.params[0];
        console.log(baseUrl);

        if(baseUrl == '/askActiveBuyAward' || baseUrl == '/askActiveTotalPayAward' || baseUrl == '/userPayEvent')
        {
            var params = req.body;
            var ciphertext = params.ciphertext;                     //密文
            var str = self.str;                                     //密匙

            var secret = myTools.decryptAES(ciphertext, str);       //解密
            var timestamp = secret.split("#$#")[0];                 //时间戳
            var key = secret.split("#$#")[1];                       //key值
            var now = (new Date()).valueOf();                       //当前时间戳
            var timeOffset = now - timestamp;                       //时间偏移量

            if(key != self.key || timeOffset > 3000)
            {
                res.send({"status": "fail", "data": 'who are you ??'});
                return
            }

            next();
            return
        }

        next();
    });

    this.http.get('/', this.index.bind(this));

    //用户进入活动页面
    this.http.post('/userLogin', this.userLogin.bind(this));

    //用户充值事件
    this.http.post('/userPayEvent', this.userPayEvent.bind(this));

    //用户在活动页面支付
    this.http.post('/userPayInWeb', this.userPayInWeb.bind(this));

    //集群询问活动服务器是否允许发放额外奖励
    this.http.post('/askActiveBuyAward', this.askActiveBuyAward.bind(this));

    //用户点击领取累计充值大奖
    this.http.post('/getBigPrize', this.getBigPrize.bind(this));

    //集群询问活动服务器是否允许领取累计大奖
    this.http.post('/askActiveTotalPayAward', this.askActiveTotalPayAward.bind(this));
};

handler.index = function (Req, Res) {
    Res.render('index');
};

/**
 * 用户进入活动页面
 * @param Req
 * @param Res
 */
handler.userLogin = function (Req, Res) {
    var self = this;
    var method = Req.body.method;

    if(method == 'login')
    {
        var userName = Req.body.userName;
        self.app.rpc.active.activeRemote.userLogin({specificUserName : userName}, userName, function (err, res) {
            if(!!err)
            {
                Res.send('get msg fail');
                return
            }
            Res.send(res);
        });
    }
};

/**
 * 用户支付事件
 * 1，累加充值金额
 * 2，判断是否达到档位，达到则反馈“发送邮件”
 * @param Req
 * @param Res
 */
handler.userPayEvent = function (Req, Res) {
    var self = this;

    var time = myTools.getNowFormatDate(0);
    if(time < self.activeStartTime || time > self.activeEndTime)
    {
        Res.send({"status": "fail", "data": '不在活动时间内'});
        return
    }

    //累加充值金额
    var userName = Req.body.userName;
    var payCount = Req.body.payCount;
    self.app.rpc.active.activeRemote.addUserTotalPay({specificUserName : userName}, userName, payCount, function (err,res) {
        if(!!err)
        {
            console.log('累加充值金额失败');
            Res.send({"status": "fail", "data": '累加充值金额失败'});
            return
        }
        Res.send({"status": "success", "data": res});
    });
};

/**
 * 用户在H5中支付
 * @param Req
 * @param Res
 */
handler.userPayInWeb = function (Req, Res) {

    var self = this;

    var time = myTools.getNowFormatDate(0);
    if(time < self.activeStartTime || time > self.activeEndTime)
    {
        Res.send('不在活动时间内');
        return
    }

    var method = Req.body.method;

    if(method == 'userPayInWeb')
    {
        var userName = Req.body.userName;       //用户账号
        var activeType = Req.body.activeType;   //充值档位
        var userIp = Req.body.userIp;           //用户IP

        self.app.rpc.active.activeRemote.userPayFlag({specificUserName : userName}, userName, activeType, function (err, res) {
            if(res)         //未充值，允许充值
            {
                var requestData = {
                    userName : userName,
                    activeType : activeType,
                    userIp : userIp
                };
                self.requestMsg('userPayInWeb', requestData, function(err, res){
                    if(!!err)
                    {
                        Res.send('生成预支付订单失败');
                        return
                    }
                    Res.send(res.mweb_url);
                });
            }
            else            //已充值，不允许充值
            {
                Res.send('该档位当天已充值');
            }
        });
    }

};

/**
 * 集群询问活动服务器是否允许发放额外奖励
 * 1，判断该档位是否已充值
 * 2，若未充值，则允许发放额外金币，并修改档位状态
 * @param Req
 * @param Res
 */
handler.askActiveBuyAward = function (Req, Res) {
    var self = this;

    var time = myTools.getNowFormatDate(0);
    if(time < self.activeStartTime || time > self.activeEndTime)
    {
        Res.send({"status": "fail", "data": '不在活动时间内'});
        return
    }

    var userName = Req.body.userName;
    var activeType = Req.body.level;
    this.app.rpc.active.activeRemote.userPayFlag({specificUserName : userName}, userName, activeType, function (err, res) {
        if(res) //未充值
        {
            Res.send({"status": "success", "data": '允许发放奖励'});

            //修改档位状态
            self.app.rpc.active.activeRemote.updateUserPay({specificUserName : userName}, userName, activeType, function (err,res) {});
            return
        }
        Res.send({"status": "fail", "data": '不允许发放奖励'});
    })
};

/**
 * 用户点击领取累计充值大奖
 * 1,判断大奖是否允许领取
 * @param Req
 * @param Res
 */
handler.getBigPrize = function (Req, Res) {
    var self = this;

    var time = myTools.getNowFormatDate(0);
    if(time < self.activeStartTime || time > '2018-03-06 23:59:59')
    {
        Res.send('不在领取时间内');
        return
    }

    var method = Req.body.method;

    if(method == 'userGetBigPrize')
    {
        var userName = Req.body.userName;
        var level = Req.body.level;
        async.waterfall([
            function (next) {                   //是否允许领奖
                self.app.rpc.active.activeRemote.getUserBigPrizeFlag({specificUserName : userName}, userName, level, function (err, res) {
                    if(!res)
                    {
                        Res.send('领取失败');
                        return
                    }
                    utils.invokeCallback(next, null, null)
                })
            }, function (res, next) {           //请求发奖
                var requestData = {
                    userName : userName,
                    level : level
                };
                self.requestMsg('userGetBigPrize', requestData, function(err, res){
                    if(!!err)
                    {
                        Res.send('领取失败');
                        utils.invokeCallback(next, null, null);
                        return
                    }
                    Res.send('领取成功');
                });
            }
        ], function (err, res) {        //领取失败，修改内存与数据库该档位状态
            self.app.rpc.active.activeRemote.updateBigPrizeFlag({specificUserName : userName}, userName, level, 0, function (err, res) {})
        });
    }

};

/**
 * 集群询问活动服务器是否允许领取累计大奖
 * @param Req
 * @param Res
 */
handler.askActiveTotalPayAward = function (Req, Res) {
    var self = this;

    var time = myTools.getNowFormatDate(0);
    if(time < self.activeStartTime || time > self.activeEndTime)
    {
        Res.send({"status": "fail", "data": '不在活动时间内'});
        return
    }

    var userName = Req.body.userName;
    var level = Req.body.level;
    async.waterfall([
        function (next) {           //询问是否允许领奖
            self.app.rpc.active.activeRemote.getUserBigPrizeFlag({specificUserName : userName}, userName, level, function (err, res) {
                if(!res)
                {
                    Res.send({"status": "fail", "data": '不允许领取大奖'});
                    return
                }
                Res.send({"status": "success", "data": '允许领取大奖'});
                utils.invokeCallback(next, null, null);
            })
        }
    ], function (err, res) {        //修改大奖领取状态
        self.app.rpc.active.activeRemote.updateBigPrizeFlag({specificUserName : userName}, userName, level, 1, function (err, res) {})
    })

};

/**
 * request函数的封装
 * @param routeName  路由的名字
 * @param routeData  携带的参数
 * @param callback
 */
handler.requestMsg = function(routeName, routeData, callback){

    var self = this;
    var key = 'ynD8BJqmvfTnC3oz8Uwl3YUuzOQgDrLi8EnS5BM9VRmw0RrdFA';                 //key值，固定值
    var str = '1XcsBhAjreWlresV';                                                   //密匙，固定值
    var timestamp = (new Date()).valueOf();                                         //时间戳
    routeData.ciphertext = myTools.encryptAES(timestamp + '#$#' + key, str);           //为参数添加密文

    request({
        url: 'http://114.55.219.50:3050/'+ routeName,
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(routeData),
        timeout: 10000
    }, function (error, response, body) {
        var getData = self.parseData(error, response, body);
        if(getData.status == 'success')
        {
            utils.invokeCallback(callback, null, getData.data);
            return;
        }

        utils.invokeCallback(callback, new Error(), getData.data);
    });
};

/**
 * 对request反馈数据的解析
 * @param error
 * @param response
 * @param body
 * @returns {*}  {"status": "success"/"fail", "data": res}
 */
handler.parseData = function(error, response, body){
    var result = {
        status: 'fail',
        data: '请求出错'
    };

    //判断本次会话状态
    if (!error && response.statusCode == 200 && !!body)
    {
        try
        {
            result = JSON.parse(body);
        }
        catch (err)
        {
            result.data = '解析出错'
        }
    }

    return result;
};
