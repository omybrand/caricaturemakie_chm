var express = require('express');
var orderlistController = require('../controllers/orderlist');
var orderlist = express.Router();


orderlist.post('/list', orderlistController.listOrder); // 주문내역 보기
orderlist.post('/info', orderlistController.infoOrder); // 주문내역 보기
orderlist.post('/add', orderlistController.addOrder); // 주문하기
orderlist.post('/valid', orderlistController.validOrder); // 주문 서버 처리
orderlist.post('/confirm', orderlistController.confirmValid); // 결제 확인
orderlist.post('/cancel', orderlistController.cancelOrder); // 주문 취소
orderlist.post('/ok', orderlistController.okOrder); // 주문 성공 페이지
orderlist.post('/score', orderlistController.scoreOrder); // 주문 평가 여부 확인
orderlist.post('/rate', orderlistController.rateOrder); // 주문 평가하기
orderlist.post('/reply', orderlistController.showReply); // 주문 후기 보기

module.exports = orderlist;