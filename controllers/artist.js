var order_app = require('../models/order_app');
var orderlist = require('../models/orderlist');
var artist = require('../models/artist');
var reserve = require('../models/reserve');
var style = require('../models/style');
var async = require('async');
var security = require('../utility/security');
var util = require('../utility/util');
var log = require('../models/log');
var path = require('path');

/**
 * 실제 작가 웹페이지 렌더링 부분
 **/

// 작가 메인 페이지
exports.artistMainForm = function (req, res) {
	if (req.session.artist_sn == null || req.session.artist_sn == undefined || req.session.artist_sn == '') {
		res.render('a_loginform', { title: '작가 로그인'});
	} else {
		// 작가 작업 중인 주문 정보 확인
		orderlist.workinginfo(req.session.artist_sn, function (err, results) {
			// 예약된 것이 있는지 확인
			reserve.getartistlist(req.session.artist_sn, function (err, results2) {
				// 주문된 것 중 임박한 것이 있는지 확인
				orderlist.urgentorder(req.session.artist_sn, function (err, results3) {
					if (results.length == 1) {
						res.render('a_index', { title: '작가 메인', finishtime: results[0].order_finishtime, ucnt: results3.length, rcnt: results2.length });
					} else {
						res.render('a_index', { title: '작가 메인', finishtime: '', ucnt: results3.length, rcnt: results2.length });
					}
				});
			});
		});
	}
};

// 작가 로그인 페이지
exports.artistLogin = function (req, res) {
	// console.log(req.session);
	if (req.session.artist_sn == null || req.session.artist_sn == undefined || req.session.artist_sn == '') {
		res.render('a_loginform', { title: '작가 로그인'});
	} else {
		res.redirect('/chm/artist/');
	}
};


// 작가 로그아웃 get 방식
exports.artistLogout = function (req, res) {
	// console.log(req.session);
	if (req.session.artist_sn == null || req.session.artist_sn == undefined || req.session.artist_sn == '') {
		res.send('<script>alert("로그인을 먼저 해주세요!");location.replace("/chm/artist/login");</script>');
	} else {
		req.session.destroy();
		res.send('<script>alert("정상적으로 로그아웃하였습니다.");location.replace("/chm/artist/login");</script>');
	}
};


// 작가 공지사항 페이지
exports.noticeArtist = function (req, res) {
	// console.log(req.session);
	if (req.session.artist_sn == null || req.session.artist_sn == undefined || req.session.artist_sn == '') {
		res.send('<script>alert("로그인을 먼저 해주세요!");location.replace("/chm/artist/login");</script>');
	} else {
		// 작가 공지사항 불러오기
		artist.artistnoticelist(function (err, results) {
			if (err) console.log(err);
			res.render('a_noticeform', { title: '작가 공지사항', datas: results });
		});
	}
};


// 작가 예약요청 리스트 페이지
exports.reserveReqListForm = function (req, res) {
	// console.log(req.session);
	if (req.session.artist_sn == null || req.session.artist_sn == undefined || req.session.artist_sn == '') {
		res.send('<script>alert("로그인을 먼저 해주세요!");location.replace("/chm/artist/login");</script>');
	} else {
		// 작가 예약요청 리스트 받아오기
		reserve.getartistlist(req.session.artist_sn, function (err, results) {
			// console.log(results);
			if (err) console.log(err);
			res.render('a_reserve_reqlistform', { title: '작가 예약요청 리스트', datas: results });
		});
	}
};


// 작가 예약수락 리스트 페이지
exports.reserveAgreeListForm = function (req, res) {
	// console.log(req.session);
	if (req.session.artist_sn == null || req.session.artist_sn == undefined || req.session.artist_sn == '') {
		res.send('<script>alert("로그인을 먼저 해주세요!");location.replace("/chm/artist/login");</script>');
	} else {
		// 작가 예약 수락 리스트 불러오기
		reserve.getagreeartistlist(req.session.artist_sn, function (err, results) {
			// console.log(results);
			if (err) console.log(err);
			res.render('a_reserve_agreelistform', { title: '작가 예약수락 리스트', datas: results });
		});
	}
};


