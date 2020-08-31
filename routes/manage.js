var express = require('express');
var multiparty = require('connect-multiparty');
var multipartMiddleware = multiparty();
var manageController = require('../controllers/manage');
var manage = express.Router();

// 관리자 관련

// 메인 페이지
manage.get('/', manageController.MainForm); // 메인 페이지

// 로그인 관련
manage.get('/login', manageController.LoginForm); // 로그인 창
manage.get('/logout', manageController.Logout); // 관리자 로그아웃하기
manage.post('/login', manageController.Login); // 관리자 로그인 하기
manage.post('/logout', manageController.Logout); // 관리자 로그아웃하기

// 주문 내역 관련
manage.get('/orderlist/list', manageController.OrderlistForm); // 주문 내역 보기 폼
manage.get('/orderlist/info', manageController.OrderInfoForm); // 주문 정보 보기 폼
manage.get('/orderlist/getdate', manageController.getyymm); // 서버 시간 받아오기
manage.get('/orderlist/check', manageController.OrderCheckForm); // 검수 내역 보기 폼
manage.post('/orderlist/check', manageController.checkOrder); // 검수 내역 보기 폼
// manage.get('/orderlist/goods', manageController.GoodsOrderlistForm); // 상품 주문 및 배송관리 폼
manage.post('/orderlist/getalllist', manageController.getAlllist); // 전체 주문 보기
manage.get('/orderlist/add', manageController.addOrderForm); // 가짜 주문 입력 폼
manage.post('/orderlist/add', manageController.addOrder); // 가짜 주문 입력
// manage.post('/orderlist/cancel', manageController.cancelOrder); // 작업 완료된 주문 보기

// manage.post('/orderlist/showall', manageController.showAllOrderlist); // 전체 주문정보
// manage.post('/orderlist/showunpayed', manageController.showUnpayedOrderlist); // 미결제 주문 보기
// manage.post('/orderlist/showpayed', manageController.showPayedOrderlist); // 결제 완료 주문 보기
// manag/e.post('/orderlist/showfinished', manageController.showFinishedOrderlist); // 작업 완료 주문 보기
// manage.post('/orderlist/cancel', manageController.cancelOrder); // 해당 주문 취소하기

// 작가 정보 관련
manage.get('/artist/list', manageController.listArtistForm); // 작가 리스트 보기 폼
manage.get('/artist/info', manageController.infoArtistForm); // 작가 전체 정보 보기 폼
manage.get('/artist/profile/update', manageController.updateArtistProfileForm); //작가 프로필 업데이트하기 폼
manage.get('/artist/info/update', manageController.updateArtistInfoForm); //작가 정보 업데이트하기 폼
manage.get('/artist/history/update', manageController.updateArtistHistoryForm); //작가 약력 업데이트하기 폼
manage.get('/artist/add', manageController.addArtistForm); // 작가 추가하기 폼
manage.post('/artist/add', multipartMiddleware, manageController.addArtist); // 작가 추가하기
manage.post('/artist/profile/update', multipartMiddleware, manageController.updateArtistProfile); //작가 프로필 업데이트하기
manage.post('/artist/info/update', manageController.updateArtistInfo); //작가 정보 업데이트하기
manage.post('/artist/history/get', manageController.getArtistHistory); //작가 약력 가져오기
manage.post('/artist/history/update', manageController.updateArtistHistory); //작가 약력 업테이트하기
manage.post('/artist/delete', manageController.deleteArtist); // 작가 삭제하기

// 작가 포트폴리오 관련
manage.get('/artist/port/list', manageController.listArtistPortForm); //작가 포트폴리오 리스트 보기 폼
manage.post('/artist/port/add', multipartMiddleware, manageController.addArtistPort); // 작가 포트폴리오 추가하기
manage.post('/artist/port/delete', manageController.delArtistPort); // 작가 포트폴리오 삭제하기

// 스타일 정보 관련
manage.get('/style/list', manageController.listStyleForm); // 스타일 추가하기 폼
manage.get('/style/add', manageController.addStyleForm); // 스타일 추가하기 폼
manage.get('/style/info', manageController.infoStyleForm); // 스타일 전체 정보 보기 폼
manage.get('/style/cover/update', manageController.updateStyleCoverForm); // 스타일 커버 업데이트하기 폼
manage.get('/style/info/update', manageController.updateStyleInfoForm); // 스타일 정보 업데이트하기 폼
manage.post('/style/add', multipartMiddleware, manageController.addStyle); // 스타일 추가하기
manage.post('/style/cover/update', multipartMiddleware, manageController.updateStyleCover); // 스타일 커버 업데이트하기
manage.post('/style/info/update', manageController.updateStyleInfo); // 스타일 정보 업데이트하기
manage.post('/style/delete', manageController.deleteStyle); // 스타일 삭제하기

