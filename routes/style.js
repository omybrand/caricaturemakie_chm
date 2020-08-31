var express = require('express');
var styleController = require('../controllers/style');
var style = express.Router();

style.post('/get', styleController.getStylelist); // 작가 스타일 추가하기
style.post('/info', styleController.getStyleinfo); // 작가 스타일 추가하기

module.exports = style;