// 작가 예약정보 보기 페이지
exports.reserveInfoForm = function (req, res) {
	// console.log(req.session);
	if (req.session.artist_sn == null || req.session.artist_sn == undefined || req.session.artist_sn == '') {
		res.send('<script>alert("로그인을 먼저 해주세요!");location.replace("/chm/artist/login");</script>');
	} else {
		// console.log(req.query.sn);
		var d = new Date();
		var yy = d.getFullYear();
		var mm = d.getMonth() + 1;
		if (mm <= 9) {
			mm = "0" + mm;
		}

		var dd = d.getDate();
		if (dd <= 9) {
			dd = "0" + dd;
		}
		if (req.query.sn != undefined) {
			// 예약 정보 불러오기
			reserve.getartistreserveinfo(req.query.sn, function (err, results) {
				// console.log(results);
				if (err) console.log(err);
				res.render('a_reserve_infoform', { title: '작가 예약요청 리스트', datas: results, limit: yy + "-" + mm + "-" + dd });
			});
		} else {
			res.json('Your try is logged in Our Server!');
			return;
		}
	}
};


// 작가 정보 페이지
exports.infoArtist = function (req, res) {
	// console.log(req.session);
	if (req.session.artist_sn == null || req.session.artist_sn == undefined || req.session.artist_sn == '') {
		res.send('<script>alert("로그인을 먼저 해주세요!");location.replace("/chm/artist/login");</script>');
	} else {
		// 작가 정보 불러오기
		artist.getartistinfo(req.session.artist_sn, function (err, results) {
			if (err) {
				res.json({ result: 'fail', msg: '관리자에게 문의바랍니다.' });
			} else {
				res.render('a_infoform', { title: '작가 정보', datas: results });
			}
		});
	}
};


// 작가 스타일 리스트 폼
exports.styleListForm = function (req, res) {
	// console.log(req.session);
	if (req.session.artist_sn == null || req.session.artist_sn == undefined || req.session.artist_sn == '') {
		res.send('<script>alert("로그인을 먼저 해주세요!");location.replace("/chm/artist/login");</script>');
	} else {
		// 작가의 스타일 리스트 불러오기
		style.getartiststylelist(req.session.artist_sn, function (err, results) {
			// console.log(results);
			if (err) console.log(err);
			res.render('a_style_listform', { title: '작가 스타일 리스트', datas: results });
		});
	}
};


// 작가 스타일 리스트 폼
exports.styleInfoForm = function (req, res) {
	// console.log(req.session);
	if (req.session.artist_sn == null || req.session.artist_sn == undefined || req.session.artist_sn == '') {
		res.send('<script>alert("로그인을 먼저 해주세요!");location.replace("/chm/artist/login");</script>');
	} else {
		// 스타일 정보 불러오기
		style.showstyleinfo(req.query.sn, function (err, results) {
			// console.log(results);
			if (err) console.log(err);
			res.render('a_style_editform', { title: '작가 스타일 정보', datas: results });
		});
	}
};


// 작가 작업 대기 리스트 페이지
exports.worksWaitListForm = function (req, res) {
	// console.log(req.session);
	if (req.session.artist_sn == null || req.session.artist_sn == undefined || req.session.artist_sn == '') {
		res.send('<script>alert("로그인을 먼저 해주세요!");location.replace("/chm/artist/login");</script>');
	} else {
		// 임박한 작업 리스트 불러오기
		orderlist.urgentorder(req.session.artist_sn, function (err, results) {
			// console.log(results);
			if (err) console.log(err);
			// 그 외의 작업 리스트 불러오기
			orderlist.noturgentorder(req.session.artist_sn, function (err, results2) {
				// console.log(results2);
				if (err) console.log(err);
				res.render('a_works_waitlistform', { title: '작가 작업대기 리스트', datas: results, datas2: results2 });
			});
		});
	}
};


// 작가 작업 대기 정보 폼
exports.worksWaitInfoForm = function (req, res) {
	// console.log(req.session);
	if (req.session.artist_sn == null || req.session.artist_sn == undefined || req.session.artist_sn == '') {
		res.send('<script>alert("로그인을 먼저 해주세요!");location.replace("/chm/artist/login");</script>');
	} else {
		// 주문 정보 보기
		orderlist.getinfoorder(req.query.sn, function (err, results) {
			// console.log(results);
			if (err) console.log(err);
			res.render('a_works_waitinfoform', { title: '작가 작업대기 정보', datas: results });
		});
	}
};


