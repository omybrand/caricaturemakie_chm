var express = require('express');
var bannerController = require('../controllers/banner');
var banner = express.Router();

banner.post('/get', bannerController.getBanner); // 앱 배너 리스트 가져오기

module.exports = banner;