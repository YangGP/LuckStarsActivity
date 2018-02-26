/**
 *----------------------------------------------
 * Author: xujie
 * Create Time: 2016/05/16 17:50
 * Desc: (这里写描叙)
 * 工具类：获取随机数
 * Changed list:
 *        Change author:(若修改请指明修改者)
 *        Change desc:(修改描叙)
 *        Change time:(修改的时间)
 *----------------------------------------------
 **/
var randomUtil = module.exports;

/**
 * 获取原生的[min-max]之间的随机值,用这个比较好,双闭区间
 * @param min
 * @param max
 * @returns {number}
 */
randomUtil.getNativeRandom = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};
