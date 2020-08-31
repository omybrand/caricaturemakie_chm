var express = require('express');
var order_appController = require('../controllers/order_app');
var order_app = express.Router();

// 캐리커쳐 마키 주문내역 (앱 전용)
order_app.get('/showalllist', order_appController.showAlllist);
order_app.post('/showalllist', order_appController.showAlllist); //주문 전체 내역 확인
order_app.post('/showmylist', order_appController.showMylist); //주문 전체 내역 확인
//order_app.post('/orderlist/showorderinfo', order_appController.showOrderinfo); //주문 전체 내역 확인
//order_app.post('/orderlist/showartistlist', order_appController.showArtistlist); //주문 전체 내역 확인
// order_app.post('/showgoodslist', order_appController.showGoodslist);
order_app.post('/changestate', order_appController.changeState); // 주문 상태 업데이트
order_app.post('/updatereqorder', order_appController.updatereqOrder); // 주문 요구사항 수정하기(휴대폰만)
order_app.post('/addorder', order_appController.addOrder); //주문 추가하기
order_app.post('/cancelorder', order_appController.cancelOrder); //주문 삭제하기
order_app.post('/paymentapp', order_appController.paymentappForm);
order_app.get('/finishapp', order_appController.finishappINIForm);
order_app.post('/finishapp', order_appController.finishappForm);
order_app.get('/result', order_appController.getresultForm);
order_app.post('/validorder', order_appController.validOrder); // 주문 결제 완료하기(휴대폰 제외)
order_app.post('/validordermobile', order_appController.validOrdermobile); // 주문 결제 완료하기(휴대폰만)

module.exports = order_app;