var manage = require('../models/manage');
var orderlist = require('../models/orderlist');
var security = require('../utility/security');
var util = require('../utility/util');
var path = require('path');
var fs = require('fs');
var async = require('async');
var nodemailer = require('nodemailer');
var gcm = require('node-gcm');
var smtpTransport = require('nodemailer-smtp-transport');

// 서버 시간 받아오기
exports.getyymm = function (req, res) {
	var d = new Date();
	var y = d.getFullYear();
	var m = d.getMonth() + 1;
	res.json({ yy: y, mm: m });
};

/*
 * 관리자 뷰 페이지
 */

/*
 * 관리자 로그인
 */
// 관리자 로그인 페이지
exports.LoginForm = function (req, res) {
	try {
		if (req.session.user_id != 'administrator') {
			res.render('m_loginform', { title: 'OMV admin'});
		} else {
			res.send('<script>alert("이미 로그인하셨습니다. ^^");location.replace("/chm/manage/");</script>');
			// res.redirect('/chm/manage');
		}
	} catch (err) {
		console.error(err);
	}
};

/*
 * 관리자 메인
 */
// 관리자 메인 페이지
exports.MainForm = function (req, res) {
	try {
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			// 검수 필요한 주문 개수 얻기
			manage.getneedcheck(function (err, result) {
				if (err) {
					console.error(err);
					var cnt = 'error';
					// 답변해야 할 문의 개수 얻기
					manage.getneedreturn(function (err, result2) {
						if (err) {
							console.error(err);
							var cnt2 = 'error';
							res.render('m_index', { title: 'OMV admin', cnt: cnt, cnt2: cnt2 });
						} else {
							var cnt2 = result2.cnt;
							res.render('m_index', { title: 'OMV admin', cnt: cnt, cnt2: cnt2 });
						}
					});
				} else {
					var cnt = result.cnt;
					// 답변해야 할 문의 개수 얻기
					manage.getneedreturn(function (err, result2) {
						if (err) {
							console.error(err);
							var cnt2 = 'error';
							res.render('m_index', { title: 'OMV admin', cnt: cnt, cnt2: cnt2 });
						} else {
							var cnt2 = result2.cnt;
							res.render('m_index', { title: 'OMV admin', cnt: cnt, cnt2: cnt2 });
						}
					});
				}
			});
		}
	} catch (err) {
		console.error(err);
	}
};


/*
 * 관리자 주문
 */
// 관리자 주문 내역 페이지
exports.OrderlistForm = function (req, res) {
 	try {
 		var d = new Date();
 		var y = d.getFullYear();
 		var m = d.getMonth() + 1;
 		if (req.session.user_id != 'administrator') {
 			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
 		} else {
 			res.render('m_order_list', { title: 'OMV admin', yy: y, mm: m });
 		}
 	} catch (err) {
 		console.error(err);
 	}
};

// 관리자 주문 정보 페이지
exports.OrderInfoForm = function (req, res) {
 	try {
 		var order_sn = req.query.sn;
 		if (req.session.user_id != 'administrator') {
 			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
 		} else {
 			// 주문 정보 얻기
 			manage.getorderinfo(order_sn, function (err, result) {
 				if (result[0].user_sn != 'offpersonal' && result[0].user_sn != 'offmarket' && result[0].user_sn !=  'offcompany') {
 					// 주문자 아이디 얻기
	 				manage.getuserid(result[0].user_sn, function (err, result2) {
	 					// 아이디 복호화
	 					security.security_decodata(result2[0].user_id, function (decoid) {
	 						result[0].user_id = decoid;
	 						// 주문 상품 리스트 얻기
	 						manage.getordergoodslist(order_sn, function (err, results) {
	 							// console.log(result);
	 							res.render('m_order_info', { title: 'OMV admin', datas: result, datas2: results });
	 						});
	 					});
	 				});
	 			} else {
	 				result[0].user_id = result[0].user_sn;
	 				// 주문 상품 리스트 얻기
	 				manage.getordergoodslist(order_sn, function (err, results) {
	 					// console.log(result);
	 					res.render('m_order_info', { title: 'OMV admin', datas: result, datas2: results });
	 				});
	 			}
 			});
 		}
 	} catch (err) {
 		console.error(err);
 	}
};

// 관리자 주문 검수 페이지
exports.OrderCheckForm = function (req, res) {
	try {
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			async.waterfall([
				function (callback) {
					// 검수가 필요한 주문 리스트 얻기
					manage.getchecklist(function (err, results) {
						callback(null, results);
					});
				},
				function (arg1, callback) {
					var datas = [];
					for (var i in arg1) {
						// console.log(i);
						// 검수가 필요한 주문들의 아이디 얻기
						manage.getuserid(arg1[i].user_sn, function (err, results2) {
							// 아이디 복호화
							security.security_decodata(results2[0].user_id, function (decoid) {
								datas.push(decoid);
								if (datas.length == arg1.length) {
									callback(null, arg1, datas);
								}
							});
						});
					}
					if (arg1.length == 0) {
						callback(null, arg1, datas);
					}
				},
				function (arg1, arg2, callback) {
					for (var i in arg1) {
						arg1[i].user_id = arg2[i];
					}
					callback(null, arg1);
				}
			], function (err, results) {
				// console.log(results);
				res.render('m_order_check_caricature', { title: 'OMV admin', datas: results });
			});
		}
	} catch (err) {
		console.error(err);
	}
};


// 가짜 주문 입력하기
exports.addOrderForm = function (req, res) {
	try {
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			// 스타일 리스트 얻기
			manage.showstylelist(function (err, results) {
				res.render('m_order_add', { title: 'OMV admin', datas: results });
			});
		}
	} catch (err) {
		console.error(err);
	}
};


/*
 * 관리자 작가
 */
 // 관리자 작가 리스트 페이지
exports.listArtistForm = function (req, res) {
 	try {
 		if (req.session.user_id != 'administrator') {
 			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
 		} else {
 			// 작가 리스트 얻기
 			manage.showartistlist(function (err, results) {
 				res.render('m_artist_list', { title: 'OMV admin', datas: results });
 			});
 		}
 	} catch (err) {
 		console.error(err);
 	}
};


// 관리자 작가 전체 정보 페이지
exports.infoArtistForm = function (req, res) {
 	try {
 		var artist_sn = req.query.sn;
 		if (req.session.user_id != 'administrator') {
 			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
 		} else {
 			// 작가 정보 얻기
 			manage.getartistinfo(artist_sn, function (err, results) {
 				if (err) {
 					console.error(err);
 					res.send("<script>alert('작가 전체 정보를 불러오는데 실패하였습니다.);</script>");
 					return;
 				}
 				// 작가 아이디 복호화
 				security.security_decodata(results[0].artist_id, function (decoid) {
 					results[0].artist_id = decoid;
 					// 작가 약력 얻기
 					manage.getartist_info(artist_sn, function (err, results2)  {
 						if (err) {
 							console.error(err);
 							res.send("<script>alert('작가 약력을 불러오는데 실패하였습니다.);</script>");
 							return;
 						}
 						res.render('m_artist_info', { title: 'OMV admin', datas: results, datas2: results2 });
 					});
 				});
 			});
 		}
 	} catch (err) {
 		console.error(err);
 	}
};


// 관리자 작가 정보 수정 페이지
exports.updateArtistInfoForm = function (req, res) {
	try {
		var artist_sn = req.query.sn;
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			// 작가 정보 얻기
			manage.getartistinfo(artist_sn, function (err, results) {
				// 작가 아이디 복호화
				security.security_decodata(results[0].artist_id, function (decoid) {
					results[0].artist_id = decoid;
					res.render('m_artist_edit_basicinfo', { title: 'OMV admin', datas: results });
				});
			});
		}
	} catch (err) {
		console.error(err);
	}
};


// 관리자 작가 프로필 수정 페이지
exports.updateArtistProfileForm = function (req, res) {
	try {
		var artist_sn = req.query.sn;
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			// 작가 정보 얻기
			manage.getartistinfo(artist_sn, function (err, results) {
				res.render('m_artist_edit_pic', { title: 'OMV admin', datas: results });
			});
		}
	} catch (err) {
		console.error(err);
	}
};


// 관리자 작가 약력 수정 페이지
exports.updateArtistHistoryForm = function (req, res) {
	try {
		var artist_sn = req.query.sn;
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			res.render('m_artist_edit_history', { title: 'OMV admin', artist_sn: artist_sn });
		}
	} catch (err) {
		console.error(err);
	}
};


// 관리자 작가 포트폴리오 리스트 페이지
exports.listArtistPortForm = function (req, res) {
	try {
		var artist_sn = req.query.sn;
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			// 작가 포트폴리오 얻기
			manage.getartistport(artist_sn, function (err, results) {
				res.render('m_artist_edit_pofol', { title: 'OMV admin', datas: results, artist_sn: artist_sn });
			});
		}
	} catch (err) {
		console.error(err);
	}
};


// 관리자 작가 추가 페이지
exports.addArtistForm = function (req, res) {
	try {
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			res.render('m_artist_add', { title: 'OMV admin' });
		}
	} catch (err) {
		console.error(err);
	}
};


/*
 * 관리자 스타일
 */
// 관리자 스타일 리스트 페이지
exports.listStyleForm = function (req, res) {
  	try {
  		if (req.session.user_id != 'administrator') {
  			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
  		} else {
  			// 스타일 리스트 보여주기
  			manage.showstylelist(function (err, results) {
  				res.render('m_style_list', { title: 'OMV admin', datas: results });
  			});
  		}
  	} catch (err) {
  		console.error(err);
  	}
};


// 관리자 스타일 전체 정보 페이지
exports.infoStyleForm = function (req, res) {
  	try {
  		var style_sn = req.query.sn;
  		if (req.session.user_id != 'administrator') {
  			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
  		} else {
  			// 스타일 정보 얻기
  			manage.getstyleinfo(style_sn, function (err, results) {
  				if (err) {
  					console.error(err);
  					res.send("<script>alert('스타일 전체 정보를 불러오는데 실패하였습니다.);</script>");
  					return;
  				}
  				res.render('m_style_info', { title: 'OMV admin', datas: results });
  			});
  		}
  	} catch (err) {
  		console.error(err);
  	}
};


// 관리자 스타일 정보 수정 페이지
exports.updateStyleInfoForm = function (req, res) {
 	try {
 		var style_sn = req.query.sn;
 		if (req.session.user_id != 'administrator') {
 			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
 		} else {
 			// 스타일 정보 얻기
 			manage.getstyleinfo(style_sn, function (err, results) {
 				res.render('m_style_edit_basicinfo', { title: 'OMV admin', datas: results });
 			});
 		}
 	} catch (err) {
 		console.error(err);
 	}
};


// 관리자 스타일 커버 수정 페이지
exports.updateStyleCoverForm = function (req, res) {
 	try {
 		var style_sn = req.query.sn;
 		if (req.session.user_id != 'administrator') {
 			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
 		} else {
 			// 스타일 정보 얻기
 			manage.getstyleinfo(style_sn, function (err, results) {
 				res.render('m_style_edit_pic', { title: 'OMV admin', datas: results });
 			});
 		}
 	} catch (err) {
 		console.error(err);
 	}
};


// 관리자 스타일 포트폴리오 리스트 페이지
exports.listStylePortForm = function (req, res) {
 	try {
 		var style_sn = req.query.sn;
 		if (req.session.user_id != 'administrator') {
 			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
 		} else {
 			// 스타일 포트폴리오 더기
 			manage.getstyleport(style_sn, function (err, results) {
 				res.render('m_style_edit_pofol', { title: 'OMV admin', datas: results, style_sn: style_sn });
 			});
 		}
 	} catch (err) {
 		console.error(err);
 	}
};


 // 관리자 스타일 추가 페이지
exports.addStyleForm = function (req, res) {
 	try {
 		if (req.session.user_id != 'administrator') {
 			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
 		} else {
 			// 작가 리스트 얻기(스타일 추가용)
 			manage.showartistlist(function (err, results) {
 				res.render('m_style_add', { title: 'OMV admin', artist: results });
 			});
 		}
 	} catch (err) {
 		console.error(err);
 	}
};


/*
 * 관리자 상품
 */

// 관리자 상품 리스트 페이지
exports.listGoodsForm = function (req, res) {
   	try {
   		if (req.session.user_id != 'administrator') {
   			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
   		} else {
   			// 상품 리스트 얻기
   			manage.showgoodslist(function (err, results) {
   				res.render('m_goods_list', { title: 'OMV admin', datas: results });
   			});
   		}
   	} catch (err) {
   		console.error(err);
   	}
};

