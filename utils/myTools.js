/**
 *----------------------------------------------
 * Author: xujie
 * Create Time: 2016/05/27 14:43
 * Desc: (这里写描叙)
 * 各种工具集合
 * Changed list:
 *        Change author:(若修改请指明修改者)
 *        Change desc:(修改描叙)
 *        Change time:(修改的时间)
 *----------------------------------------------
 **/
var excelPort = require('excel-export');
var fs = require('fs');
var crypto = require('crypto');
var randomUtil = require('./randomUtil');

var myTools = module.exports;

/**
 * 获取格式化日期 2016:08:24 12:00:00
 * @param days 当前日期的相对日期:0为当前日期，负数为向前，正数为向后
 * @returns {string}
 */
myTools.getNowFormatDate = function(days){
    var date = new Date();

    if(days !== 0 )
    {
        date.setDate(date.getDate() + days);
    }

    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();

    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }

    if (day >= 0 && day <= 9) {
        day = "0" + day;
    }

    if (hour >= 0 && hour <= 9) {
        hour = "0" + hour;
    }

    if (minute >= 0 && minute <= 9) {
        minute = "0" + minute;
    }

    if (second >= 0 && second <= 9) {
        second = "0" + second;
    }

    var result = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;

    return result;
};

/**
 * 获取日期 2016-08-24  年月日
 * @param days 当前日期的相对日期:0为当前日期，负数为向前，正数为向后
 * @returns {string}
 */
myTools.getTime_YYMMDD = function(days){
    var date = new Date();

    if(days !== 0 )
    {
        date.setDate(date.getDate() + days);
    }

    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }

    if (day >= 0 && day <= 9) {
        day = "0" + day;
    }

    var result = year + "-" + month + "-" + day;

    return result;
};

/**
 * 获取当前的月份2016-12 年月
 * @returns {string}
 */
myTools.getTime_YYMM = function(){
    var date = new Date();

    var year = date.getFullYear();
    var month = date.getMonth() + 1;

    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }

    return year + "-" + month;
};

/**
 * 获取当前是星期几
 * @param days 当前日期的相对日期:0为当前日期，负数为向前，正数为向后
 * @returns {string}
 */
myTools.getWeek = function(days){
    var date = new Date();

    if(days !== 0 )
    {
        date.setDate(date.getDate() + days);
    }

    var result = '星期';
    if(date.getDay() == 0)
    {
        result += '日';
    }
    else if(date.getDay() == 1)
    {
        result += '一';
    }
    else if(date.getDay() == 2)
    {
        result += '二';
    }
    else if(date.getDay() == 3)
    {
        result += '三';
    }
    else if(date.getDay() == 4)
    {
        result += '四';
    }
    else if(date.getDay() == 5)
    {
        result += '五';
    }
    else if(date.getDay() == 6)
    {
        result += '六';
    }

    return result;
};

/**
 * 获取当前的小时，返回0-23之间的整数
 * @returns {number}
 */
myTools.getHours = function(){
    var date = new Date();

    return date.getHours();
};

/**
 * 获取当前的分钟，返回0-59之间的证书
 * @returns {number}
 */
myTools.getMinutes = function(){
    var date = new Date();

    return date.getMinutes();
};

/**
 * 获取当前的 时分秒
 * @returns {string}   时分秒 01:01:01
 */
myTools.getTime_HMS = function(){
    var date = new Date();

    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();

    if (hour >= 0 && hour <= 9) {
        hour = "0" + hour;
    }

    if (minute >= 0 && minute <= 9) {
        minute = "0" + minute;
    }

    if (second >= 0 && second <= 9) {
        second = "0" + second;
    }

    return (hour + ":" + minute + ":" + second);
};



/**
 * 获取系统当前时刻 毫秒
 * @returns {number}
 */
myTools.getCurrentMoment = function(){
    var date = new Date();

    return date.getTime();
};

/**
 * 通过标准格式的时间 2016-07-22 12:12:12
 * 获取格林威治时间
 * @param date
 */
myTools.getMomentByFormatDate = function(date){

    var timeStr = date.replace(new RegExp('-', 'gm'), '/');

    return (new Date(timeStr)).getTime();
};

/**
 * 获取两个日期之间的天数间隔
 * @param start  年月日  start < end
 * @param end    年月日
 * @returns {number}
 */
myTools.getDateDiff = function(start, end){
    var startDate  = this.getMomentByFormatDate(start + ' 00:00:00');
    var endDate  = this.getMomentByFormatDate(end + ' 00:00:00');
    return (endDate - startDate) / (1000*60*60*24);
};


/**
 * 从start  开始 累加days天，并获取该日期的格式化数据YY-MM-DD HH:MM:SS
 * @param start  格式化日期  2017-01-01 12:301:20
 * @param days   相隔的天数  + -
 */
myTools.getFormatDateDis = function(start, days){
    //获取开始时间的格林威治时间ms
    var tempTime = this.getMomentByFormatDate(start);
    //将该时刻推迟days对应的ms
    tempTime += days*(1000*60*60*24);

    //设置新的时刻
    var date = new Date();
    date.setTime(tempTime);

    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();

    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }

    if (day >= 0 && day <= 9) {
        day = "0" + day;
    }

    if (hour >= 0 && hour <= 9) {
        hour = "0" + hour;
    }

    if (minute >= 0 && minute <= 9) {
        minute = "0" + minute;
    }

    if (second >= 0 && second <= 9) {
        second = "0" + second;
    }

    var result = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;

    return result;
};


