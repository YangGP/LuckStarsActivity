window.onload = function () {

  //获取初始信息
  var params = GetRequest();

  if (!params.userName) {
    jqalert({
      title: '提示',
      content: '请在游戏内打开页面',
      click_bg: false,
      yeslink: 'http://promoter.shxyzx.cn/luckStarDown'
    })
    return false;
  }

  //初始化用户信息
  userInfoInit(params.userName);


};

//获取url参数
function GetRequest() {
  var url = location.search; //获取url中"?"符后的字串
  var theRequest = {};
  if (url.indexOf("?") != -1) {
    var str = url.substr(1);
    strs = str.split("&");
    for (var i = 0; i < strs.length; i++) {
      theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
    }
  }
  return theRequest;
}

//用户信息初始化
function userInfoInit(userName) {
  jq.post('/userLogin', {
    method: "login",
    userName: userName
  }, function (pageSetParams) {
    // console.log(pageSetParams);
    pageInit(pageSetParams);
  });

}

//页面初始化
function pageInit(params) {

  var $btn1 = jq("#return");
  var $btn2 = jq("#total");
  var $recharge = jq("#recharge");
  var $schedule = jq("#schedule");
  var $arrow = jq("#up-arrow");

  var size = jq('html').css('font-size');
  var a = $recharge.height() - parseInt(size) * 4.1;
  var b = $schedule.height() - parseInt(size) * 3.9;
  $recharge.css('height', a);
  $schedule.css('height', b);

  var container = document.getElementById("container");
  var $headEnd = jq("#head-end");
  var $activeEnd = jq("#active-end");
  var $totalPay = jq("#totalPay");

  var userName = params.userName;

  var awardStateList = JSON.parse(params.awardStateList);
  var totalPay = params.totalPay / 100;
  var receiveLevel = JSON.parse(params.receiveLeave);
  var webBuy = params.webBuy;
  var awardLevel = params.awardLeave;
  var activeFlag = params.activeFlag;

  //当前活动状态
  if (activeFlag === 'after') {
    $recharge.addClass('hidden');
    $schedule.removeClass('hidden');
    $activeEnd.addClass('hidden');
    $headEnd.removeClass('hidden');
    $btn2.removeClass('checked-btn');
    $btn1.addClass('checked-btn');
    $arrow.hide();
  } else if (activeFlag === 'before') {
    jqalert({
      title: '提示',
      content: '活动还未开始!\n（活动将于2018年2月14日0时开始，\n感谢您的关注）',
      click_bg: true
    })
  }

  //判断是否存在可领取奖励
  awardAvaible(totalPay, webBuy, awardLevel, receiveLevel);

  //通过用户数据渲染页面信息

  renderRecharge(webBuy, awardStateList);
  renderSchedule(awardLevel, totalPay, receiveLevel);

  var rscroll = mui('#recharge').scroll({
    deceleration: 0.0005,
    indicators: false,
    bounce: true
  });

  var sscroll = mui('#schedule').scroll({
    deceleration: 0.0005,
    indicators: false,
    bounce: true
  });

  $schedule.removeClass('visibility');

  if (activeFlag !== 'after') {
    $schedule.addClass('hidden');
  }

  if (activeFlag === 'after') {
    sscroll.scrollToBottom();
  }

  //页面内容切换
  $btn1.click(function () {
    $recharge.removeClass('hidden');
    $schedule.addClass('hidden');
    if (activeFlag === 'after') {
      $headEnd.addClass('hidden');
      $activeEnd.removeClass('hidden');
    }
    jq(this).removeClass('checked-btn');
    $btn2.addClass('checked-btn');
  });

  $btn2.click(function () {
    $recharge.addClass('hidden');
    $schedule.removeClass('hidden');
    if (activeFlag === 'after') {
      $headEnd.removeClass('hidden');
      $activeEnd.addClass('hidden');
    }
    $arrow.hide();
    jq(this).removeClass('checked-btn');
    $btn1.addClass('checked-btn');
    sscroll.scrollToBottom();
  });

  //点击充钱
  $recharge.on('click', 'div', function (e) {
    var id = e.currentTarget.dataset.id;
    var get = e.currentTarget.dataset.get;

    if (get !== 'hidden') {
      return false;
    }

    if (activeFlag === 'before') {
      jqalert({
        title: '提示',
        content: '活动还未开始!\n（活动将于2018年2月14日0时开始，\n感谢您的关注）',
        click_bg: true
      })
      return false;
    }

    jq.post('/userPayInWeb', {
      method: "userPayInWeb",
      userName: userName,
      activeType: id
    }, function (data) {

      var reg = /^https:/;
      if (reg.test(data)) {
        location.href = data;
      } else if (data === '不在活动时间内') {
        jqtoast('不在活动时间内！');
      } else if (data === '已充值') {
        jqtoast('您今日已充值过该档位，正在为您刷新页面！');
        setTimeout(function () {
          location.reload();
        }, 1000);
      } else {
        jqtoast('服务器忙，请稍后再试！');
      }

    });

    return false;
  });

  //点击领奖
  $schedule.on('click', 'img', function (e) {
    var val = e.currentTarget.dataset.val;
    var id = e.currentTarget.dataset.id;
    if (!val) {
      return false;
    }

    jq.post('/getBigPrize', {
      method: 'userGetBigPrize',
      userName: userName,
      level: val
    }, function (data) {

      if (data === '领取成功') {
        jqalert({
          title: '提示',
          content: '活动奖励已放入您的游戏账户，请您\n注意查收！',
          click_bg: true
        })
        jq(e.currentTarget).addClass('hidden').next().removeClass('hidden');
        receiveLevel[id] = 1;
        awardAvaible(totalPay, webBuy, awardLevel, receiveLevel);
      } else {
        jqtoast(data);
      }
    });
  })

  //禁用滑动事件
  container.addEventListener('touchmove', function (e) {
    $arrow.hide();
    if (e.target.className === 'container') {
      e.preventDefault();
    }
  });

  jq('body').on('touchmove', function (e) {
    e.preventDefault();
  })

  $activeEnd[0].addEventListener('touchmove', function (e) {
    e.preventDefault();
  });

}

