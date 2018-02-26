var pomelo = require('pomelo');
var httpPlugin = require('pomelo-http-plugin');
var routeUtil = require('./utils/routeUtil');

//创建应用上下文
var app = pomelo.createApp();

//设置通用功能
app.configure('production|development', function(){
    // 配置基础服务，每个服务器的services;
    app.use(require("pomelo-base-plugin"), {
        memoryservices : {
            open : false //true   开启内存监控
        }
    });
});

//配置服务器路由
app.configure('production|development', function() {
    app.route('active', routeUtil.active);
});

//推广员后台 server配置
app.configure('production|development', 'webHttp', function() {

    app.loadConfig('httpConfig', app.getBase() + '/../LuckStarsActivity/config/webHttp.json');

    app.use(httpPlugin, {
        http: app.get('httpConfig')[app.getServerId()]
    });
});

//配置后台管理系统模块的数据库
app.configure('production|development', 'active|webHttp', function(){

    //数据库加载
    app.loadConfig('mysql', app.getBase() + '/../LuckStarsActivity/config/mysql/mysql.json');

    //创建数据库
    var dbClient = require('./app/dao/mysql/mysql').init(app);
    app.set('dbClient', dbClient);
});

// start app
app.start();

process.on('uncaughtException', function(err) {
    console.error(' Caught exception: ' + err.stack);
});