var express = require('express');
var appinfoController = require('../controllers/app_info');
var appinfo = express.Router();

appinfo.post('/get', appinfoController.getAppInfo); // 앱 공지사항 가져오기

module.exports = appinfo;