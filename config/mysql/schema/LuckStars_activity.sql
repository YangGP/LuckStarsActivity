# 安装MySql数据库(略)
# 登录MySql: mysql –u用户名 –p密码 (登录成功提示符：mysql>)
# 创建数据库: mysql> create database luckstars_2;
# 选择数据库: mysql> use LuckStars;
# 导入sql文件: mysql> source ./game-server/config/schema/luckstars.sql

# Dump of table user
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `active` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `userName` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `buyTime` varchar(30) COLLATE utf8_unicode_ci,
  `awardStateList` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `totalPay` bigint unsigned DEFAULT '0',
  `receiveLeave`  varchar(50) COLLATE utf8_unicode_ci NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY (`userName`),
  INDEX IDX_USERNAME_BUYTIME (`userName`,`buyTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;