//生成充值返利页面
function renderRecharge(webBuy, awardStateList) {

  var rechargeInner = '';
  var hidden = '';

  var len = getObjPropertyNum(webBuy);

  for (var i = 1; i <= len; i++) {

    var gold = webBuy[i].awardGold + webBuy[i].buyGold;
    if (gold > 10000) {
      gold = Math.floor(gold / 10000 * 100) / 100 + '万';
    }

    if (awardStateList[i - 1] === 0) {
      hidden = 'hidden';
    } else {
      hidden = '';
    }

    rechargeInner += '<div data-id="' + i + '" data-get="' + hidden + '" class="recharge-card">' +
      '<small>￥</small>' +
      '<strong>' + webBuy[i].price + '</strong>' +
      '<p>立得' + gold + '金币</p>' +
      '<img class="recharge-complete ' + hidden + '" src="/imgs/next.png" alt="达成">' +
      '</div>';
  }

  rechargeInner += '<div class="tips-box"><div class="tips">' +
    '<p>活动持续时间：2月14日0时~2月24日24时</p>' +
    '<p>活动期间每日都可以享受一次各个档次返利</p>' +
    '<p>活动期间所有充值金额都计入累计充值</p>' +
    '<p>活动详细规则请查看幸运之星活动公告</p>' +
    '<p>本活动最终解释权归幸运之星所有</p>' +
    '</div></div>';
  jq("#recharge-mask").html(rechargeInner);

  rechargeInner = undefined;
}

//生成累计大奖页面
function renderSchedule(awardLevel, totalPay, receiveLevel) {
  var level = awardLevel.leaves;
  var scheduleInner = '<div class="tips">' +
    '<p>活动持续时间：2月14日0时~2月24日24时</p>' +
    '<p>充值任意金额即可获得百元现金红包抽奖</p>' +
    '<p>机会一次，累计充值满1000元即可获得</p>' +
    '<p>超级大奖“礼品商城任你挑”抽奖机会一次</p>' +
    '<p>本活动最终解释权归幸运之星所有</p>' +
    '</div>';
  var hidden = '';
  level.map(function (val, ind) {
    ind += 1;
    var temp = '<div class="schedule-box">';

    if (totalPay >= val && !receiveLevel[ind - 1]) {
      temp += '<img data-val="' + val + '" data-id="' + (ind - 1) + '" class="get-awrad" src="/imgs/get.png" alt="领取">'
    }

    if (receiveLevel[ind - 1]) {
      temp += '<img class="complete-award" src="/imgs/complete.png" alt="已领取">';
    } else {
      temp += '<img class="complete-award hidden" src="/imgs/complete.png" alt="已领取">';
    }

    scheduleInner = temp + '</div>' + scheduleInner;
  });

  scheduleInner = '<img src="/imgs/schedule.png" alt="阶梯"><div style="height:1.4rem"></div>' + scheduleInner;
  jq("#schedule-mask").html(scheduleInner);

  scheduleInner = undefined;
}

//判断是否存在可领取奖励
function awardAvaible(totalPay, webBuy, awardLevel, receiveLevel) {
  jq("#totalPay").html('￥' + totalPay);
  var chargeLevel = -1;
  for (var level = 0; level < getObjPropertyNum(webBuy); level++) {
    if (totalPay >= awardLevel.leaves[level]) {
      chargeLevel++;
    }
  }

  if (chargeLevel >= 0) {
    for (var i = 0; i <= chargeLevel; i++) {
      if (receiveLevel[i] === 0) {
        jq("#award-available").removeClass('hidden');
        return;
      }
    }
  }

  jq("#award-available").addClass('hidden');
}

//获取对象的属性个数
function getObjPropertyNum(obj) {
  var count = 0
  for (pro in obj) {
    if (obj.hasOwnProperty(pro)) {
      count++;
    }
  }
  return count;
}