/**
 *----------------------------------------------
 * Author: SCH
 * Create Time: 2018/2/6 13:31
 * Desc: 后端服务器路由规则
 *
 * Changed list:
 *        Change author:(若修改请指明修改者)
 *        Change desc:(修改描叙)
 *        Change time:(修改的时间)
 *----------------------------------------------
 **/

var exp = module.exports;
var dispatcher = require('./dispatcher');
var randomUtil = require('./randomUtil');

/**
 * 活动服务器路由
 *
 * session.specificId               active服务器    active-server-X
 * session.specificUserName
 * random                           随机
 *
 * @param session
 * @param msg
 * @param app
 * @param callback
 */
exp.active = function(session, msg, app, callback){

    var activeServers = app.getServersByType('active');
    if(!activeServers || activeServers.length === 0)
    {
        callback(new Error('can not find active servers!'));

        return;
    }

    //根据指定的userName获取
    if(!!session.specificUserName)
    {
        var userName = session.specificUserName;

        var res = dispatcher.dispatch(userName.toString(), activeServers);

        callback(null, res.id);

        return;
    }


    //获取指定server id
    if(!!session.specificId)
    {
        var result = null;
        for(var index=0; index<activeServers.length; index++)
        {
            if(activeServers[index].id === session.specificId)
            {
                result = activeServers[index];
                break;
            }
        }

        if(!!result)
        {
            callback(null, result.id);
        }
        else
        {
            callback(new Error('can not find active servers!'));
        }

        return;
    }

    //随机获取任意服务器
    if(session === 'random')
    {
        var index = randomUtil.getNativeRandom(0, activeServers.length-1);
        var res = activeServers[index];
        callback(null, res.id);
        return;
    }

    callback(new Error('can not find active servers!'));
};