// 관리자 상품 전체 정보 페이지
exports.infoGoodsForm = function (req, res) {
  	try {
  		var goods_sn = req.query.sn;
  		if (req.session.user_id != 'administrator') {
  			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
  		} else {
  			// 상품 정보 얻기
  			manage.getgoodsinfo(goods_sn, function (err, results) {
  				if (err) {
  					console.error(err);
  					res.send("<script>alert('상품 기본 정보를 불러오는데 실패하였습니다.);</script>");
  					return;
  				}
  				// 상품 옵션 얻기
  				manage.getgoodsoptionlist(goods_sn, function (err, results2) {
  					if (err) {
  						console.error(err);
  					  	res.send("<script>alert('상품 기본 정보를 불러오는데 실패하였습니다.);</script>");
  					  	return;
  					}
  					res.render('m_goods_info', { title: 'OMV admin', datas: results, datas2: results2 });
  				});
  			});
  		}
  	} catch (err) {
  		console.error(err);
  	}
};

// 관리자 상품 정보 수정 페이지
exports.updateGoodsInfoForm = function (req, res) {
	try {
		var goods_sn = req.query.sn;
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			// 상품 정보 얻기
			manage.getgoodsinfo(goods_sn, function (err, results) {
				res.render('m_goods_edit_basicinfo', { title: 'OMV admin', datas: results });
			});
		}
	} catch (err) {
		console.error(err);
	}
};

// 관리자 상품 옵션 수정 페이지
exports.updateGoodsOptionForm = function (req, res) {
	try {
		var goods_sn = req.query.sn;
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			// 작가 리스트 얻기
			manage.showartistlist(function (err, results) {
				// console.log(results);
				res.render('m_goods_edit_option', { title: 'OMV admin', goods_sn: goods_sn, datas: results});
			});
		}
	} catch (err) {
		console.error(err);
	}
};

// 관리자 상품 포트폴리오 리스트 페이지
exports.listGoodsPortForm = function (req, res) {
	try {
		var goods_sn = req.query.sn;
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			// 상품 포트폴리오 얻기
			manage.getgoodsport(goods_sn, function (err, results) {
				res.render('m_goods_edit_pofol', { title: 'OMV admin', datas: results, goods_sn: goods_sn });
			});
		}
	} catch (err) {
		console.error(err);
	}
};

// 관리자 상품 추가 페이지
exports.addGoodsForm = function (req, res) {
 	try {
 		if (req.session.user_id != 'administrator') {
 			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
 		} else {
 			res.render('m_goods_add', { title: 'OMV admin' });
 		}
 	} catch (err) {
 		console.error(err);
 	}
};


/*
 * 관리자 문의
 */
// 문의 내역 보기 페이지
exports.showContactListForm = function (req, res) {
	try {
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			async.waterfall([
				function (callback) {
					// 답변 안된 문의 리스트 얻기
					manage.shownotcontact(function (err, results) {
						callback(null, results);
					});
				},
				function (arg1, callback) {
					var datas = [];
					for (var i in arg1) {
						// console.log(i);
						// 사용자 이름 얻기
						manage.getusername(arg1[i].contact_user_sn, function (err, results2) {
							// security.security_decodata(results2[0].user_name, function (deconame) {
								datas.push('');
								if (datas.length == arg1.length) {
									callback(null, arg1, datas);
								}
							// });
						});
					}
					if (arg1.length == 0) {
						callback(null, arg1, datas);
					}
				},
				function (arg1, arg2, callback) {
					for (var i in arg1) {
						arg1[i].contact_user_name = arg2[i];
					}
					callback(null, arg1);
				}
			], function (err, results) {
				res.render('m_contact_list', { title: 'OMV admin', datas: results });
			});
		}
	} catch (err) {
		console.error(err);
	}
};

// 문의 답변하기 페이지
exports.showContactAnswerForm = function (req, res) {
	try {
		var contact_sn = req.query.sn;
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			// 문의 정보 얻기
			manage.showcontactinfo(contact_sn, function (err, results) {
				res.render('m_contact_answer', { title: 'OMV admin', data: results[0] });
			});
		}
	} catch (err) {
		console.error(err);
	}
};


/*
 * 관리자 작가 공지사항
 */
// 관리자 작가 공지사항 관리 페이지
exports.Notice_a_Form = function (req, res) {
	try {
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			// 작가 공지사항 리스트 얻기
			manage.shownotice_alist(function (err, results) {
				if (err) console.error(err);
				// res.json({ results : results });
				res.render('m_notice_artist', { title: 'OMV admin', datas: results });
			});
			// res.redirect('/chm/manage');
		}
	} catch (err) {
		console.error(err);
	}
};


// 관리자 작가 공지사항 추가 페이지
exports.Notice_a_AddForm = function (req, res) {
	try {
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			res.render('m_notice_artist_add', { title: 'OMV admin'});
			// res.redirect('/chm/manage');
		}
	} catch (err) {
		console.error(err);
	}
};

// 관리자 작가 공지사항 수정 페이지
exports.Notice_a_UpdateForm = function (req, res) {
	try {
		req.session.user_id='administrator';
		// console.log(req.session.user_id);
		var sn = req.query.sn;
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			// 작가 공지사항 정보 얻기
			manage.shownotice_ainfo(sn, function (err, result) {
				if (err) {
					console.error(err);
					res.send("<script>alert('작가 공지사항 정보를 불러오는데 실패하였습니다.);</script>");
					return;
				}
				res.render('m_notice_artist_edit', { title: 'OMV admin', datas: result });
			});
			// res.redirect('/chm/manage');
		}
	} catch (err) {
		console.error(err);
	}
};


/*
 * 관리자 앱 공지사항
 */
// 관리자 앱 공지사항 관리 페이지
exports.NoticeForm = function (req, res) {
	try {
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			// 앱 공지사항 리스트 얻기
			manage.shownoticelist(function (err, results) {
				if (err) console.error(err);
				// res.json({ results : results });
				// console.log(results);
				res.render('m_notice_app', { title: 'OMV admin', datas: results });
			});
			// res.redirect('/chm/manage');
		}
	} catch (err) {
		console.error(err);
	}
};

// 관리자 앱 공지사항 추가 페이지
exports.NoticeAddForm = function (req, res) {
	try {
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			res.render('m_notice_app_add', { title: 'OMV admin'});
			// res.redirect('/chm/manage');
		}
	} catch (err) {
		console.error(err);
	}
};

// 관리자 앱 공지사항 수정 페이지
exports.NoticeUpdateForm = function (req, res) {
	try {
		req.session.user_id='administrator';
		var sn = req.query.sn;
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			// 공지사항 정보 얻기
			manage.shownoticeinfo(sn, function (err, result) {
				if (err) {
					console.error(err);
					res.send("<script>alert('앱 공지사항 정보를 불러오는데 실패하였습니다.);</script>");
					return;
				}
				res.render('m_notice_app_edit', { title: 'OMV admin', datas: result });
			});
			// res.redirect('/chm/manage');
		}
	} catch (err) {
		console.error(err);
	}
};


/*
 * 관리자 배너
 */
// 관리자 배너 관리 페이지
exports.BannerForm = function (req, res) {
	try {
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			// 배너 리스트 얻기
			manage.showbannerlist(function (err, results) {
				if (err) {
					console.error(err);
					res.send("<script>alert('앱 배너 리스트를 불러오는데 실패하였습니다.);</script>");
					return;
				}
				res.render('m_app_banner', { title: 'OMV admin', datas: results });
			});
			// res.redirect('/chm/manage');
		}
	} catch (err) {
		console.error(err);
	}
};

// 관리자 배너 관리 페이지
exports.BannerUpdateForm = function (req, res) {
	try {
		var sn = req.query.sn;
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			// 배너 정보 얻기
			manage.showbannerinfo(sn, function (err, result) {
				if (err) {
					console.error(err);
					res.send("<script>alert('앱 배너 정보를 불러오는데 실패하였습니다.);</script>");
					return;
				}
				res.render('m_app_banner_edit', { title: 'OMV admin', datas: result });
			});
			// res.redirect('/chm/manage');
		}
	} catch (err) {
		console.error(err);
	}
};


/*
 * 관리자 앱 정보
 */
// 관리자 앱 관리 페이지
exports.AppForm = function (req, res) {
	try {
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			// 앱 정보 얻기
			manage.showappinfo(function (err, result) {
				if (err) {
					console.error(err);
					res.send("<script>alert('앱정보를 불러오는 실패하였습니다.');</script>");
					return;
				}
				res.render('m_app_version', { title: 'OMV admin', datas: result });
			});
			// res.redirect('/chm/manage');
		}
	} catch (err) {
		console.error(err);
	}
};


exports.caricalForm = function (req, res) {
	// console.log(req.session);
	try {
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해주세요. ^^");location.replace("/chm/manage/login");</script>');
		} else {
			var d = new Date();
			var y = d.getFullYear();
			var m = d.getMonth() + 1;
			// 작가 리스트 얻기
			manage.showartistlist(function (err, results) {
				res.render('m_calculate_caricature_detailview', { title: '관리자 정산', yy: y, mm: m, datas: results });
			});

			// res.redirect('/chm/manage');
		}
	} catch (err) {
		console.error(err);
	}
};


/*
 * 관리자 처리
 */

// 관리자 로그인
exports.Login = function (req, res) {
	try {
		var id = req.body.admin_id;
		var pwd = req.body.admin_pwd;
		var data = [id, pwd];

		// 관리자 로그인하기
		manage.login(data, function (err, result) {
			if (result.cnt == 1) {
				req.session.user_id = 'administrator';
				res.send('<script>alert("관리자님 안녕하세요 ^^");location.replace("/chm/manage/");</script>');
			} else {
				// 블랙 리스트 고고
			}
		});
	} catch (err) {
		console.error(err);
	}
};

// 관리자 로그아웃
exports.Logout = function (req, res) {
	req.session.destroy();
	res.send('<script>alert("로그아웃이 정상적으로 처리되었습니다. ^^");location.replace("/chm/manage/login");</script>');
};