// 작가 작업 중 정보 폼
exports.worksNowInfoForm = function (req, res) {
	// console.log(req.session);
	if (req.session.artist_sn == null || req.session.artist_sn == undefined || req.session.artist_sn == '') {
		res.send('<script>alert("로그인을 먼저 해주세요!");location.replace("/chm/artist/login");</script>');
	} else {
		// 작업 중인 주문 정보 보기
		orderlist.workinginfo(req.session.artist_sn, function (err, results) {
			// console.log(results);
			if (err) console.log(err);
			if (results[0] != undefined) {
				res.render('a_works_nowinfoform', { title: '작가 작업 중 정보', datas: results });
			} else {
				res.send('<script>alert("현재 작업 중인 주문이 없습니다.");history.back();</script>')
			}
		});
	}
};


// 사진 다운로드(작가용)
exports.getPhoto = function (req, res) {
	try {
		if (req.body.filepath == null || req.body.filepath == undefined || req.body.filepath == '') {
			res.send('<script>alert("해당 파일이 존재하지 않습니다.");</script>');
			return;
		}
		var filepath = req.body.filepath;
		// console.log(filepath);
		var arr = filepath.split("/");
		var name = arr[arr.length - 1];
		var foldername = name.substring(0, 12);
		var linkpath = path.resolve(__dirname, '..', 'public', 'imgs', 'uploads', foldername, name);
		res.download(linkpath);
	} catch (err) {
		if (err) console.error('err', err);
	}
};


