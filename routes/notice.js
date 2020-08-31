var express = require('express');
var noticeController = require('../controllers/notice');
var notice = express.Router();

notice.post('/get', noticeController.getNoticelist); // 앱 공지사항 가져오기

module.exports = notice;