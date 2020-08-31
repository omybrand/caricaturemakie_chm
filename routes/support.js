var express = require('express');
var supportController = require('../controllers/support');
var support = express.Router();

support.post('/list', supportController.showMylist); // 앱 문의내역 가져오기
support.post('/add', supportController.sendContact); // 앱 문의하기
support.post('/faq', supportController.faqList); // 앱 자주하는 질문

module.exports = support;