/**
 * 进行MD5算法加密
 * @param str 输入为string或者Buffer
 */
myTools.md5 = function(str){
    if(str !== 'string' && !(str instanceof Buffer))
    {
        throw  new Error('md5 must be a string and Buffer object!')
    }

    return crypto.createHash('md5').update(str).digest('hex');
};


/**
 * 获取指定长度的随机字符串
 * @param length        字符串的长度
 * @returns {string}
 */
myTools.getRandomStr = function(length) {
    var result = "";
    var key_pool = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    var max = key_pool.length-2;
    var min = 2;

    for(var i=0; i<length; i++)
    {
        var nIndex = randomUtil.getNativeRandom(min, max);

        result += key_pool.charAt(nIndex);
    }

    return result.toString();
};

/**
 * 获取指定长度的随机数字序列
 * @param length    随机数字序列的长度
 * @returns {string}
 */
myTools.getRandomNumber = function(length){
    var result = "";
    var key_pool = "1234567890";

    var max = key_pool.length-1;
    var min = 0;

    for(var i=0; i<length; i++)
    {
        var nIndex = randomUtil.getNativeRandom(min, max);

        result += key_pool.charAt(nIndex);
    }

    return result.toString();
};


/**
 * AES加密算法"aes-128-ecb"
 * @param key         密钥 16位长度
 * @param str         输入明文 {string} 不限制长度
 * @returns {string}  输出密文 or error
 * @constructor
 */
myTools.encryptAES = function(str, key){
    try
    {
        var encrypted = "";
        var cip = crypto.createCipheriv("aes-128-ecb", key, "");

        encrypted += cip.update(str, 'utf8', 'base64');
        encrypted += cip.final('base64');

        return encrypted;
    }
    catch (err)
    {
        return "error";
    }
};

/**
 * AES解密算法"aes-128-ecb"
 * @param key         秘钥 16位长度
 * @param str         输入密文{string}
 * @returns {string}  输出明文 or error
 * @constructor
 */
myTools.decryptAES = function(str, key){
    try
    {
        var decrypted = "";
        var decipher = crypto.createDecipheriv("aes-128-ecb", key, "");

        decrypted += decipher.update(str, 'base64', 'utf8');

        decrypted += decipher.final('utf8');

        return decrypted;
    }
    catch (err)
    {
        return "error";
    }
};

/**
 * 对list中的对象进行升序排列
 * @param list        需要进行排序的数组
 * @param sortPara    排序参数,字符串型
 * @param type up or down   升序 or 降序
 */
myTools.mySort = function(list, sortPara, type) {
    if(type == 'up')
    {
        list.sort(this._compareUp(sortPara));
    }
    else if(type == 'down')
    {
        list.sort(this._compareDown(sortPara));
    }
};

myTools._compareUp = function(propertyName) {
    return function (object1, object2) {
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        if (value2 > value1) {
            return -1;
        } else if (value2 < value1) {
            return 1;
        } else {
            return 0;
        }
    }
};

myTools._compareDown = function(propertyName) {
    return function (object1, object2) {
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        if (value2 > value1) {
            return 1;
        } else if (value2 < value1) {
            return -1;
        } else {
            return 0;
        }
    }
};

/**
 * 将输入信息导出成excel表
 * @param excelDes
 *        输入信息 {cols : [], rows: []}
 *        cols 表示每一列的描述  {caption:'姓名', type:'string', width:30}
 *        rows 表示每一行的信息  rows[0] = ['徐洁', 12, '万达广场2#804', '2016-11-24 12:13:14']
 * @param fileName 输出文件名
 */
myTools.excelPortFile = function(excelDes, fileName){
    var result = excelPort.execute(excelDes);
    var uploadDir = 'logs/';
    var filePath = uploadDir + fileName + ".xlsx";
    fs.writeFile(filePath, result, 'binary',function(err){
        if(!!err)
        {
            console.log(err);
        }
    })
};

/**
 * 获取数组中元素最大值
 * @param list
 */
myTools.getListMax = function(list){
    var max = list[0];
    for(var i=0; i<list.length; i++)
    {
        if(max<list[i])
        {
            max = list[i]
        }
    }
    return max;
};

/**
 * 满足RFC 1738 的url编码
 * 除了-_.数字字母之外，所有字符都替换成百分号(%)后跟两位十六进制数,十六进制中字母大写
 * @param clearString
 * @returns {string}
 * @constructor
 */
myTools.URLEncode = function(clearString){
    var output = '';
    var x = 0;
    clearString = clearString.toString();
    var regex = /(^[a-zA-Z0-9-_.]*)/;
    while (x < clearString.length)
    {
        var match = regex.exec(clearString.substr(x));
        if (match != null && match.length > 1 && match[1] != '')
        {
            output += match[1];
            x += match[1].length;
        }
        else
        {
            if (clearString.substr(x, 1) == ' ')
            {
                //原文在此用 clearString[x] == ' ' 做判断, 但ie不支持把字符串当作数组来访问,
                //修改后两种浏览器都可兼容
                //output += '+';
                output += '%20';
            }
            else
            {
                var charCode = clearString.charCodeAt(x);
                var hexVal = charCode.toString(16);
                output += '%' + ( hexVal.length < 2 ? '0' : '' ) + hexVal.toUpperCase();
            }
            x++;
        }
    }

    return output;
};