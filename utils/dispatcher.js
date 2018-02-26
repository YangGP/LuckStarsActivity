/**
 *----------------------------------------------
 * Author: xujie
 * Create Time: 2016/06/16 17:02
 * Desc: (这里写描叙)
 * 路由的选择
 * Changed list:
 *        Change author:(若修改请指明修改者)
 *        Change desc:(修改描叙)
 *        Change time:(修改的时间)
 *----------------------------------------------
 **/

var crc = require('crc');

/**
 * 根据uid，从服务器列表中选择一个服务器
 * @param uid          可以是任意的String; 不能是int型，同一个int，随机的结果不一样
 * @param serverList
 * @returns {*}
 */
module.exports.dispatch = function(uid, serverList) {

    if(!(typeof(uid) === 'string'))
    {
        return serverList[0];
    }

    if(!uid)
    {
        return serverList[0];
    }

	var index = Math.abs(crc.crc32(uid)) % serverList.length;

	return serverList[index];
};