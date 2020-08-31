var express = require('express');
var multiparty = require('connect-multiparty');
var multipartMiddleware = multiparty();
var reserveController = require('../controllers/reserve');
var reserve = express.Router();

// 캐리커쳐 마키 예약 (앱 전용)
reserve.post('/list', reserveController.showMyList); // 사용자 예약 내역 리스트 보기
reserve.post('/info', reserveController.showResevationInfo); // 사용자 예약 내역 리스트 보기
reserve.post('/add', reserveController.makeReservation); // 사용자 예약하기(정보만 추가)
reserve.post('/upload', multipartMiddleware, reserveController.uploadPhoto); // 사용자 예약하기(사진 업로드)
reserve.post('/cancel', reserveController.cancelReservation); // 사용자 예약 취소하기
reserve.post('/finish', reserveController.finishReservation); // 사용자 예약 취소하기(결제가 되서 없앰)
reserve.post('/ok', reserveController.okReservation); // 사용자 예약 확인하기(작가 예약 수락)
reserve.post('/change', reserveController.changeReservation); // 사용자 예약 확인하기(작가 예약 변경 요청)
reserve.post('/reject', reserveController.rejectReservation); // 사용자 예약 확인하기(작가 예약 거절)

module.exports = reserve;