// 스타일 포트폴리오 관련
manage.get('/style/port/list', manageController.listStylePortForm); // 스타일 포트폴리오 리스트 보기 폼
manage.post('/style/port/add', multipartMiddleware, manageController.addStylePort); // 스타일 포트폴리오 추가하기
manage.post('/style/port/delete', manageController.delStylePort); // 스타일 포트폴리오 삭제하기

// 상품 정보 관련
manage.get('/goods/list', manageController.listGoodsForm); // 상품 리스트 보기 폼
manage.get('/goods/info', manageController.infoGoodsForm); // 상품 전체 정보 보기 폼
manage.get('/goods/info/update', manageController.updateGoodsInfoForm); // 상품 정보 업데이트하기 폼
manage.get('/goods/option/update', manageController.updateGoodsOptionForm); // 상품 옵션 업데이트하기 폼
manage.get('/goods/add', manageController.addGoodsForm); // 상품 추가하기 폼
manage.post('/goods/add', manageController.addGoods); // 상품 추가하기
manage.post('/goods/info/update', manageController.updateGoodsInfo); // 상품 정보 업데이트하기
manage.post('/goods/option/get', manageController.getGoodsOption); // 상품 옵션 가져오기
manage.post('/goods/option/update', manageController.updateGoodsOption); // 상품 옵션 업테이트하기
manage.post('/goods/delete', manageController.deleteGoods); // 상품 삭제하기

// 상품 포트폴리오 관련
manage.get('/goods/port/list', manageController.listGoodsPortForm); // 스타일 포트폴리오 리스트 보기 폼
manage.post('/goods/port/add', multipartMiddleware, manageController.addGoodsPort); // 상품 포트폴리오 추가하기
manage.post('/goods/port/delete', manageController.delGoodsPort); // 상품 포트폴리오 삭제하기

// 문의 관리
manage.get('/contact/list', manageController.showContactListForm); // 문의내역 보기 폼
manage.get('/contact/answer', manageController.showContactAnswerForm); // 문의 답변 폼
manage.post('/contact/answer', manageController.answerContact); // 문의에 대한 답변하기

// 유저 관련
// manage.post('/user/blacklist', manageController.showBlackList); // 블랙리스트 보여주기
// manage.post('/user/logfail', manageController.showFailList); // 로그인 실패 리스트 보여주기
// manage.post('/user/clearlog', manageController.clearLog); // 로그인 실패 초기화

// 앱 관련
// 작가 공지사항 관련
manage.get('/notice_a', manageController.Notice_a_Form); // 작가 공지사항 리스트 폼
manage.get('/notice_a/add', manageController.Notice_a_AddForm); // 작가 공지사항 추가하기 폼
manage.get('/notice_a/update', manageController.Notice_a_UpdateForm); // 작가 공지사항 수정하기 폼
manage.post('/notice_a/list', manageController.showNotice_a); // 작가 공지사항 리스트
manage.post('/notice_a/add', manageController.addNotice_a); // 작가 공지사항 추가하기
manage.post('/notice_a/update', manageController.updateNotice_a); // 작가 공지사항 수정하기
manage.post('/notice_a/delete', manageController.deleteNotice_a); // 작가 공지사항 삭제하기

// 앱 공지사항 관련
manage.get('/notice', manageController.NoticeForm); // 앱 공지사항 리스트
manage.get('/notice/add', manageController.NoticeAddForm); // 작가 공지사항 추가하기 폼
manage.get('/notice/update', manageController.NoticeUpdateForm); // 작가 공지사항 수정하기 폼
manage.post('/notice/list', manageController.showNotice); // 앱 공지사항 리스트
manage.post('/notice/add', manageController.addNotice); // 앱 공지사항 추가하기
manage.post('/notice/update', manageController.updateNotice); // 앱 공지사항 수정하기
manage.post('/notice/delete', manageController.deleteNotice); // 앱 공지사항 삭제하기

// 앱 배너 관련
manage.get('/banner', manageController.BannerForm); // 앱 배너 리스트
manage.get('/banner/update', manageController.BannerUpdateForm); // 작가 공지사항 수정하기 폼
manage.post('/banner/list', manageController.showBanner); // 앱 배너 리스트
manage.post('/banner/update', multipartMiddleware, manageController.updateBanner); // 앱 배너 정보 수정하기

// 앱 버전 관련
manage.get('/app', manageController.AppForm); // 앱 정보 보여주기
manage.post('/app/info', manageController.showAppInfo); // 앱 정보 보여주기
manage.post('/app/update', manageController.updateAppInfo); // 앱 정보 수정하기

// 정산 관련
manage.get('/carical', manageController.caricalForm); // 정산 폼 보여주기
manage.post('/carical/listap', manageController.showOrderListap); // 앱, 개인 주문 리스트
manage.post('/carical/listom', manageController.showOrderListom); // 오픈 마켓 주문 리스트
manage.post('/carical/listco', manageController.showOrderListco); // 회사 주문 리스트


module.exports = manage;
