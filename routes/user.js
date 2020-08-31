var express = require('express');
var userController = require('../controllers/user');
var user = express.Router();

user.get('/login', userController.userLoginform); // 유저 로그인 폼
user.post('/login', userController.weblogin); // 유저 로그인
user.get('/', userController.usermain); // 유저 메인
user.get('/logout', userController.userLogout); // 유저 웹 로그아웃
user.get('/validuser', userController.validUser); // 유저 인증
user.post('/checkid', userController.checkid); // 아이디 중복 체크
user.post('/appjoin', userController.appjoin); // 앱 회원 가입
user.post('/applogin', userController.applogin); // 앱 로그인
user.post('/changepush', userController.changePush); // 푸쉬 알림 변경
user.post('/forgotpwd', userController.forgotPwd); // 패스워드 변경 메일 보내기
user.get('/changepwd', userController.changePwdform); // 패스워드 변경하는 폼으로 가기
user.post('/changepwd', userController.changePwd); // 패스워드 변경하기
user.post('/secess', userController.secess); // 유저 탈퇴
user.post('/getpush', userController.getPush); // 푸쉬 여부 받기
user.post('/getmileage', userController.getMileage); // 푸쉬 여부 받기

module.exports = user;
