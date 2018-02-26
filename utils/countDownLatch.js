/**
 *----------------------------------------------
 * Author: lenon
 * Create Time: 2016/3/2 11:19
 * Desc: 计数，计数为零的时候，自动调用反馈函数
 * Changed list:
 *        Change author:(若修改请指明修改者)
 *        Change desc:(修改描叙)
 *        Change time:(修改的时间)
 *----------------------------------------------
 **/
var exp = module.exports;

/**
 * Count down to zero and invoke cb finally.
 */
var CountDownLatch = function(count, cb) {
    this.count = count;
    this.cb = cb;
};

/**
 * Call when a task finish to count down.
 *
 * @api public
 */
CountDownLatch.prototype.done = function() {
    if(this.count <= 0) {
        throw new Error('illegal state.');
    }

    this.count--;
    if (this.count === 0) {
        this.cb();
    }
};

/**
 * create a count down latch
 *
 * @api public
 */
exp.createCountDownLatch = function(count, cb) {
    if(!count || count <= 0) {
        throw new Error('count should be positive.');
    }
    if(typeof cb !== 'function') {
        throw new Error('cb should be a function.');
    }

    return new CountDownLatch(count, cb);
};