// 주문 내역 관련
// 전체 주문정보
exports.getAlllist = function (req, res) {
	try {
		// 유효성 검사
		if (req.body.mode == null || req.body.mode == undefined || req.body.mode == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.yy == null || req.body.yy == undefined || req.body.yy == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.mm == null || req.body.mm == undefined || req.body.mm == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		// console.log(req.body);
		var mode = req.body.mode;
		var yy = req.body.yy;
		var mm = req.body.mm;
		// console.log(yy + "-" + mm);

		if (mode == 0) {
			async.waterfall([
				function (callback) {
					// 해당 년,월 모든 주문 내역 불러오기
					manage.getallorderlist(yy, mm, function (err, results) {
						callback(null, results);
					});
				},
				function (arg1, callback) {
					var datas = [];
					async.each(arg1, function (item, callback1) {
						if (item.user_sn != 'offpersonal' && item.user_sn != 'offmarket' && item.user_sn !=  'offcompany') {
							// 사용자 아이디 얻기
							manage.getuserid(item.user_sn, function (err, results2) {
								// 사용자 아이디 복호화
								security.security_decodata(results2[0].user_id, function (decoid) {
									datas.push(decoid);
									callback1();
								});
							});
						} else {
							callback1();
						}
					});
					// console.log(arg1);
					// console.log(datas);
					if (arg1.length == 0) {
						callback(null, arg1, datas);
					} else {
						callback(null, arg1, datas);
					}
				},
				function (arg1, arg2, callback) {
					// console.log(arg1);
					// console.log(arg2);
					var i = 0;
					async.each(arg1, function (item, callback1) {
						if (item.user_sn == 'offpersonal') {
							item.user_id = 'offpersonal';
						} else if (item.user_sn == 'offmarket') {
							item.user_id = 'offmarket';
						} else if (item.user_sn == 'offcompany') {
							item.user_id = 'offcompany';
						} else {
							item.user_id = arg2[i];
							i++;
						}
						callback1();
					});
					callback(null, arg1);
				}
			], function (err, results) {
				res.json({ data: results });
			});
		} else if (mode == 1) {
			async.waterfall([
				function (callback) {
					// 결제된 주문 내역 얻기
					manage.getpayedorderlist(yy, mm, function (err, results) {
						callback(null, results);
					});
				},
				function (arg1, callback) {
					var datas = [];
					async.each(arg1, function (item, callback1) {
						if (item.user_sn != 'offpersonal' && item.user_sn != 'offmarket' && item.user_sn !=  'offcompany') {
							// 사용자 아이디 얻기
							manage.getuserid(item.user_sn, function (err, results2) {
								// 사용자 아이디 복호화
								security.security_decodata(results2[0].user_id, function (decoid) {
									datas.push(decoid);
									callback1();
								});
							});
						} else {
							callback1();
						}
					});
					if (arg1.length == 0) {
						callback(null, arg1, datas);
					} else {
						callback(null, arg1, datas);
					}
				},
				function (arg1, arg2, callback) {
					// console.log(arg1);
					// console.log(arg2);
					var i = 0;
					async.each(arg1, function (item, callback1) {
						if (item.user_sn == 'offpersonal') {
							item.user_id = 'offpersonal';
						} else if (item.user_sn == 'offmarket') {
							item.user_id = 'offmarket';
						} else if (item.user_sn == 'offcompany') {
							item.user_id = 'offcompany';
						} else {
							item.user_id = arg2[i];
							i++;
						}
						callback1();
					});
					callback(null, arg1);
				}
			], function (err, results) {
				res.json({ data: results });
			});
		} else if (mode == 2) {
			async.waterfall([
				function (callback) {
					// 완료된 주문 내역 얻기
					manage.getfinishedorderlist(yy, mm, function (err, results) {
						callback(null, results);
					});
				},
				function (arg1, callback) {
					var datas = [];
					async.each(arg1, function (item, callback1) {
						if (item.user_sn != 'offpersonal' && item.user_sn != 'offmarket' && item.user_sn !=  'offcompany') {
							// 사용자 아이디 얻기
							manage.getuserid(item.user_sn, function (err, results2) {
								// 사용자 아이디 복호화
								security.security_decodata(results2[0].user_id, function (decoid) {
									datas.push(decoid);
									callback1();
								});
							});
						} else {
							callback1();
						}
					});
					if (arg1.length == 0) {
						callback(null, arg1, datas);
					} else {
						callback(null, arg1, datas);
					}
				},
				function (arg1, arg2, callback) {
					// console.log(arg1);
					// console.log(arg2);
					var i = 0;
					async.each(arg1, function (item, callback1) {
						if (item.user_sn == 'offpersonal') {
							item.user_id = 'offpersonal';
						} else if (item.user_sn == 'offmarket') {
							item.user_id = 'offmarket';
						} else if (item.user_sn == 'offcompany') {
							item.user_id = 'offcompany';
						} else {
							item.user_id = arg2[i];
							i++;
						}
						callback1();
					});
					callback(null, arg1);
				}
			], function (err, results) {
				res.json({ data: results });
			});
		} else {
			res.json('Your try is logged in Our Server!');
			return;
		}
	} catch (err) {
		console.error(err);
	}
}

// 해당 주문 취소하기
exports.cancelOrder = function (req, res) {
	try {

	} catch (err) {
		console.error(err);
	}
};

// 주문 검수 관련
// 해당 주문 검수 완료
exports.checkOrder = function (req, res) {
	try {
		if (req.session.user_id != 'administrator') {
			res.send('<script>alert("로그인해 주세요");location.replace("/chm/manage/login");</script>');
			return;
		}
		if (req.body.sn == null || req.body.sn == undefined || req.body.sn == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

		// console.log(req.body.order_sn);
		var order_sn = req.body.sn;

		// 검수가 필요한 주문 정보 얻기
		manage.getcheckorder(order_sn, function (err, result) {
			// 작가 아이디 복호화
			security.security_decodata(result[0].artist_id, function (decoid) {
				// 검수 완료
				manage.changecheck(order_sn, function (err, cresult) {
					if (err) {
						res.send("<script>alert('작업이 실패하였습니다. 관리자에게 문의해주세요.');</script>");
						// res.json({ result: "fail", msg: err });
					} else {
						if (cresult.affectedRows == 1) {
							// 해당 유저 GCM ID 얻기
							manage.getregistid(result[0].user_sn, function (err, gresult) {
								var gcmcustomer = gresult[0].user_registID;

								// 메일 보낼 준비
								var title = "[캐리커쳐 마키] 상품 검수가 완료되었습니다 .";
								var content = "작가 웹 페이지에 가셔서 상태 여부 변경을 해 주세요 ^^.\r\n 만약 작가 활동 여부를 안 바꾸시면 주문을 받으실 수 업어요.";
								var data = [title, content];
								// console.log ('sendmail.js data :', data);

								var transport = nodemailer.createTransport(smtpTransport({
									host: 'localhost'
								}));
								var mailOptions = {
									from: '<my@caricaturemakie.com>',
									to: decoid,
									subject: title,
									text: content
								};

								// console.log('mail 옵션 설정 완료!');
								// 메일 보내기
								transport.sendMail(mailOptions, function (err, response){
									if (err){
										console.error(err);
										res.send('<script>alert("주문이 검수되었지만 작가에게 알림을 보내는데 실패했습니다. 관리자에게 문의해주세요.^^");location.replace("/chm/manage/orderlist/check");</script>');
									} else {
										// console.log("Message sent : " + response.message);

										// GCM 보내기
										var message = new gcm.Message();
										var sender = new gcm.Sender('AIzaSyBD9Y9gdb82fAJBaPjXHf3iiGM0L8B3zIo');

										// console.log(gcmcustomer);
										message.addData('msg', '주문하신 작품이 완료되었어요! 이메일을 확인해주세요~!');
										message.collapseKey = 'omybrand';
										message.delayWhileIdle = true;
										message.timeToLive = 3;
										sender.send(message, [gcmcustomer], 4, function (err, gcmresult) {
											if (err) {
												res.send('<script>alert("사용자에게 GCM 전송이 실패했습니다.");location.replace("/chm/manage/orderlist/check");</script>');
											}
											else {
												res.send('<script>alert("사용자에게 GCM 전송이 완료되었습니다.");location.replace("/chm/manage/orderlist/check");</script>');
											}
											// console.log('result', gcmresult);
										});
									}
									transport.close();
								});
							});
						}
						else {
							res.send("<script>alert('유효하지 않은 작업입니다.');location.href='/chm/manage';</script>");
						}
					}
				});
			});
		});
	} catch (err) {
		if (err) console.error('err', err);
	}
};


// 주문 추가하기
exports.addOrder = function (req, res) {
	try {
		// console.log(req.body);
		var order_date = new Date(req.body.order_date);
		var user_sn = req.body.user_sn;
		var style_sn = req.body.style_sn;
		var style_mode = parseInt(req.body.style_mode);
		var style_size = parseInt(req.body.style_size);
		var pcount = parseInt(req.body.pcount);
		var price = parseInt(req.body.price);

		var datas = [];

		// 작가 일련번호 얻기
		manage.getartistsn(style_sn, function (err, gresults) {
			if (err) console.log('err', err);
			// console.log(gresults[0].artist_sn);

			// 마지막 주문 일련번호 확인
			orderlist.checksn(function (err, results) {
				if (err) console.log('err', err);
				// console.log('result', results);
				if (results == undefined || results == null || results.length == 0) {
					number = 1;
					// 주문 번호 생성
					util.leadingZeros(number, 8, function (tempnum) {
						var order_sn = "chmo" + tempnum;
						datas.push(order_sn);
						datas.push(user_sn);
						datas.push(gresults[0].artist_sn);
						datas.push(style_sn);
						datas.push('');
						datas.push('');											// 요구사항
						datas.push(style_size);									// 작업 사이즈
						datas.push(style_mode);									// 선택한 작업 스타일
						datas.push(pcount);										// 사람 인원 수
						datas.push(price);										// 가격(추가비용 제외)
						datas.push(order_date);									// 주문 날짜
						datas.push(order_date);									// 완성 날짜
						datas.push(0);											// 쿠폰 사용 여부
						datas.push(0);											// 추가 비용
						datas.push(3);											// 결제 수단
						datas.push('');											// 기본 주소
						datas.push('');											// 상세 주소
						datas.push('');											// 주문자 전화번호
						datas.push('');											// 택배 번호
						datas.push('');											// 주문자 이름
						datas.push(0);											// 마일리지

						// console.log(datas);

						// 주문 추가
						manage.addorder(datas, function (err, oresult){
							if (err) console.error(err);
							if (oresult.affectedRows == 1) {
								res.send('<script>alert("정상적으로 주문이 추가되었습니다.");location.replace("/chm/manage/orderlist/add");</script>');
							} else {
								res.send('<script>alert("주문 추가에 실패했습니다.");location.replace("/chm/manage/orderlist/add");</script>');
							}
						});
					});
				} else {
					number = parseInt(results[0].order_sn.substring(4, 12)) + 1;
					// 주문 일련번호 생성
					util.leadingZeros(number, 8, function (tempnum) {
						var order_sn = "chmo" + tempnum;
						datas.push(order_sn);
						datas.push(user_sn);
						datas.push(gresults[0].artist_sn);
						datas.push(style_sn);
						datas.push('');											// 사진경로
						datas.push('');											// 요구사항
						datas.push(style_size);									// 작업 사이즈
						datas.push(style_mode);									// 선택한 작업 스타일
						datas.push(pcount);										// 사람 인원 수
						datas.push(price);										// 가격(추가비용 제외)
						datas.push(order_date);									// 주문 날짜
						datas.push(order_date);									// 완성 날짜
						datas.push(0);											// 쿠폰 사용 여부
						datas.push(0);											// 추가 비용
						datas.push(3);											// 결제 수단
						datas.push('');											// 기본 주소
						datas.push('');											// 상세 주소
						datas.push('');											// 주문자 전화번호
						datas.push('');											// 택배 번호
						datas.push('');											// 주문자 이름
						datas.push(0);											// 마일리지

						// 주문 추가
						manage.addorder(datas, function (err, oresult){
							if (err) console.error(err);
							if (oresult.affectedRows == 1) {
								res.send('<script>alert("정상적으로 주문이 추가되었습니다.");location.replace("/chm/manage/orderlist/add");</script>');
							} else {
								res.send('<script>alert("주문 추가에 실패했습니다.");location.replace("/chm/manage/orderlist/add");</script>');
							}
						});
					});
				}
			});
		});
	} catch (err) {
		console.error(err);
	}
};


// 작가 정보 관련
// 작가 추가하기
exports.addArtist = function (req, res) {
	try {
		var artist_sn = '';
		var artist_id = req.body.artist_id;
		var artist_pwd = req.body.artist_pwd;
		var artist_name = req.body.artist_name;
		var artist_ment = req.body.artist_ment;
		var artist_weekend = req.body.artist_weekend;
		var datas = [];
		var encoid = '';
		var hashpwd='';

		// 작가 아이디 암호화
		security.security_encodata(artist_id, function (encodata) {
			encoid = encodata;
			// 작가 비밀번호 암호화
			security.security_pwdproc(artist_pwd, function (encopwd) {
				hashpwd = encopwd;
				// 새로운 작가 일련번호 생성
				manage.getnewartistsn(function (err, results) {
					if (results == undefined || results == null || results.length == 0) {
						number = 1;
						util.leadingZeros(number, 8, function (tempnum) {
							artist_sn = "chma" + tempnum;
							var upfile = req.files.upfile;
							var exti = upfile.name.lastIndexOf('.');
							var extv = upfile.name.substring(exti);

							if (upfile.originalFilename == '') {		// 선택한 파일이 없을 때
								// console.log("선택한 파일이 없음");
								// res.json({ result : 'fail', msg : 'upfile' });
								fs.unlinkSync(upfile.path);
							}
							else if (extv != '.jpg' && extv != '.jpeg' && extv != '.png' && extv != '.bmp') {
								// res.json({ result : 'fail', msg : 'upfile' });
								fs.unlinkSync(upfile.path);
							} else {
								var profilefolder = path.resolve(__dirname, '..', 'public', 'imgs', 'profile');
								var publicsrcpath = "http://www.caricaturemakie.com/chm/imgs/profile/";
								// console.log('profilefolder', profilefolder);
								if (!fs.existsSync(profilefolder)) {		// 폴더가 없으면 만듦
									fs.mkdirSync(profilefolder);
								}
								var name = artist_sn + extv;
								publicsrcpath += name;
								var srcpath = upfile.path;
								var destpath = path.resolve(profilefolder, name);
								var is = fs.createReadStream(srcpath);
								var os = fs.createWriteStream(destpath);
								is.pipe(os);
								is.on('end', function () {
									fs.unlinkSync(upfile.path);
									datas.push(artist_sn);
									datas.push(encoid);
									datas.push(hashpwd);
									datas.push(artist_name);
									datas.push(artist_ment);
									datas.push(publicsrcpath);
									datas.push(artist_weekend);
									// 작가 추가
									manage.addartist(datas, function (err, result) {
										if (result.affectedRows == 1) {
											res.send('<script>alert("정상적으로 작가가 추가되었습니다.");location.replace("/chm/manage/artist/list");</script>');
										} else {
											res.send('<script>alert("서버 쪽에서 문제가 발생하였습니다. 관리자에게 문의해주세요.");location.replace("/chm/manage/artist/list");</script>');
										}
									});
								});
							}
						});
					} else {
						// 작가 일련번호 생성
						number = parseInt(results[0].artist_sn.substring(4, 12)) + 1;
						util.leadingZeros(number, 8, function (tempnum) {
							artist_sn = "chma" + tempnum;
							var upfile = req.files.upfile;
							var exti = upfile.name.lastIndexOf('.');
							var extv = upfile.name.substring(exti);

							if (upfile.originalFilename == '') {		// 선택한 파일이 없을 때
								// console.log("선택한 파일이 없음");
								// res.json({ result : 'fail', msg : 'upfile' });
								fs.unlinkSync(upfile.path);
							}
							else if (extv != '.jpg' && extv != '.jpeg' && extv != '.png' && extv != '.bmp') {
								// res.json({ result : 'fail', msg : 'upfile' });
								fs.unlinkSync(upfile.path);
							} else {
								var profilefolder = path.resolve(__dirname, '..', 'public', 'imgs', 'profile');
								var publicsrcpath = "http://www.caricaturemakie.com/chm/imgs/profile/";
								// console.log('profilefolder', profilefolder);
								if (!fs.existsSync(profilefolder)) {		// 폴더가 없으면 만듦
									fs.mkdirSync(profilefolder);
								}
								var name = artist_sn + extv;
								publicsrcpath += name;
								var srcpath = upfile.path;
								var destpath = path.resolve(profilefolder, name);
								var is = fs.createReadStream(srcpath);
								var os = fs.createWriteStream(destpath);
								is.pipe(os);
								is.on('end', function () {
									fs.unlinkSync(upfile.path);
									datas.push(artist_sn);
									datas.push(encoid);
									datas.push(hashpwd);
									datas.push(artist_name);
									datas.push(artist_ment);
									datas.push(publicsrcpath);
									datas.push(artist_weekend);

									// 작가 추가
									manage.addartist(datas, function (err, result) {
										if (result.affectedRows == 1) {
											res.send('<script>alert("정상적으로 작가가 추가되었습니다.");location.replace("/chm/manage/artist/list");</script>');
										} else {
											res.send('<script>alert("서버 쪽에서 문제가 발생하였습니다. 관리자에게 문의해주세요.");location.replace("/chm/manage/artist/list");</script>');
										}
									});
								});
							}
						});
					}
				});
			});
		});
	} catch (err) {
		console.error(err);
	}
};


// 작가 프로필 수정하기
exports.updateArtistProfile = function (req, res) {
	try {
		var artist_sn = req.body.sn;
		var upfile = req.files.upfile;
		var exti = upfile.name.lastIndexOf('.');
		var extv = upfile.name.substring(exti);

		if (upfile.originalFilename == '') {		// 선택한 파일이 없을 때
			// console.log("선택한 파일이 없음");
			// res.json({ result : 'fail', msg : 'upfile' });
			fs.unlinkSync(upfile.path);
			res.send('<script>alert("파일이 선택되지 않았습니다.");history.back();</script>');
		}
		else if (extv != '.jpg' && extv != '.jpeg' && extv != '.png' && extv != '.bmp') {
			// res.json({ result : 'fail', msg : 'upfile' });
			fs.unlinkSync(upfile.path);
			res.send('<script>alert("파일의 확장자는 jpg, jpeg, png, bmp만 됩니다.");history.back();</script>');
		} else {
			var profilefolder = path.resolve(__dirname, '..', 'public', 'imgs', 'profile');
			var publicsrcpath = "http://www.caricaturemakie.com/chm/imgs/profile/";
			// console.log('profilefolder', profilefolder);
			if (!fs.existsSync(profilefolder)) {		// 폴더가 없으면 만듦
				fs.mkdirSync(profilefolder);
			}
			var name = artist_sn + extv;
			publicsrcpath += name;
			var srcpath = upfile.path;
			var destpath = path.resolve(profilefolder, name);
			var is = fs.createReadStream(srcpath);
			var os = fs.createWriteStream(destpath);
			is.pipe(os);
			is.on('end', function () {
				fs.unlinkSync(upfile.path);
				// 작가 정보 얻기
				manage.getartistinfo(artist_sn, function (err, results) {
					if (err) console.error(err);
					if (results[0] != undefined) {
						if (path.basename(results[0].artist_photo) != path.basename(publicsrcpath)) {
							var delfilepath = path.resolve(profilefolder, path.basename(results[0].artist_photo));
							fs.unlinkSync(delfilepath);
							var data = [publicsrcpath, artist_sn];
							// 작가 프로필 사진 업데이트
							manage.updateprofileartist(data, function (err, result) {
								if (result.affectedRows == 1) {
									res.send('<script>alert("정상적으로 작가 프로필이 변경되었습니다.");location.replace("/chm/manage/artist/info?sn=' + artist_sn +'");</script>');
								}
							});
						} else {
							res.send('<script>alert("정상적으로 작가 프로필이 변경되었습니다.");location.replace("/chm/manage/artist/info?sn=' + artist_sn +'");</script>');
						}
					}
				});
			});
		}
	} catch (err) {
		console.error(err);
	}
};


// 작가 정보 수정하기
exports.updateArtistInfo = function (req, res) {
	try {
		var artist_sn = req.body.artist_sn;
		var artist_id = req.body.artist_id;
		var artist_name = req.body.artist_name;
		var artist_able = req.body.artist_able;
		var artist_longtime = req.body.artist_longtime;
		var artist_weekend = req.body.artist_weekend;
		var artist_ment = req.body.artist_ment;
		var data = [];
		// 작가 아이디 암호화
		security.security_encodata(artist_id, function (encoid) {
			data.push(encoid);
			data.push(artist_name);
			data.push(artist_ment);
			data.push(artist_able);
			data.push(artist_longtime);
			data.push(artist_weekend);
			data.push(artist_sn);
			// 작가 정보 업데이트
			manage.updateartistinfo(data, function (err, result) {
				if (err) console.error(err);
				if (result.affectedRows == 1) {
					res.send('<script>alert("정상적으로 작가 정보가 변경되었습니다.");location.replace("/chm/manage/artist/info?sn=' + artist_sn +'");</script>');
				} else {
					res.send('<script>alert("업데이트된 작가 정보가 없습니다.");location.replace("/chm/manage/artist/info?sn=' + artist_sn +'");</script>');
				}
			});
		});
	} catch (err) {
		console.error(err);
	}
};


// 작가 삭제하기
exports.deleteArtist = function (req, res) {
	try {
		var artist_sn = req.body.sn;
		// 작가 정보 얻기
		manage.getartistinfo(artist_sn, function (err, results) {
			if (results != undefined && results[0] != undefined) {
				var exti = results[0].artist_photo.lastIndexOf('.');
				var extv = results[0].artist_photo.substring(exti);
				var profilepath = path.resolve(__dirname, '..', 'public', 'imgs', 'profile', artist_sn + extv);

				if (fs.existsSync(profilepath)) {
					fs.unlinkSync(profilepath);
				}

				// 작가 포트폴리오 경로 얻기
				manage.getartistportpaths(artist_sn, function (err, gresults) {
					async.each(gresults, function (item, callback) {
						var artistportspath = path.resolve(__dirname, '..', 'public', 'imgs', 'ports', 'artist', artist_sn, path.basename(item.artist_port));
						if (fs.existsSync(artistportspath)) {
							fs.unlinkSync(artistportspath);
						}
						callback();
					});

					// 작가 삭제
					manage.deleteartist(artist_sn, function (err, result) {
						if (err) console.error(err);
						if (result.affectedRows == 1) {
							// 작가 약력 삭제
							manage.deleteallartist_info(artist_sn, function (err, iresult) {
								if (err) console.error(err);
								// 작가 포트폴리오 삭제
								manage.delartistports(artist_sn, function (err, presult) {
									if (err) console.error(err);
									// 작가와 관련된 스타일 일련번호 얻기
									manage.getstylesns(artist_sn, function (err, sresults) {
										if (err) console.error(err);
										async.each(sresults, function (item, callback) {
											var style_sn = item.style_sn;
											// 스타일 정보 얻기
											manage.getstyleinfo(style_sn, function (err, giresults) {
												if (giresults != undefined && giresults[0] != undefined) {
													var exti = giresults[0].style_cover.lastIndexOf('.');
													var extv = giresults[0].style_cover.substring(exti);
													var exti2 = giresults[0].style_cover_noframe.lastIndexOf('.');
													var extv2 = giresults[0].style_cover_noframe.substring(exti2);
													var coverpath = path.resolve(__dirname, '..', 'public', 'imgs', 'cover', style_sn + extv);
													var coverpath2 = path.resolve(__dirname, '..', 'public', 'imgs', 'cover', style_sn + '_noframe' + extv2);

													if (fs.existsSync(coverpath)) {
														fs.unlinkSync(coverpath);
													}

													if (fs.existsSync(coverpath2)) {
														fs.unlinkSync(coverpath2);
													}

													// 스타일에 관련된 포트폴리오 삭제
													manage.getstyleportpaths(style_sn, function (err, gpresults) {
														async.each(gpresults, function (item, callback) {
															var styleportspath = path.resolve(__dirname, '..', 'public', 'imgs', 'ports', 'style', style_sn, path.basename(item.style_port));
															if (fs.existsSync(styleportspath)) {
																fs.unlinkSync(styleportspath);
															}
															callback();
														});

														// var artistportsfolder = path.resolve(__dirname, '..', 'public', 'imgs', 'ports', 'artist', artist_sn);
														// if (fs.existsSync(artistportsfolder)) {
														// 	fs.unlinkSync(artistportsfolder);
														// }

														// 스타일 삭제
														manage.deletestyle(style_sn, function (err, dsresult) {
															if (err) console.error(err);
															if (dsresult.affectedRows == 1) {
																// 스타일 포트폴리오 삭제
																manage.delstyleports(style_sn, function (err, dpresult) {
																	if (err) console.error(err);
																	// res.send('<script>alert("정상적으로 작가와 작가와 관련된 스타일이 삭제되었습니다.");location.replace("/chm/manage/style/list");</script>');
																});
															} else {
																// res.send('<script>alert("정상적으로 작가와 작가와 관련된 스타일이 삭제되었습니다.");location.replace("/chm/manage/style/list");</script>');
															}
														});
													});
												} else {

												}
												callback();
											});
										});
										res.send('<script>alert("정상적으로 작가와 작가와 관련된 스타일이 삭제되었습니다.");location.replace("/chm/manage/artist/list");</script>');
									});
								});
							});
						} else {
							res.send('<script>alert("작가가 존재하지 않습니다.");location.replace("/chm/manage/artist/list");</script>');
						}
					});
				});
			} else {
				res.send('<script>alert("작가가 존재하지 않습니다.");location.replace("/chm/manage/artist/list");</script>');
			}
		});
	} catch (err) {
		console.error(err);
	}
};


// 작가 약력 리스트 불러오기
exports.getArtistHistory = function (req, res) {
	try {
		var artist_sn = req.body.artist_sn;
		// console.log(req.body);
		// 작가 약력 얻기
		manage.getartist_info(artist_sn, function (err, results) {
			// console.log(results);
			res.json({ data: results });
		});
	} catch (err) {
		console.error(err);
	}
};


// 작가 약력 리스트 업데이트하기
exports.updateArtistHistory = function (req, res) {
	try {
		// console.log(req.body);
		var artist_sn = req.body.artist_sn;
		var artist_history = req.body.artist_history;
		var artist_del = req.body.artist_del;
		async.each(artist_history, function (item, callback) {
			if (item.sn == 0) {
				var data = [];
				data.push(artist_sn);
				data.push(item.year);
				data.push(item.month);
				data.push(item.content);
				// 작가 약력 추가하기(원래 DB에 존재하지 않은)
				manage.addartist_info(data, function (err, result) {
					if (result.affectedRows == 1) {
						// console.log('추가 완료');
					} else {
						// console.log('추가 실패');
					}
					callback();
				});
			}
		});

		async.each(artist_del, function (item, callback) {
			// 작가 약력 지우기(웹상에서 삭제된)
			manage.deleteartist_info(item, function (err, result) {
				if (result.affectedRows == 1) {
					// console.log('삭제 완료');
				} else {
					// console.log('삭제 실패');
				}
				callback();
			});
		});
		res.json({ result: 'success' });
	} catch (err) {
		console.error(err);
	}
};



// 작가 포트폴리오 관련
// 작가 포트폴리오 추가하기
exports.addArtistPort = function (req, res) {
	try {
		// console.log(req.body);
		// console.log(req.files);
		var artist_sn = req.body.artist_sn;
		var upfile = req.files.upfile;
		var exti = upfile.name.lastIndexOf('.');
		var extv = upfile.name.substring(exti);
		var datas = [];

		if (upfile.originalFilename == '') {		// 선택한 파일이 없을 때
			// console.log("선택한 파일이 없음");
			// res.json({ result : 'fail', msg : 'upfile' });
			fs.unlinkSync(upfile.path);
			res.send('<script>alert("파일이 선택되지 않았습니다.");history.back();</script>');
		}
		else if (extv != '.jpg' && extv != '.jpeg' && extv != '.png' && extv != '.bmp') {
			// res.json({ result : 'fail', msg : 'upfile' });
			fs.unlinkSync(upfile.path);
			res.send('<script>alert("파일의 확장자는 jpg, jpeg, png, bmp만 됩니다.");history.back();</script>');
		} else {
			var artistportsfolder = path.resolve(__dirname, '..', 'public', 'imgs', 'ports', 'artist', artist_sn);
			var publicsrcpath = "http://www.caricaturemakie.com/chm/imgs/ports/artist/" + artist_sn + "/";
			// console.log('profilefolder', profilefolder);
			if (!fs.existsSync(artistportsfolder)) {		// 폴더가 없으면 만듦
				fs.mkdirSync(artistportsfolder);
			}
			var name = upfile.originalFilename;
			publicsrcpath += name;
			var srcpath = upfile.path;
			var destpath = path.resolve(artistportsfolder, name);
			var is = fs.createReadStream(srcpath);
			var os = fs.createWriteStream(destpath);
			is.pipe(os);
			is.on('end', function () {
				fs.unlinkSync(upfile.path);
				datas.push(artist_sn);
				datas.push(publicsrcpath);
				// 작가 포트폴리오 추가하기
				manage.addartistport(datas, function (err, result) {
					if (err) console.error(err);
					if (result.affectedRows == 1) {
						res.send('<script>alert("정상적으로 작가 포트폴리오가 등록되었습니다.");location.replace("/chm/manage/artist/port/list?sn=' + artist_sn +'");</script>');
					} else {
						res.send('<script>alert("작가 포트폴리오 등록에 실패했습니다.");location.replace("/chm/manage/artist/port/list?sn=' + artist_sn +'");</script>');
					}
				});
			});
		}
	} catch (err) {
		console.error(err);
	}
};

// 작가 포트폴리오 삭제하기
exports.delArtistPort = function (req, res) {
	try {
		// console.log(req.body);
		var artist_info_sn = req.body.sn;
		var artist_sn = req.body.artist_sn;
		// 작가 포트폴리오 경로 얻기
		manage.getartistportpath(artist_info_sn, function (err, results) {
			if (results[0] == undefined) {
				res.send('<script>alert("존재하지 않는 포트폴리오입니다.");location.replace("/chm/manage/artist/port/list?sn=' + artist_sn + '");</script>');
				return;
			}
			var artistportspath = path.resolve(__dirname, '..', 'public', 'imgs', 'ports', 'artist', results[0].artist_sn, path.basename(results[0].artist_port));
			if (fs.existsSync(artistportspath)) {
				fs.unlinkSync(artistportspath);
			}
			// 작가 포트폴리오 삭제
			manage.delartistport(artist_info_sn, function (err, result) {
				if (result.affectedRows == 1) {
					res.send('<script>alert("정상적으로 작가 포트폴리오가 삭제되었습니다.");location.replace("/chm/manage/artist/port/list?sn=' + artist_sn + '");</script>');
				} else {
					res.send('<script>alert("존재하지 않는 포트폴리오입니다.");location.replace("/chm/manage/artist/port/list?sn=' + artist_sn + '");</script>');
				}
			});
		});
	} catch (err) {
		console.error(err);
	}
};

// 스타일 정보 관련
// 스타일 추가하기
exports.addStyle = function (req, res) {
	try {
		// console.log(req.body);
		// console.log(req.files);
		var style_sn = '';
		var artist_sn = req.body.artist_sn;
		var style_name = req.body.style_name;
		var style_adjective = req.body.style_adjective;
		var style_digital = req.body.style_digital;
		var style_category = req.body.style_category;
		var style_description = req.body.style_description;
		var style_onesketch = req.body.style_onesketch;
		var style_onepointcolor = req.body.style_onepointcolor;
		var style_onecolor = req.body.style_onecolor;
		var style_onefullsketch = req.body.style_onefullsketch;
		var style_onefullpointcolor = req.body.style_onefullpointcolor;
		var style_onefullcolor = req.body.style_onefullcolor;
		var style_add1p = req.body.style_add1p / 100;
		var style_add2p = req.body.style_add2p / 100;
		var style_add3p = req.body.style_add3p / 100;
		var style_a0 = req.body.style_a0;
		var style_a1 = req.body.style_a1;
		var style_a2 = req.body.style_a2;
		var datas = [];

		// 마지막 스타일 일련번호 얻기
		manage.getnewstylesn(function (err, results) {
			if (results == undefined || results == null || results.length == 0) {
				number = 1;
				util.leadingZeros(number, 8, function (tempnum) {
					style_sn = "chms" + tempnum;
					var upfile = req.files.upfile;
					var exti = upfile.name.lastIndexOf('.');
					var extv = upfile.name.substring(exti);

					if (upfile.originalFilename == '') {		// 선택한 파일이 없을 때
						// console.log("선택한 파일이 없음");
						// res.json({ result : 'fail', msg : 'upfile' });
						fs.unlinkSync(upfile.path);
					}
					else if (extv != '.jpg' && extv != '.jpeg' && extv != '.png' && extv != '.bmp') {
						// res.json({ result : 'fail', msg : 'upfile' });
						fs.unlinkSync(upfile.path);
					} else {
						var coverfolder = path.resolve(__dirname, '..', 'public', 'imgs', 'cover');
						var publicsrcpath = "http://www.caricaturemakie.com/chm/imgs/cover/";
						// console.log('profilefolder', profilefolder);
						if (!fs.existsSync(coverfolder)) {		// 폴더가 없으면 만듦
							fs.mkdirSync(coverfolder);
						}
						var name = style_sn + extv;
						publicsrcpath += name;
						var srcpath = upfile.path;
						var destpath = path.resolve(coverfolder, name);
						var is = fs.createReadStream(srcpath);
						var os = fs.createWriteStream(destpath);
						is.pipe(os);
						is.on('end', function () {
							fs.unlinkSync(upfile.path);
							var upfile2 = req.files.upfile2;
							var exti2 = upfile2.name.lastIndexOf('.');
							var extv2 = upfile2.name.substring(exti2);
							var publicsrcpath2 = "http://www.caricaturemakie.com/chm/imgs/cover/";
							var name2 = style_sn + "_noframe" + extv2;
							publicsrcpath2 += name2;
							var srcpath2 = upfile2.path;
							var destpath2 = path.resolve(coverfolder, name2);
							var is2 = fs.createReadStream(srcpath2);
							var os2 = fs.createWriteStream(destpath2);
							is2.pipe(os2);
							is2.on('end', function() {
								fs.unlinkSync(upfile2.path);
								datas.push(style_sn);
								datas.push(artist_sn);
								datas.push(style_name);
								datas.push(style_adjective);
								datas.push(style_category);
								datas.push(style_onesketch);
								datas.push(style_onepointcolor);
								datas.push(style_onecolor);
								datas.push(style_onefullsketch);
								datas.push(style_onefullpointcolor);
								datas.push(style_onefullcolor);
								datas.push(publicsrcpath);
								datas.push(publicsrcpath2);
								datas.push(style_description);
								datas.push(style_a0);
								datas.push(style_a1);
								datas.push(style_a2);
								datas.push(style_add1p);
								datas.push(style_add2p);
								datas.push(style_add3p);
								datas.push(style_digital);

								// 스타일 추가하기
								manage.addstyle(datas, function (err, result) {
									if (result.affectedRows == 1) {
										res.send('<script>alert("정상적으로 스타일이 추가되었습니다.");location.replace("/chm/manage/style/list");</script>');
									} else {
										res.send('<script>alert("서버 쪽에서 문제가 발생하였습니다. 관리자에게 문의해주세요.");location.replace("/chm/manage/style/list");</script>');
									}
								});
							});
						});
					}
				});
			} else {
				// 스타일 일련번호 생성
				number = parseInt(results[0].style_sn.substring(4, 12)) + 1;
				util.leadingZeros(number, 8, function (tempnum) {
					style_sn = "chms" + tempnum;
					var upfile = req.files.upfile;
					var exti = upfile.name.lastIndexOf('.');
					var extv = upfile.name.substring(exti);
					if (upfile.originalFilename == '') {		// 선택한 파일이 없을 때
						// console.log("선택한 파일이 없음");
						// res.json({ result : 'fail', msg : 'upfile' });
						fs.unlinkSync(upfile.path);
					}
					else if (extv != '.jpg' && extv != '.jpeg' && extv != '.png' && extv != '.bmp') {
						// res.json({ result : 'fail', msg : 'upfile' });
						fs.unlinkSync(upfile.path);
					} else {
						var coverfolder = path.resolve(__dirname, '..', 'public', 'imgs', 'cover');
						var publicsrcpath = "http://www.caricaturemakie.com/chm/imgs/cover/";
						// console.log('profilefolder', profilefolder);
						if (!fs.existsSync(coverfolder)) {		// 폴더가 없으면 만듦
							fs.mkdirSync(coverfolder);
						}
						var name = style_sn + extv;
						publicsrcpath += name;
						var srcpath = upfile.path;
						var destpath = path.resolve(coverfolder, name);
						var is = fs.createReadStream(srcpath);
						var os = fs.createWriteStream(destpath);
						is.pipe(os);
						is.on('end', function () {
							fs.unlinkSync(upfile.path);
							var upfile2 = req.files.upfile2;
							var exti2 = upfile2.name.lastIndexOf('.');
							var extv2 = upfile2.name.substring(exti2);
							var publicsrcpath2 = "http://www.caricaturemakie.com/chm/imgs/cover/";
							var name2 = style_sn + "_noframe" + extv2;
							publicsrcpath2 += name2;
							var srcpath2 = upfile2.path;
							var destpath2 = path.resolve(coverfolder, name2);
							var is2 = fs.createReadStream(srcpath2);
							var os2 = fs.createWriteStream(destpath2);
							is2.pipe(os2);
							is2.on('end', function() {
								fs.unlinkSync(upfile2.path);
								datas.push(style_sn);
								datas.push(artist_sn);
								datas.push(style_name);
								datas.push(style_adjective);
								datas.push(style_category);
								datas.push(style_onesketch);
								datas.push(style_onepointcolor);
								datas.push(style_onecolor);
								datas.push(style_onefullsketch);
								datas.push(style_onefullpointcolor);
								datas.push(style_onefullcolor);
								datas.push(publicsrcpath);
								datas.push(publicsrcpath2);
								datas.push(style_description);
								datas.push(style_a0);
								datas.push(style_a1);
								datas.push(style_a2);
								datas.push(style_add1p);
								datas.push(style_add2p);
								datas.push(style_add3p);
								datas.push(style_digital);
								// 스타일 추가하기
								manage.addstyle(datas, function (err, result) {
									if (result.affectedRows == 1) {
										res.send('<script>alert("정상적으로 스타일이 추가되었습니다.");location.replace("/chm/manage/style/list");</script>');
									} else {
										res.send('<script>alert("서버 쪽에서 문제가 발생하였습니다. 관리자에게 문의해주세요.");location.replace("/chm/manage/style/list");</script>');
									}
								});
							});
						});
					}
				});
			}
		});
	} catch (err) {
		console.error(err);
	}
};


// 스타일 커버 수정하기
exports.updateStyleCover = function (req, res) {
	try {
		// console.log(req.files);
		var style_sn = req.body.sn;
		var upfile = req.files.upfile;
		var upfile2 = req.files.upfile2;
		var exti = upfile.name.lastIndexOf('.');
		var extv = upfile.name.substring(exti);
		var exti2 = upfile2.name.lastIndexOf('.');
		var extv2 = upfile2.name.substring(exti2);
		var publicsrcpath = "http://www.caricaturemakie.com/chm/imgs/cover/";
		var publicsrcpath2 = "http://www.caricaturemakie.com/chm/imgs/cover/";
		var name = style_sn + extv;
		publicsrcpath += name;
		var name2 = style_sn + "_noframe" + extv2;
		publicsrcpath2 += name2;

		if (upfile.originalFilename == '' && upfile2.originalFilename == '') {		// 선택한 파일이 없을 때
			// console.log("선택한 파일이 없음");
			// res.json({ result : 'fail', msg : 'upfile' });
			if (fs.existsSync(upfile.path)) {
				fs.unlinkSync(upfile.path);
			}
			if (fs.existsSync(upfile2.path)) {
				fs.unlinkSync(upfile2.path);
			}
			res.send('<script>alert("파일이 선택되지 않았습니다.");history.back();</script>');
			return;
		} else if (extv != '.jpg' && extv != '.jpeg' && extv != '.png' && extv != '.bmp' && upfile.originalFilename != '') {
			// res.json({ result : 'fail', msg : 'upfile' });
			if (fs.existsSync(upfile.path)) {
				fs.unlinkSync(upfile.path);
			}
			if (fs.existsSync(upfile2.path)) {
				fs.unlinkSync(upfile2.path);
			}
			res.send('<script>alert("파일의 확장자는 jpg, jpeg, png, bmp만 됩니다.");history.back();</script>');
			return;
		} else if (extv2 != '.jpg' && extv2 != '.jpeg' && extv2 != '.png' && extv2 != '.bmp' && upfile2.originalFilename != '') {
			// res.json({ result : 'fail', msg : 'upfile' });
			if (fs.existsSync(upfile.path)) {
				fs.unlinkSync(upfile.path);
			}
			if (fs.existsSync(upfile2.path)) {
				fs.unlinkSync(upfile2.path);
			}
			res.send('<script>alert("파일의 확장자는 jpg, jpeg, png, bmp만 됩니다.");history.back();</script>');
			return;
		} else {
			var coverfolder = path.resolve(__dirname, '..', 'public', 'imgs', 'cover');
			// console.log('profilefolder', profilefolder);
			if (!fs.existsSync(coverfolder)) {		// 폴더가 없으면 만듦
				fs.mkdirSync(coverfolder);
			}

			if (upfile.originalFilename != '') {
				var name = style_sn + extv;
				var srcpath = upfile.path;
				var destpath = path.resolve(coverfolder, name);
				var is = fs.createReadStream(srcpath);
				var os = fs.createWriteStream(destpath);
				is.pipe(os);
				is.on('end', function () {
					if (upfile2.originalFilename != '') {
						var name2 = style_sn + '_noframe' + extv2;
						var srcpath2 = upfile2.path;
						var destpath2 = path.resolve(coverfolder, name2);
						var is2 = fs.createReadStream(srcpath2);
						var os2 = fs.createWriteStream(destpath2);
						is2.pipe(os2);
						is2.on('end', function () {
							if (fs.existsSync(upfile.path)) {
								fs.unlinkSync(upfile.path);
							}
							if (fs.existsSync(upfile2.path)) {
								fs.unlinkSync(upfile2.path);
							}
							// 스타일 정보 얻기
							manage.getstyleinfo(style_sn, function (err, results) {
								if (err) console.error(err);
								if (results[0] != undefined) {
									if (path.basename(results[0].style_cover) != path.basename(publicsrcpath) && path.basename(results[0].style_cover_noframe) != path.basename(publicsrcpath2)) {
										var delfilepath = path.resolve(coverfolder, path.basename(results[0].style_cover));
										var delfilepath2 = path.resolve(coverfolder, path.basename(results[0].style_cover_noframe));
										fs.unlinkSync(delfilepath);
										fs.unlinkSync(delfilepath2);
										var data = [publicsrcpath, publicsrcpath2, style_sn];
										// 스타일 커버 전부 업데이트
										manage.updatestylecoverall(data, function (err, result) {
											if (result.affectedRows == 1) {
												res.send('<script>alert("정상적으로 스타일 커버가 변경되었습니다.");location.replace("/chm/manage/style/info?sn=' + style_sn +'");</script>');
												return;
											}
										});
									} else if (path.basename(results[0].style_cover) != path.basename(publicsrcpath)) {
										var delfilepath = path.resolve(coverfolder, path.basename(results[0].style_cover));
										fs.unlinkSync(delfilepath);
										var data = [publicsrcpath, style_sn];
										// 스타일 커버 (앱) 업데이트
										manage.updatestylecoverapp(data, function (err, result) {
											if (result.affectedRows == 1) {
												res.send('<script>alert("정상적으로 스타일 커버가 변경되었습니다.");location.replace("/chm/manage/style/info?sn=' + style_sn +'");</script>');
												return;
											}
										});
									} else if (path.basename(results[0].style_cover_noframe) != path.basename(publicsrcpath2)) {
										var delfilepath = path.resolve(coverfolder, path.basename(results[0].style_cover_noframe));
										fs.unlinkSync(delfilepath);
										var data = [publicsrcpath2, style_sn];
										// 스타일 커버 (웹) 업데이트
										manage.updatestylecoverweb(data, function (err, result) {
											if (result.affectedRows == 1) {
												res.send('<script>alert("정상적으로 스타일 커버가 변경되었습니다.");location.replace("/chm/manage/style/info?sn=' + style_sn +'");</script>');
												return;
											}
										});
									} else {
										res.send('<script>alert("정상적으로 스타일 커버가 변경되었습니다.");location.replace("/chm/manage/style/info?sn=' + style_sn +'");</script>');
										return;
									}
								}
							});
						});
					} else {
						// 스타일 정보 얻기
						manage.getstyleinfo(style_sn, function (err, results) {
							if (err) console.error(err);
							if (results[0] != undefined) {
								if (path.basename(results[0].style_cover) != path.basename(publicsrcpath)) {
									var delfilepath = path.resolve(coverfolder, path.basename(results[0].style_cover));
									fs.unlinkSync(delfilepath);
									var data = [publicsrcpath, style_sn];
									// 스타일 커버 (앱) 업데이트
									manage.updatestylecoverapp(data, function (err, result) {
										if (result.affectedRows == 1) {
											res.send('<script>alert("정상적으로 스타일 커버가 변경되었습니다.");location.replace("/chm/manage/style/info?sn=' + style_sn +'");</script>');
											return;
										}
										else {
											res.send('<script>alert("정상적으로 스타일 커버가 변경되었습니다.");location.replace("/chm/manage/style/info?sn=' + style_sn +'");</script>');
											return;
										}
									});
								} else {
									res.send('<script>alert("정상적으로 스타일 커버가 변경되었습니다.");location.replace("/chm/manage/style/info?sn=' + style_sn +'");</script>');
									return;
								}
							}
						});
					}
				});
			} else {
				var name2 = style_sn + '_noframe' + extv2;
				var srcpath2 = upfile2.path;
				var destpath2 = path.resolve(coverfolder, name2);
				var is2 = fs.createReadStream(srcpath2);
				var os2 = fs.createWriteStream(destpath2);
				is2.pipe(os2);
				is2.on('end', function () {
					if (fs.existsSync(upfile.path)) {
						fs.unlinkSync(upfile.path);
					}
					if (fs.existsSync(upfile2.path)) {
						fs.unlinkSync(upfile2.path);
					}
					// 스타일 정보 얻기
					manage.getstyleinfo(style_sn, function (err, results) {
						if (err) console.error(err);
						if (results[0] != undefined) {
							if (path.basename(results[0].style_cover_noframe) != path.basename(publicsrcpath2)) {
								var delfilepath = path.resolve(coverfolder, path.basename(results[0].style_cover_noframe));
								fs.unlinkSync(delfilepath);
								var data = [publicsrcpath2, style_sn];
								// 스타일 커버 (웹) 업데이트
								manage.updatestylecoverweb(data, function (err, result) {
									if (result.affectedRows == 1) {
										res.send('<script>alert("정상적으로 스타일 커버가 변경되었습니다.");location.replace("/chm/manage/style/info?sn=' + style_sn +'");</script>');
										return;
									} else {
										res.send('<script>alert("정상적으로 스타일 커버가 변경되었습니다.");location.replace("/chm/manage/style/info?sn=' + style_sn +'");</script>');
										return;
									}
								});
							} else {
								res.send('<script>alert("정상적으로 스타일 커버가 변경되었습니다.");location.replace("/chm/manage/style/info?sn=' + style_sn +'");</script>');
								return;
							}
						}
					});
				});
			}
		}
	} catch (err) {
		console.error(err);
	}
};


// 작가 정보 수정하기
exports.updateStyleInfo = function (req, res) {
	try {
		// console.log(req.body);
		var style_sn = req.body.sn;
		var style_name = req.body.style_name;
		var style_adjective = req.body.style_adjective;
		var style_digital = req.body.style_digital;
		var style_onesketch = req.body.style_onesketch;
		var style_onepointcolor = req.body.style_onepointcolor;
		var style_onecolor = req.body.style_onecolor;
		var style_onefullsketch = req.body.style_onefullsketch;
		var style_onefullpointcolor = req.body.style_onefullpointcolor;
		var style_onefullcolor = req.body.style_onefullcolor;
		var style_description = req.body.style_description;
		var style_add1p = req.body.style_add1p;
		var style_add2p = req.body.style_add2p;
		var style_add3p = req.body.style_add3p;
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
		datas.push(style_adjective);
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
		datas.push(style_digital);
		datas.push(style_sn);

		// 스타일 정보 업데이트 하기
		manage.updatestyleinfo(datas, function (err, result) {
			if (err) console.error(err);
			if (result.affectedRows == 1) {
				res.send('<script>alert("정상적으로 스타일 정보가 변경되었습니다.");location.replace("/chm/manage/style/info?sn=' + style_sn +'");</script>');
			} else {
				res.send('<script>alert("업데이트된 스타일 정보가 없습니다.");location.replace("/chm/manage/style/info?sn=' + style_sn +'");</script>');
			}
		});
	} catch (err) {
		console.error(err);
	}
};

// 스타일 삭제하기
exports.deleteStyle = function (req, res) {
	try {
		var style_sn = req.body.sn;
		manage.getstyleinfo(style_sn, function (err, results) {
			if (results != undefined && results[0] != undefined) {
				var exti = results[0].style_cover.lastIndexOf('.');
				var extv = results[0].style_cover.substring(exti);
				var exti2 = results[0].style_cover_noframe.lastIndexOf('.');
				var extv2 = results[0].style_cover_noframe.substring(exti2);
				var coverpath = path.resolve(__dirname, '..', 'public', 'imgs', 'cover', style_sn + extv);
				var coverpath2 = path.resolve(__dirname, '..', 'public', 'imgs', 'cover', style_sn + '_noframe' + extv2);

				if (fs.existsSync(coverpath)) {
					fs.unlinkSync(coverpath);
				}

				if (fs.existsSync(coverpath2)) {
					fs.unlinkSync(coverpath2);
				}

				// 스타일 포트폴리오 경로 얻기
				manage.getstyleportpaths(style_sn, function (err, gresults) {
					async.each(gresults, function (item, callback) {
						var styleportspath = path.resolve(__dirname, '..', 'public', 'imgs', 'ports', 'style', style_sn, path.basename(item.style_port));
						if (fs.existsSync(styleportspath)) {
							fs.unlinkSync(styleportspath);
						}
						callback();
					});

					// var artistportsfolder = path.resolve(__dirname, '..', 'public', 'imgs', 'ports', 'artist', artist_sn);
					// if (fs.existsSync(artistportsfolder)) {
					// 	fs.unlinkSync(artistportsfolder);
					// }

					// 스타일 삭제
					manage.deletestyle(style_sn, function (err, result) {
						if (err) console.error(err);
						if (result.affectedRows == 1) {
							// 스타일 포트폴리오 삭제
							manage.delstyleports(style_sn, function (err, presult) {
								if (err) console.error(err);
								res.send('<script>alert("정상적으로 스타일이 삭제되었습니다.");location.replace("/chm/manage/style/list");</script>');
							});
						} else {
							res.send('<script>alert("스타일이 존재하지 않습니다.");location.replace("/chm/manage/style/list");</script>');
						}
					});
				});
			} else {
				res.send('<script>alert("스타일이 존재하지 않습니다.");location.replace("/chm/manage/style/list");</script>');
			}
		});
	} catch (err) {
		console.error(err);
	}
};

// 스타일 포트폴리오 관련
// 스타일 포트폴리오 추가하기
exports.addStylePort = function (req, res) {
	try {
		var style_sn = req.body.style_sn;
		var upfile = req.files.upfile;
		var exti = upfile.name.lastIndexOf('.');
		var extv = upfile.name.substring(exti);
		var datas = [];

		if (upfile.originalFilename == '') {		// 선택한 파일이 없을 때
			// console.log("선택한 파일이 없음");
			// res.json({ result : 'fail', msg : 'upfile' });
			fs.unlinkSync(upfile.path);
			res.send('<script>alert("파일이 선택되지 않았습니다.");history.back();</script>');
		}
		else if (extv != '.jpg' && extv != '.jpeg' && extv != '.png' && extv != '.bmp') {
			// res.json({ result : 'fail', msg : 'upfile' });
			fs.unlinkSync(upfile.path);
			res.send('<script>alert("파일의 확장자는 jpg, jpeg, png, bmp만 됩니다.");history.back();</script>');
		} else {
			var styleportsfolder = path.resolve(__dirname, '..', 'public', 'imgs', 'ports', 'style', style_sn);
			var publicsrcpath = "http://www.caricaturemakie.com/chm/imgs/ports/style/" + style_sn + "/";
			// console.log('profilefolder', profilefolder);
			if (!fs.existsSync(styleportsfolder)) {		// 폴더가 없으면 만듦
				fs.mkdirSync(styleportsfolder);
			}
			var name = upfile.originalFilename;
			publicsrcpath += name;
			var srcpath = upfile.path;
			var destpath = path.resolve(styleportsfolder, name);
			var is = fs.createReadStream(srcpath);
			var os = fs.createWriteStream(destpath);
			is.pipe(os);
			is.on('end', function () {
				fs.unlinkSync(upfile.path);
				datas.push(style_sn);
				datas.push(publicsrcpath);
				// 스타일 포트폴리오 추가하기
				manage.addstyleport(datas, function (err, result) {
					if (err) console.error(err);
					if (result.affectedRows == 1) {
						res.send('<script>alert("정상적으로 스타일 포트폴리오가 등록되었습니다.");location.replace("/chm/manage/style/port/list?sn=' + style_sn +'");</script>');
					} else {
						res.send('<script>alert("스타일 포트폴리오 등록에 실패했습니다.");location.replace("/chm/manage/style/port/list?sn=' + style_sn +'");</script>');
					}
				});
			});
		}
	} catch (err) {
		console.error(err);
	}
};

// 스타일 포트폴리오 삭제하기
exports.delStylePort = function (req, res) {
	try {
		// console.log(req.body);
		var style_info_sn = req.body.sn;
		var style_sn = req.body.style_sn;

		// 스타일 포트폴리오 경로 얻기
		manage.getstyleportpath(style_info_sn, function (err, results) {
			if (results[0] == undefined) {
				res.send('<script>alert("존재하지 않는 포트폴리오입니다.");location.replace("/chm/manage/style/port/list?sn=' + style_sn +'");</script>');
				return;
			}
			var styleportspath = path.resolve(__dirname, '..', 'public', 'imgs', 'ports', 'style', results[0].style_sn, path.basename(results[0].style_port));
			if (fs.existsSync(styleportspath)) {
				fs.unlinkSync(styleportspath);
			}
			// 스타일 포트폴리오 삭제하기
			manage.delstyleport(style_info_sn, function (err, result) {
				if (result.affectedRows == 1) {
					res.send('<script>alert("정상적으로 스타일 포트폴리오가 삭제되었습니다.");location.replace("/chm/manage/style/port/list?sn=' + style_sn +'");</script>');
				} else {
					res.send('<script>alert("존재하지 않는 포트폴리오입니다.");location.replace("/chm/manage/style/port/list?sn=' + style_sn +'");</script>');
				}
			});
		});
	} catch (err) {
		console.error(err);
	}
};

// 상품 정보 관련
// 상품 추가하기
exports.addGoods = function (req, res) {
	try {
		var goods_sn = '';
		var goods_name = req.body.goods_name;
		var goods_price = req.body.goods_price;
		var datas = [];

		// 마지막 상품 일련번호 얻기
		manage.getnewgoodssn(function (err, results) {
			if (results == undefined || results == null || results.length == 0) {
				number = 1;
				// 상품 일련번호 생성
				util.leadingZeros(number, 8, function (tempnum) {
					goods_sn = "chmg" + tempnum;
					datas.push(goods_sn);
					datas.push(goods_name);
					datas.push(goods_price);

					// 상품 추가하기
					manage.addgoods(datas, function (err, result) {
						if (result.affectedRows == 1) {
							res.send('<script>alert("정상적으로 상품이 추가되었습니다.");location.replace("/chm/manage/goods/list");</script>');
						} else {
							res.send('<script>alert("서버 쪽에서 문제가 발생하였습니다. 관리자에게 문의해주세요.");location.replace("/chm/manage/goods/list");</script>');
						}
					});
				});
			} else {
				// 상품 일련번호 생성
				number = parseInt(results[0].goods_sn.substring(4, 12)) + 1;
				util.leadingZeros(number, 8, function (tempnum) {
					goods_sn = "chmg" + tempnum;
					datas.push(goods_sn);
					datas.push(goods_name);
					datas.push(goods_price);

					// 상품 추가하기
					manage.addgoods(datas, function (err, result) {
						if (result.affectedRows == 1) {
							res.send('<script>alert("정상적으로 상품이 추가되었습니다.");location.replace("/chm/manage/goods/list");</script>');
						} else {
							res.send('<script>alert("서버 쪽에서 문제가 발생하였습니다. 관리자에게 문의해주세요.");location.replace("/chm/manage/goods/list");</script>');
						}
					});
				});
			}
		});
	} catch (err) {
		console.error(err);
	}
};

// 상품 정보 수정하기
exports.updateGoodsInfo = function (req, res) {
	try {
		var goods_sn = req.body.goods_sn;
		var goods_name = req.body.goods_name;
		var goods_price = req.body.goods_price;
		var data = [];
		data.push(goods_name);
		data.push(goods_price);
		data.push(goods_sn);
		// 상품 정보 업데이트하기
		manage.updategoodsinfo(data, function (err, result) {
			if (err) console.error(err);
			if (result.affectedRows == 1) {
				res.send('<script>alert("정상적으로 상품 정보가 변경되었습니다.");location.replace("/chm/manage/goods/info?sn=' + goods_sn +'");</script>');
			} else {
				res.send('<script>alert("업데이트된 상품 정보가 없습니다.");location.replace("/chm/manage/goods/info?sn=' + goods_sn +'");</script>');
			}
		});
	} catch (err) {
		console.error(err);
	}
};

// 상품 삭제하기
exports.deleteGoods = function (req, res) {
	try {
		var goods_sn = req.body.sn;
		// 상품 포트폴리오 경로 얻기
		manage.getgoodsportpaths(goods_sn, function (err, gresults) {
			async.each(gresults, function (item, callback) {
				var goodsportspath = path.resolve(__dirname, '..', 'public', 'imgs', 'ports', 'goods', goods_sn, path.basename(item.goods_port));
				if (fs.existsSync(goodsportspath)) {
					fs.unlinkSync(goodsportspath);
				}
				callback();
			});

			// var artistportsfolder = path.resolve(__dirname, '..', 'public', 'imgs', 'ports', 'artist', artist_sn);
			// if (fs.existsSync(artistportsfolder)) {
			// 	fs.unlinkSync(artistportsfolder);
			// }

			// 상품 삭제하기
			manage.deletegoods(goods_sn, function (err, result) {
				if (err) console.error(err);
				if (result.affectedRows == 1) {
					// 상품 포트폴리오 삭제하기
					manage.delgoodsports(goods_sn, function (err, presult) {
						if (err) console.error(err);
						// 상품 옵션 삭제하기
						manage.deletegoodsoptions(goods_sn, function (err, dgresult) {
							if (err) console.error(err);
							res.send('<script>alert("정상적으로 상품이 삭제되었습니다.");location.replace("/chm/manage/style/list");</script>');
						});
					});
				} else {
					res.send('<script>alert("해당 상품이 존재하지 않습니다.");location.replace("/chm/manage/style/list");</script>');
				}
			});
		});
	} catch (err) {
		console.error(err);
	}
};

// 상품 포트폴리오 관련
// 상품 포트폴리오 추가하기
exports.addGoodsPort = function (req, res) {
	try {
		// console.log(req.body);
		// console.log(req.files);
		var goods_sn = req.body.goods_sn;
		var upfile = req.files.upfile;
		var exti = upfile.name.lastIndexOf('.');
		var extv = upfile.name.substring(exti);
		var datas = [];

		if (upfile.originalFilename == '') {		// 선택한 파일이 없을 때
			// console.log("선택한 파일이 없음");
			// res.json({ result : 'fail', msg : 'upfile' });
			fs.unlinkSync(upfile.path);
			res.send('<script>alert("파일이 선택되지 않았습니다.");history.back();</script>');
		}
		else if (extv != '.jpg' && extv != '.jpeg' && extv != '.png' && extv != '.bmp') {
			// res.json({ result : 'fail', msg : 'upfile' });
			fs.unlinkSync(upfile.path);
			res.send('<script>alert("파일의 확장자는 jpg, jpeg, png, bmp만 됩니다.");history.back();</script>');
		} else {
			var goodsportsfolder = path.resolve(__dirname, '..', 'public', 'imgs', 'ports', 'goods', goods_sn);
			var publicsrcpath = "http://www.caricaturemakie.com/chm/imgs/ports/goods/" + goods_sn + "/";
			// console.log('profilefolder', profilefolder);
			if (!fs.existsSync(goodsportsfolder)) {		// 폴더가 없으면 만듦
				fs.mkdirSync(goodsportsfolder);
			}
			var name = upfile.originalFilename;
			publicsrcpath += name;
			var srcpath = upfile.path;
			var destpath = path.resolve(goodsportsfolder, name);
			var is = fs.createReadStream(srcpath);
			var os = fs.createWriteStream(destpath);
			is.pipe(os);
			is.on('end', function () {
				fs.unlinkSync(upfile.path);
				datas.push(goods_sn);
				datas.push(publicsrcpath);

				// 상품 포트폴리오 추가하기
				manage.addgoodsport(datas, function (err, result) {
					if (err) console.error(err);
					if (result.affectedRows == 1) {
						res.send('<script>alert("정상적으로 상품 포트폴리오가 등록되었습니다.");location.replace("/chm/manage/goods/port/list?sn=' + goods_sn +'");</script>');
					} else {
						res.send('<script>alert("상품 포트폴리오 등록에 실패했습니다.");location.replace("/chm/manage/goods/port/list?sn=' + goods_sn +'");</script>');
					}
				});
			});
		}
	} catch (err) {
		console.error(err);
	}
};

// 상품 포트폴리오 삭제하기
exports.delGoodsPort = function (req, res) {
	try {
		// console.log(req.body);
		var goods_info_sn = req.body.sn;
		var goods_sn = req.body.goods_sn;

		// 상품 포트폴리오 경로 얻기
		manage.getgoodsportpath(goods_info_sn, function (err, results) {
			if (results[0] == undefined) {
				res.send('<script>alert("존재하지 않는 상품 포트폴리오입니다.");location.replace("/chm/manage/goods/port/list?sn=' + goods_sn +'");</script>');
				return;
			}
			var goodsportsfolder = path.resolve(__dirname, '..', 'public', 'imgs', 'ports', 'goods', results[0].goods_sn, path.basename(results[0].goods_port));
			if (fs.existsSync(goodsportsfolder)) {
				fs.unlinkSync(goodsportsfolder);
			}

			// 상품 포트폴리오 삭제하기
			manage.delgoodsport(goods_info_sn, function (err, result) {
				if (result.affectedRows == 1) {
					res.send('<script>alert("정상적으로 상품 포트폴리오가 삭제되었습니다.");location.replace("/chm/manage/goods/port/list?sn=' + goods_sn +'");</script>');
				} else {
					res.send('<script>alert("존재하지 않는 상품 포트폴리오입니다.");location.replace("/chm/manage/goods/port/list?sn=' + goods_sn +'");</script>');
				}
			});
		});
	} catch (err) {
		console.error(err);
	}
};

// 상품 옵션 관련
// 상품 옵션 리스트
exports.getGoodsOption = function (req, res) {
	try {
		var goods_sn = req.body.goods_sn;
		// console.log(req.body);
		// 상품 옵션 리스트 얻기
		manage.getgoodsoptionlist(goods_sn, function (err, results) {
			// console.log(results);
			res.json({ data: results });
		});
	} catch (err) {
		console.error(err);
	}
};

// 상품 옵션 업데이트하기
exports.updateGoodsOption = function (req, res) {
	try {
		// console.log(req.body);
		var goods_sn = req.body.goods_sn;
		var goods_option = req.body.goods_option;
		var artist_sn = req.body.artist_sn;
		var goods_option_del = req.body.goods_option_del;
		async.each(goods_option, function (item, callback) {
			if (item.sn == 0) {
				var data = [];
				data.push(goods_sn);
				data.push(item.goods_option_name);
				data.push(item.goods_option_price);
				data.push(item.artist_sn);
				// 상품 옵션 추가하기(웹 상에서 추가된 것)
				manage.addgoodsoption(data, function (err, result) {
					if (result.affectedRows == 1) {
						// console.log('추가 완료');
					} else {
						// console.log('추가 실패');
					}
					callback();
				});
			}
		});

		async.each(goods_option_del, function (item, callback) {
			// 상품 옵션 삭제하기(웹상에서 지워진 것)
			manage.deletegoodsoption(item, function (err, result) {
				if (result.affectedRows == 1) {
					// console.log('삭제 완료');
				} else {
					// console.log('삭제 실패');
				}
				callback();
			});
		});
		res.json({ result: 'success' });
	} catch (err) {
		console.error(err);
	}
};

// 문의 관리
// 문의에 대한 답변하기
exports.answerContact = function (req, res) {
	try {
		var contact_sn = req.body.contact_sn;
		var contact_answer = req.body.contact_answer;
		var data = [contact_answer, contact_sn];
		// 문의 사항 답변하기
		manage.answercontact(data, function (err, result) {
			if (err) console.error(err);
			// console.log(result);
			// 문의 사항 정보 얻기
			manage.showcontactinfo(contact_sn, function (err, sresult) {
				if (err) console.error(err);
				// 문의 사항 질문자 GCM 얻기
				manage.getregistid(sresult[0].contact_user_sn, function (err, gresult) {
					if (err) console.error(err);
					if (gresult[0].user_registID == undefined) {
						res.send('<script>alert("정상적으로 질문에 답변하셨습니다. 하지만 GCM 전송에 실패했습니다.");location.replace("/chm/manage/contact/list");</script>');
						return;
					}
					var gcmcustomer = gresult[0].user_registID;

					var message = new gcm.Message();
					var sender = new gcm.Sender('AIzaSyBD9Y9gdb82fAJBaPjXHf3iiGM0L8B3zIo');

					message.addData('msg', '질문하신 부분에 대해 답변이 도착했습니다.');
					message.collapseKey = 'omybrand';
					message.delayWhileIdle = true;
					message.timeToLive = 3;
					sender.send(message, [gcmcustomer], 4, function (err, gcmresult) {
						if (err) {
							res.send('<script>alert("정상적으로 질문에 답변하셨습니다. 하지만 GCM 전송에 실패했습니다.");location.replace("/chm/manage/contact/list");</script>');
						}
						else {
							res.send('<script>alert("정상적으로 질문에 답변하셨습니다.");location.replace("/chm/manage/contact/list");</script>');
						}
						// console.log('result', gcmresult);
					});
				});
			});
		});
	} catch (err) {
		console.error(err);
	}
};

// 유저 관련
// 블랙리스트 보여주기
exports.showBlackList = function (req, res) {
	try {

	} catch (err) {
		console.error(err);
	}
};

// 로그인 실패 리스트 보여주기
exports.showFailList = function (req, res) {
	try {

	} catch (err) {
		console.error(err);
	}
};

// 로그인 실패 초기화
exports.clearLog = function (req, res) {
	try {

	} catch (err) {
		console.error(err);
	}
};

// 앱 관련
// 작가 공지사항 관련
// 작가 공지사항 리스트
exports.showNotice_a = function (req, res) {
	try {
		// 작가 공지사항 리스트 얻기
		manage.shownotice_alist(function (err, results) {
			if (err) console.error(err);
			res.json({ results : results });
		});
	} catch (err) {
		console.error(err);
	}
};

// 작가 공지사항 추가하기
exports.addNotice_a = function (req, res) {
	try {
		// console.log(req.body);
		var date = new Date(req.body.date);
		var title = req.body.title;
		var content = req.body.content;
		var data = [title, date, content];
		// 작가 공지사항 추가하기
		manage.addnotice_a(data, function (err, result) {
			if (err) console.error(err);
			if (result.affectedRows == 1) {
				res.send('<script>alert("성공적으로 작가 공지사항을 등록하였습니다.");location.replace("/chm/manage/notice_a");</script>');
			} else {
				res.send('<script>alert("등록에 실패했습니다. 관리자에게 문의해주시기 바랍니다.");</script>');
			}
		});
	} catch (err) {
		console.error(err);
	}
};

// 작가 공지사항 수정하기
exports.updateNotice_a = function (req, res) {
	try {
		var date = new Date(req.body.date);
		var title = req.body.title;
		var content = req.body.content;
		var sn = req.body.sn;
		var data = [title, date, content, sn];
		// 작가 공지사항 업데이트하기
		manage.updatenotice_a(data, function (err, result) {
			if (err) console.error(err);
			if (result.affectedRows == 1) {
				res.send('<script>alert("성공적으로 작가 공지사항을 수정하였습니다.");location.replace("/chm/manage/notice_a");</script>');
			} else {
				res.send('<script>alert("수정에 실패했습니다. 관리자에게 문의해주시기 바랍니다.");</script>');
			}
		});
	} catch (err) {
		console.error(err);
	}
};

// 작가 공지사항 삭제하기
exports.deleteNotice_a = function (req, res) {
	try {
		// console.log(req.body);
		var sn = req.body.sn;

		// 작가 공지사항 삭제하기
		manage.deletenotice_a(sn, function (err, result) {
			if (err) console.error(err);
			if (result.affectedRows == 1) {
				res.send('<script>alert("성공적으로 작가 공지사항을 삭제하였습니다.");location.replace("/chm/manage/notice_a");</script>');
			} else {
				res.send('<script>alert("삭제에 실패했습니다. 관리자에게 문의해주시기 바랍니다.");</script>');
			}
		});
	} catch (err) {
		console.error(err);
	}
};

// 앱 공지사항 관련
// 앱 공지사항 리스트
exports.showNotice = function (req, res) {
	try {
		// 앱 공지사항 리스트 얻기
		manage.shownoticelist(function (err, results) {
			if (err) console.error(err);
			res.json({ results : results });
		});
	} catch (err) {
		console.error(err);
	}
};

// 앱 공지사항 추가하기
exports.addNotice = function (req, res) {
	try {
		// console.log(req.body);
		var date = new Date(req.body.date);
		var title = req.body.title;
		var content = req.body.content;
		var data = [title, date, content];
		// 앱 공지사항 추가하기
		manage.addnotice(data, function (err, result) {
			if (err) console.error(err);
			if (result.affectedRows == 1) {
				res.send('<script>alert("성공적으로 앱 공지사항을 등록하였습니다.");location.replace("/chm/manage/notice");</script>');
			} else {
				res.send('<script>alert("등록에 실패했습니다. 관리자에게 문의해주시기 바랍니다.");</script>');
			}
		});
	} catch (err) {
		console.error(err);
	}
};

// 앱 공지사항 수정하기
exports.updateNotice = function (req, res) {
	try {
		var date = new Date(req.body.date);
		var title = req.body.title;
		var content = req.body.content;
		var sn = req.body.sn;
		var data = [title, date, content, sn];
		// 앱 공지사항 업데이트하기
		manage.updatenotice(data, function (err, result) {
			if (err) console.error(err);
			if (result.affectedRows == 1) {
				res.send('<script>alert("성공적으로 앱 공지사항을 수정하였습니다.");location.replace("/chm/manage/notice");</script>');
			} else {
				res.send('<script>alert("수정에 실패했습니다. 관리자에게 문의해주시기 바랍니다.");</script>');
			}
		});
	} catch (err) {
		console.error(err);
	}
};

// 앱 공지사항 삭제하기
exports.deleteNotice = function (req, res) {
	try {
		// console.log(req.body);
		var sn = req.body.sn;
		// 앱 공지사항 삭제하기
		manage.deletenotice(sn, function (err, result) {
			if (err) console.error(err);
			if (result.affectedRows == 1) {
				res.send('<script>alert("성공적으로 앱 공지사항을 삭제하였습니다.");location.replace("/chm/manage/notice");</script>');
			} else {
				res.send('<script>alert("삭제에 실패했습니다. 관리자에게 문의해주시기 바랍니다.");</script>');
			}
		});
	} catch (err) {
		console.error(err);
	}
};

// 앱 배너 관련
// 앱 배너 리스트
exports.showBanner = function (req, res) {
	try {
		// 배너 리스트 얻기
		manage.showbannerlist(function (err, results) {
			if (err) console.error(err);
			res.json({ results: results });
		});
	} catch (err) {
		console.error(err);
	}
};

// 앱 배너 수정
exports.updateBanner = function (req, res) {
	try {
		var sn = req.body.sn;
		var upfile = req.files.upfile;
		var link = req.body.link;
		var prepath = req.body.prepath;
		var exti = upfile.name.lastIndexOf('.');
		var extv = upfile.name.substring(exti);
		var datas =  [];

		if (upfile.originalFilename == '') {		// 선택한 파일이 없을 때
			// console.log("선택한 파일이 없음");
			// res.json({ result : 'fail', msg : 'upfile' });
			// console.log(upfile.path);
			fs.unlinkSync(upfile.path);
			datas.push(prepath);
			datas.push(link);
			datas.push(sn);
			// 배너 정보 수정하기
			manage.updatebanner(datas, function (err, result) {
				if (result.affectedRows == 1) {
					res.send('<script>alert("정상적으로 배너 정보가 수정되었습니다.");location.replace("/chm/manage/banner")</script>');
				} else {
					res.send('<script>alert("서버 쪽에서 문제가 발생하였습니다. 관리자에게 문의해주세요.");</script>');
				}
			});
		}
		else if (extv != '.jpg' && extv != '.jpeg' && extv != '.png' && extv != '.bmp') {
			// console.log(upfile.path);
			fs.unlinkSync(upfile.path);
			res.send('<script>alert("확장자는 jpg, jpeg, png, bmp 파일만 업로드 가능합니다.");location.replace("/chm/manage/banner");</script>');
		} else {
			// console.log(upfile.path);
			var bannerfolder = path.resolve(__dirname, '..', 'public', 'imgs', 'banner');
			var publicsrcpath = "http://www.caricaturemakie.com/chm/imgs/banner/";

			// console.log('profilefolder', profilefolder);
			if (!fs.existsSync(bannerfolder)) {		// 폴더가 없으면 만듦
				fs.mkdirSync(bannerfolder);
			}
			publicsrcpath += upfile.originalFilename;
			var srcpath = upfile.path;
			var destpath = path.resolve(bannerfolder, upfile.originalFilename);
			var is = fs.createReadStream(srcpath);
			var os = fs.createWriteStream(destpath);
			is.pipe(os);
			is.on('end', function () {
				fs.unlinkSync(upfile.path);
				datas.push(publicsrcpath);
				datas.push(link);
				datas.push(sn);
				// 배너 정보 수정하기
				manage.updatebanner(datas, function (err, result) {
					if (result.affectedRows == 1) {
						res.send('<script>alert("정상적으로 배너 정보가 수정되었습니다.");location.replace("/chm/manage/banner");</script>');
					} else {
						res.send('<script>alert("서버 쪽에서 문제가 발생하였습니다. 관리자에게 문의해주세요.");</script>');
					}
				});
			});
		}
	} catch (err) {
		console.error(err);
	}
};

// 앱 버전 관련
// 앱 버전 보여주기
exports.showAppInfo = function (req, res) {
	try {
		// 앱 정보 얻기
		manage.showappinfo(function (err, result) {
			if (err) console.error(err);
			res.json({ result: result });
		});
	} catch (err) {
		console.error(err);
	}
};

// 앱 버전 수정하기
exports.updateAppInfo = function (req, res) {
	try {
		var preversion = req.body.app_preversion;
		var version = req.body.app_version;
		var link = req.body.app_link;
		var update = req.body.app_update;
		var data = [version, link, update, preversion];

		// 앱 정보 수정하기
		manage.updateappinfo(data, function (err, result) {
			if (result.affectedRows == 1) {
				res.send('<script>alert("정상적으로 앱 정보가 수정되었습니다.");location.replace("/chm/manage/app");</script>');
			} else {
				res.send('<script>alert("서버 쪽에서 문제가 발생하였습니다. 관리자에게 문의해주세요.");</script>');
			}
		});
	} catch (err) {
		console.error(err);
	}
};

// 해당년월 내역 보기(관리자용 - 앱, 개인)
exports.showOrderListap = function (req, res)  {
	try {
		if (req.body.yy == null || req.body.yy == undefined || req.body.yy == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.mm == null || req.body.mm == undefined || req.body.mm == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.artist_sn == null || req.body.artist_sn == undefined || req.body.artist_sn == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

		// console.log(req.body);
		var yy = req.body.yy;
		var mm = req.body.mm;
		var artist_sn = req.body.artist_sn;
		// console.log(yy + "-" + mm);
		// 앱에서 주문한 주문 내역 얻기
		manage.showorderlistap(artist_sn, yy, mm, function (err, datas) {
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

// 해당년월 내역 보기(관리자용 - 앱, 개인)
exports.showOrderListap = function (req, res)  {
	try {
		if (req.body.yy == null || req.body.yy == undefined || req.body.yy == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.mm == null || req.body.mm == undefined || req.body.mm == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.artist_sn == null || req.body.artist_sn == undefined || req.body.artist_sn == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

		// console.log(req.body);
		var yy = req.body.yy;
		var mm = req.body.mm;
		var artist_sn = req.body.artist_sn;
		// console.log(yy + "-" + mm);

		// 앱, 개인에서 주문한 주문 내역 얻기
		manage.showorderlistap(artist_sn, yy, mm, function (err, datas) {
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

// 해당년월 내역 보기(관리자용 - 오픈마켓)
exports.showOrderListom = function (req, res)  {
	try {
		if (req.body.yy == null || req.body.yy == undefined || req.body.yy == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.mm == null || req.body.mm == undefined || req.body.mm == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

		if (req.body.artist_sn == null || req.body.artist_sn == undefined || req.body.artist_sn == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		// console.log(req.body);
		var yy = req.body.yy;
		var mm = req.body.mm;
		var artist_sn = req.body.artist_sn;
		// console.log(yy + "-" + mm);

		// 오픈 마켓에서 주문한 주문 내역 얻기
		manage.showorderlistom(artist_sn, yy, mm, function (err, datas) {
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

// 해당년월 내역 보기(관리자용 - 회사)
exports.showOrderListco = function (req, res)  {
	try {
		if (req.body.yy == null || req.body.yy == undefined || req.body.yy == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.mm == null || req.body.mm == undefined || req.body.mm == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

		if (req.body.artist_sn == null || req.body.artist_sn == undefined || req.body.artist_sn == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		// console.log(req.body);
		var yy = req.body.yy;
		var mm = req.body.mm;
		var artist_sn = req.body.artist_sn;
		// console.log(yy + "-" + mm);

		// 회사, 단체에서 주문한 주문 내역 얻기
		manage.showorderlistco(artist_sn, yy, mm, function (err, datas) {
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