// 작업 시작(작가용)
exports.workStart = function (req, res) {
	try {
		// 유효성 검사
		if (req.body.order_sn == null || req.body.order_sn == undefined || req.body.order_sn == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

		if (req.session.artist_sn == null || req.session.artist_sn == undefined || req.session.artist_sn == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

		var order_sn = req.body.order_sn;

		// 작업 중인 것이 있는지 확인
		orderlist.findworking(req.session.artist_sn, function (err, fresult) {
			if (err){
				res.json({ result: "fail", msg: err });
			} else {
				// console.log('분석 결과 ', results);
				if (fresult[0].cnt == 1) {
					res.send('<script>alert("이미 작업 중인 주문이 있습니다!");location.replace("/chm/artist/work/now");</script>');
				} else {
					// 해당 주문에 대한 작업 시작
					orderlist.workstart(order_sn, function (err, result) {
						if (err){
							res.json({ result: "fail", msg: err });
						} else {
							// console.log('분석 결과 ', results);
							if (result.affectedRows == 1) {
								res.send('<script>alert("작업이 시작되었습니다!");location.replace("/chm/artist/work/now");</script>');
							} else {
								res.send('<script>alert("이미 작업이 시작되었습니다!");location.replace("/chm/artist/work/now");</script>');
							}
						}
					});
				}
			}
		});
	} catch (err) {
		if (err) console.error('err', err);
	}
};


// 작업 완료(작가용)
exports.workComplete = function (req, res) {
	try {
		if (req.session.artist_sn == null || req.session.artist_sn == undefined || req.session.artist_sn == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

		if (req.body.order_sn == null || req.body.order_sn == undefined || req.body.order_sn == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

		if (req.session.artist_sn == null || req.session.artist_sn == undefined || req.session.artist_sn == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

		var order_sn = req.body.order_sn;

		// 작업 완료
		orderlist.workcomplete(order_sn, function (err, result) {
			if (err){
				res.json({ result: "fail", msg: err });
			} else {
				// console.log('분석 결과 ', results);
				if (result.affectedRows == 1) {
					res.send('<script>alert("작업이 완료되었습니다!");location.replace("/chm/artist/work/wait");</script>');
				} else {
					res.send('<script>alert("이미 작업이 완료되었습니다!");location.replace("/chm/artist/work/wait");</script>');
				}
			}
		});
	} catch (err) {
		if (err) console.error('err', err);
	}
};


// 작가 작업내역 페이지
exports.calForm = function (req, res) {
	// console.log(req.session);
	if (req.session.artist_sn == null || req.session.artist_sn == undefined || req.session.artist_sn == '') {
		res.send('<script>alert("로그인을 먼저 해주세요!");location.replace("/chm/artist/login");</script>');
	} else {
		var d = new Date();
		var y = d.getFullYear();
		var m = d.getMonth() + 1;
		res.render('a_calform', { title: '작가 작업내역', name: req.session.artist_name, yy: y, mm: m });
	}
};


// 서버 년, 월 받기
exports.getyymm = function (req, res) {
	var d = new Date();
	var y = d.getFullYear();
	var m = d.getMonth() + 1;
	res.json({ yy: y, mm: m });
};


// 해당년월 내역 보기(작가용)
exports.showArtistOrderList = function (req, res)  {
	try {
		if (req.session.artist_sn == null || req.session.artist_sn == undefined || req.session.artist_sn == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		var artist_sn = req.session.artist_sn;
		if (req.body.yy == null || req.body.yy == undefined || req.body.yy == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.mm == null || req.body.mm == undefined || req.body.mm == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		// console.log(req.body);
		var yy = req.body.yy;
		var mm = req.body.mm;
		// console.log(yy + "-" + mm);
		// 해당 년월에 맞는 주문 내역 불러오기
		orderlist.showartistorderlist(artist_sn, yy, mm, function (err, datas) {
			// console.log(datas);
			if(err){
				res.send(err);
			} else {
				res.json(datas);
			}
		});
    } catch (err) {
        if (err) console.error('err', err);
    }
};


// 작가 상세 정보 보여주기
exports.showArtistinfo = function(req, res)  {
    try {
    		if (req.body.artist_sn == null || req.body.artist_sn == undefined || req.body.artist_sn == '') {
    			res.json('Your try is logged in Our Server!');
    			return;
    		}
     		var artist_sn = req.body.artist_sn;

		//유효성 검사
		if (artist_sn == undefined){
			res.json({ result: "fail", msg: "query string is undefined" });
		} else {
			// 작가 정보 얻기
			artist.showartistinfo(artist_sn, function (err, results) {
				if (err){
					res.json({result: "fail", msg: err});
				} else {
					// console.log('분석 결과 ', results);
					res.json({result: "success", msg: "", output: results });
				}
			});
        	}
	} catch (err) {
    		if(err) console.error('err', err);
    }
};


// 작가 전체 목록 보여주기(단순 리스트 나열) - 안 씀
exports.showArtistlist = function(req, res)  {
	try {
		artist.showartistlist(function (err, datas) {
			// console.log('artist pool에 들어왔숑~');
			if(err){
				res.json({result: "fail", msg: err});
			} else {
				res.json({result: "success", data: datas});
			}
		});
	} catch(err) {
		if(err) console.error('err', err);
	}
};

// 작가 포트폴리오 보여주기 - 안 씀
exports.showPortlist = function(req, res)  {
	try {
		if (req.body.artist_sn == null || req.body.artist_sn == undefined || req.body.artist_sn == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		var artist_sn = req.body.artist_sn;
		artist.showartistports(artist_sn, function (err, datas) {
			// console.log('artist pool에 들어왔숑~');
			if(err){
				res.json({result: "fail", msg: err});
			} else {
				res.json({result: "success", data: datas});
			}
		});
	} catch(err) {
		if(err) console.error('err', err);
	}
};


// 작가 정보 수정하기(작가용)
exports.updateInfo = function (req, res) {
	try {
		// console.log(req.body);
		if (req.body.artist_ment == null || req.body.artist_ment == undefined || req.body.artist_ment == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.artist_able == null || req.body.artist_able == undefined || req.body.artist_able == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.artist_weekend == null || req.body.artist_weekend == undefined || req.body.artist_weekend == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

		if (req.session.artist_sn == null || req.session.artist_sn == undefined || req.session.artist_sn == '') {
			res.send('<script>alert("로그인을 먼저 해주세요!");location.replace("/chm/artist/login");</script>');
		} else {
			// console.log('req.body', req.body);
			var artist_sn = req.session.artist_sn;
			var data = [];
			data.push(parseInt(req.body.artist_weekend));
			data.push(req.body.artist_ment);
			data.push(parseInt(req.body.artist_able));
			data.push(artist_sn);

			// 작가 정보 업데이트
			artist.updateinfo(artist_sn, data, function (err, result) {
				if (err) console.log(err);
				res.send('<script>alert("수정 완료!");location.replace("/chm/artist/info");</script>');
			});
		}
	} catch (err) {
		if(err) console.error('err', err);
	}
};


// 스타일 정보 업데이트하기
exports.styleInfoUpdate = function (req, res) {
	try {
		// console.log(req.body);
		var style_sn = req.body.sn;
		var style_name = req.body.style_name;
		var style_onesketch = req.body.style_onesketch;
		var style_onepointcolor = req.body.style_onepointcolor;
		var style_onecolor = req.body.style_onecolor;
		var style_onefullsketch = req.body.style_onefullsketch;
		var style_onefullpointcolor = req.body.style_onefullpointcolor;
		var style_onefullcolor = req.body.style_onefullcolor;
		var style_description = req.body.style_description;
		var style_add1p = parseFloat(parseInt(req.body.style_add1p) / 100).toFixed(2);
		var style_add2p = parseFloat(parseInt(req.body.style_add2p) / 100).toFixed(2);
		var style_add3p = parseFloat(parseInt(req.body.style_add3p) / 100).toFixed(2);
		var style_a0 = req.body.style_a0;
		var style_a1 = req.body.style_a1;
		var style_a2 = req.body.style_a2;
		var style_disonesketch = req.body.style_disonesketch;
		var style_disonepointcolor = req.body.style_disonepointcolor;
		var style_disonecolor = req.body.style_disonecolor;
		var style_disonefullsketch = req.body.style_disonefullsketch;
		var style_disonefullpointcolor = req.body.style_disonefullpointcolor;
		var style_disonefullcolor = req.body.style_disonefullcolor;
		var style_discount = req.body.style_discount;
		var datas = [];

		datas.push(style_name);
		datas.push(style_onesketch);
		datas.push(style_onepointcolor);
		datas.push(style_onecolor);
		datas.push(style_onefullsketch);
		datas.push(style_onefullpointcolor);
		datas.push(style_onefullcolor);
		datas.push(style_description);
		datas.push(style_discount);
		datas.push(style_disonesketch);
		datas.push(style_disonepointcolor);
		datas.push(style_disonecolor);
		datas.push(style_disonefullsketch);
		datas.push(style_disonefullpointcolor);
		datas.push(style_disonefullcolor);
		datas.push(style_add1p);
		datas.push(style_add2p);
		datas.push(style_add3p);
		datas.push(style_sn);

		// 스타일 정보 업데이트
		style.updatestyleinfo(datas, function (err, result) {
			if (err) console.error(err);
			if (result.affectedRows == 1) {
				res.send('<script>alert("정상적으로 스타일 정보가 변경되었습니다.");location.replace("/chm/artist/style/info?sn=' + style_sn +'");</script>');
			} else {
				res.send('<script>alert("업데이트된 스타일 정보가 없습니다.");location.replace("/chm/artist/style/info?sn=' + style_sn +'");</script>');
			}
		});
	} catch (err) {
		if(err) console.error('err', err);
	}
};

// 작가 로그인(작가용)
exports.login = function (req, res) {
	try {
		// console.log('★Login body' , req.body);
		// 유효성 검사
		if (req.body.artist_id == null || req.body.artist_id == undefined || req.body.artist_id == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.artist_pwd == null || req.body.artist_pwd == undefined || req.body.artist_pwd == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		var id = req.body.artist_id;
		var pwd = req.body.artist_pwd;
		var encoid;
		var hashpwd;

		// id 암호화
		security.security_encodata(id, function (encodata) {
			encoid = encodata;
			// 비번 암호화
			security.security_pwdproc(pwd, function (encopwd) {
				hashpwd = encopwd;
				// 로그인
				artist.login(encoid, hashpwd, function (err, msg) {
					// console.log('★Login body' , encoid);
					// console.log('★Login body' , hashpwd);
					if (err) console.error('err artist.login 1 ', err);
					if (msg.result == 'success'){
						if (err) console.error('err artist.login 2', err);
						req.session.artist_sn = msg.artist_sn;
						req.session.artist_id = id;
						req.session.artist_name = msg.artist_name;
						res.send('<script>location.replace("/chm/artist/");</script>');
					} else if (msg.result == 'fail') {
						if (msg.msg == 'id') {
							res.send('<script>alert("Confirm Your ID!");location.replace("/chm/artist/login");</script>');
						} else if (msg.msg == 'pwd') {
							res.send('<script>alert("Confirm Your password!");location.replace("/chm/artist/login");</script>');
						}
					}
				});
			});
		});
	} catch (err) {
		if(err) console.error('err', err);
	}
};