var express = require('express');
var artistController = require('../controllers/artist');
var artist = express.Router();

// 작가 관련
artist.post('/list', artistController.showArtistlist); //작가 전체 정보
artist.post('/info', artistController.showArtistinfo); //특정 작가 정보
// artist.post('/port', artistController.showPortlist); //작가 전체 정보

// 작가 홈페이지 관련
artist.get('/', artistController.artistMainForm); // 작가 메인 폼
artist.get('/login', artistController.artistLogin); // 작가 로그인 폼
artist.post('/login', artistController.login); // 작가 로그인하기
artist.get('/logout', artistController.artistLogout); // 작가 로그아웃하기
artist.get('/info', artistController.infoArtist); // 작가 정보 확인 폼
artist.post('/info/update', artistController.updateInfo); // 작가 정보 변경
artist.get('/notice', artistController.noticeArtist); // 작가 공지사항 폼
artist.get('/style/list', artistController.styleListForm); // 작가 스타일 리스트 폼
artist.get('/style/info', artistController.styleInfoForm); // 작가 스타일 정보 폼
artist.post('/style/info/update', artistController.styleInfoUpdate); // 작가 스타일 정보 폼
artist.get('/reserve/request', artistController.reserveReqListForm); // 작가 예약요청 리스트 폼
artist.get('/reserve/info', artistController.reserveInfoForm); // 작가 예약 정보 폼
artist.get('/reserve/accept', artistController.reserveAgreeListForm); // 작가 예약요청 리스트 폼
artist.get('/work/wait', artistController.worksWaitListForm); // 작가 작업 대기 리스트 폼
artist.get('/work/wait/info', artistController.worksWaitInfoForm); // 작가 작업 정보 폼
artist.get('/work/now', artistController.worksNowInfoForm); // 작가 작업 중 정보 폼
artist.post('/work/getphoto', artistController.getPhoto); // 작가 사진 다운로드
artist.post('/work/start', artistController.workStart); // 작가 작업 상태 변경
artist.post('/work/complete', artistController.workComplete); // 작가 작업 상태 변경
artist.get('/work/now', artistController.worksNowInfoForm); // 작가 작업 중 정보 폼
artist.get('/cal', artistController.calForm); // 작가 정산 폼
artist.get('/getdate', artistController.getyymm); // 서버 시간 받아오기
artist.post('/history', artistController.showArtistOrderList); // 작가 완료 내역 받아오기

module.exports = artist;
