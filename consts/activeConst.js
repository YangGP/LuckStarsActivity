/**
 *----------------------------------------------
 * Author: xujie
 * Create Time: 2017/02/06 14:16
 * Desc: web活动的配置文件
 * Changed list:
 *        Change author:tianzheng
 *        Change desc:ensure the final version
 *        Change time:20180207
 *----------------------------------------------
 **/

module.exports = {
    //web页面购买配置
    webBuy: {
        1: {
            buyGold: 300,     //礼包中购买的金币数量：  每个档位的实际购买成分数值唯一
            awardGold: 68,   //礼包中赠送的金币数量：
            price: 3          //礼包的价格：单位元
        },

        2: {
            buyGold: 800,
            awardGold: 88,
            price: 8
        },

        3: {
            buyGold: 1800,
            awardGold: 128,
            price: 18
        },

        4: {
            buyGold: 5800,
            awardGold: 468,
            price: 58
        },

        5: {
            buyGold: 9800,
            awardGold: 1000,
            price: 98
        },

        6: {
            buyGold: 18800,
            awardGold: 2000,
            price: 188
        },
    
        7: {
            buyGold: 32800,
            awardGold: 4000,
            price: 328
        },
    
        8: {
            buyGold: 64800,
            awardGold: 8000,
            price: 648
        }
    },


    //累计奖励
    awardLeave: {
        leaves: [50, 100, 200, 500, 1000, 2000, 5000],     //累计奖励的各个档位条件(元)

        50: {                                              //各个档位的奖励
            gold: 288,                                    //奖励金币
            diamond: 0,                                   //奖励钻石
            prizeId: 'none'                               //奖励物品id    prize表中的幸运公仔娃娃记录id， none表示没有
        },

        100: {
            gold: 688,
            diamond: 0,
            prizeId: 'none'
        },

        200: {
            gold: 1288,
            diamond: 0,
            prizeId: 'none'
        },

        500: {
            gold: 2688,
            diamond: 0,
            prizeId: 'none'
        },

        1000: {
            gold: 4288,
            diamond: 128,
            prizeId: 10
        },

        2000: {
            gold: 8688,
            diamond: 188,
            prizeId: 404
        },

        5000: {
            gold: 16888,
            diamond: 288,
            prizeId: 410
        }
    }
};