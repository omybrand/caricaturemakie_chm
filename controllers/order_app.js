var config  = require('../config/config');
var order_app = require('../models/order_app');
var user = require('../models/user');
var async = require('async');
var security = require('../utility/security');
var util = require('../utility/util');
var log = require('../models/log');
var arp = require('node-arp');
var nodemailer = require('nodemailer');
var easyimage = require('easyimage');
var path = require('path');
var fs = require('fs');
var gcm = require('node-gcm');
var Cron = require('cron').CronJob;

var delinvalidjob = new Cron({
	cronTime: '00 00 00 * * *',
	onTick: function () {
		order_app.showinvalidorder(function (err, results) {
			var cnt = 0;
			async.each(results, function (data, callback) {
				if (err) console.log(err);
				if (data.order_photo != "") {
					var tempphoto = data.order_photo;
					var s = tempphoto.split("/");
					var real = false;
					var user_sn = "";
					var state = "";
					var temppath = "";
					var tempfn = "";

					for (var i in s) {
						if (real) {
							if (state == "userfolder") {
								user_sn = s[i];
								state = "filename";
							}
							temppath = temppath + "/" + s[i];

							if (state == "filename") {
								tempfn = s[i];
							}
						}

						if (s[i] == "chm") {
							real = true;
							state = "uploads";
						}
						if (s[i] == "uploads") {
							state = "userfolder";
						}
					}

					var realphotopath = path.resolve(__dirname, '..', 'uploads', user_sn, tempfn);
//					console.log(realphotopath);


					var tempthumb = data.order_thumb;
					s = tempthumb.split("/");
					real = false;
					state = "";
					temppath = "";

					for (var i in s) {
						if (real) {
							if (state == "userfolder") {
								user_sn = s[i];
								state = "filename";
							}
							temppath = temppath + "/" + s[i];

							if (state == "filename") {
								tempfn = s[i];
							}
						}
						if (s[i] == "chm") {
							real = true;
							state = "uploads";
						}
						if (s[i] == "uploads") {
							state = "userfolder";
						}
					}

					var realthumbpath = path.resolve(__dirname, '..', 'uploads', user_sn, tempfn);
					// console.log(realthumbpath);

					order_app.delinvalidorder(data.order_sn, function (err, result) {
						// console.log('chmorderlist pool에 들어왔숑~');
						if(err){
							// res.json({result: "fail", msg: err});
							// callback(err);
						} else if (result.affectedRows == 0) {
							// res.json({ result: "fail", msg: "no order" })
							// callback();
						} else {
							// res.json({ result: "success", msg: "" });
							// callback();
							if (fs.existsSync(realphotopath)) {
								fs.unlinkSync(realphotopath);
							}
							if (fs.existsSync(realthumbpath)) {
								fs.unlinkSync(realthumbpath);
							}
							cnt++;
							// console.log("정리됨");
						}
					});
				} else {
					order_app.delinvalidorder(data.order_sn, function (err, result) {
						// console.log('chmorderlist pool에 들어왔숑~');
						if(err){
							// res.json({result: "fail", msg: err});
							// callback(err);
						} else if (result.affectedRows == 0) {
							// res.json({ result: "fail", msg: "no order" })
							// callback();
						} else {
							// res.json({ result: "success", msg: "" });
							// callback();
							if (fs.existsSync(realphotopath)) {
								fs.unlinkSync(realphotopath);
							}
							if (fs.existsSync(realthumbpath)) {
								fs.unlinkSync(realthumbpath);
							}
							cnt++;
							// console.log("정리됨");
						}
					});
				}
				callback();
			});
		});
	},
	start: false
});


var delcompletejob = new Cron({
	cronTime: '00 00 00 * * *',
	onTick: function () {
		order_app.showcompleteorder(function (err, results) {
			var cnt = 0;
			async.each(results, function (data, callback) {
				if (err) console.log(err);
				if (data.order_photo != "") {
					var tempphoto = data.order_photo;
					var s = tempphoto.split("/");
					var real = false;
					var user_sn = "";
					var state = "";
					var temppath = "";
					var tempfn = "";

					for (var i in s) {
						if (real) {
							if (state == "userfolder") {
								user_sn = s[i];
								state = "filename";
							}
							temppath = temppath + "/" + s[i];

							if (state == "filename") {
								tempfn = s[i];
							}
						}

						if (s[i] == "chm") {
							real = true;
							state = "uploads";
						}
						if (s[i] == "uploads") {
							state = "userfolder";
						}
					}

					var realphotopath = path.resolve(__dirname, '..', 'uploads', user_sn, tempfn);
					// console.log(realphotopath);
					if (fs.existsSync(realphotopath)) {
						fs.unlinkSync(realphotopath);
					}

					var tempthumb = data.order_thumb;
					s = tempthumb.split("/");
					real = false;
					state = "";
					temppath = "";

					for (var i in s) {
						if (real) {
							if (state == "userfolder") {
								user_sn = s[i];
								state = "filename";
							}
							temppath = temppath + "/" + s[i];

							if (state == "filename") {
								tempfn = s[i];
							}
						}
						if (s[i] == "chm") {
							real = true;
							state = "uploads";
						}
						if (s[i] == "uploads") {
							state = "userfolder";
						}
					}

					var realthumbpath = path.resolve(__dirname, '..', 'uploads', user_sn, tempfn);
					// console.log(realthumbpath);
					if (fs.existsSync(realthumbpath)) {
						fs.unlinkSync(realthumbpath);
					}
				}
				callback();
			});
		});
	},
	start: false
});

//console.log("cron시작");
// delinvalidjob.start();
// delcompletejob.start();

/*
 * 뷰 부분
 */

// 유저 주문 페이지
exports.orderForm = function (req, res) {
//	console.log(req.session);
	try {
		if (req.session.user_id == null || req.session.user_id == undefined || req.session.user_id == '') {
			res.send('<script>alert("로그인을 먼저 해주세요!");location.href="/chm/user/login";</script>');
		} else {
			order_app.tempartistlist(function (err, results) {
				if (err) console.log(err);
//				console.log(results);
				res.render('u_orderform', { title: '주문 페이지', datas: results });
			});
		}
	} catch (e) {
		console.log("error : ", e);
	}
};


//유저 주문 페이지
exports.orderFormINI = function (req, res) {
//	console.log(req.session);
	try {
		if (req.session.user_id == null || req.session.user_id == undefined || req.session.user_id == '') {
			res.send('<script>alert("로그인을 먼저 해주세요!");location.href="/chm/user/login";</script>');
		} else {
			order_app.tempartistlist(function (err, results) {
				if (err) console.log(err);
//				console.log(results);
				res.render('u_orderform_inipay', { title: '주문 페이지', datas: results });
			});
		}
	} catch (e) {
		console.log("error : ", e);
	}
};


// 유저 결제 페이지
exports.paymentForm = function (req, res) {
//	console.log(req.session);
	try {
		if (req.session.user_id == null || req.session.user_id == undefined || req.session.user_id == '') {
			res.send('<script>alert("로그인을 먼저 해주세요!");location.href="/chm/user/login";</script>');
		} else {
			if (req.session.o_id == null || req.session.o_id == undefined || req.session.o_id == '') {
				res.send('<script>alert("잘못된 경로로 접근하셨습니다!");location.href="/chm/user/";</script>');
			}
			else {
				order_app.showorderinfo(req.session.o_id, function (err, result) {
					if (err) console.log(err);
					var price = result[0].price;
					var temp;
					if (result[0].mode == "0") {
						temp = result[0].artist_name + " " + result[0].style_name + " 상반신 스케치 " + result[0].pcount + "명";
					}
					else if (result[0].mode == "1") {
						temp = result[0].artist_name + " " + result[0].style_name + " 상반신 포인트컬러 " + result[0].pcount + "명";
					}
					else if (result[0].mode == "2") {
						temp = result[0].artist_name + " " + result[0].style_name + " 상반신 풀컬러 " + result[0].pcount + "명";
					}
					else if (result[0].mode == "3") {
						temp = result[0].artist_name + " " + result[0].style_name + " 전신 스케치 " + result[0].pcount + "명";
					}
					else if (result[0].mode == "4") {
						temp = result[0].artist_name + " " + result[0].style_name + " 전신 포인트컬러 " + result[0].pcount + "명";
					}
					else if (result[0].mode == "5") {
						temp = result[0].artist_name + " " + result[0].style_name + " 전신 풀컬러 " + result[0].pcount + "명";
					}

					CASH_GB = "MC";
					MC_SVCID = "140808790001";
					Prdtprice = result[0].price;
					PAY_MODE = "00";
					Okurl = "https://www.omybrand.com/chm/order_web/finish";
					Prdtnm = temp;
					Siteurl = "www.omybrand.com";
					Tradeid = req.session.o_id;
					LOGO_YN = "N";
					CALL_TYPE = "SELF";
					MC_FIXNO = "Y";
					Payeremail = req.session.user_id;
					Notiurl = "https://www.omybrand.com/chm/order_web/validordermobile";
					Closeurl = "https://www.omybrand.com/chm/user/";
					Failurl = "https://www.omybrand.com/chm/order_web/finish";

					order_app.showartistinfo(result[0].artist_sn, function (err, result) {
						var g_name = result[0].artist_name + " " + temp;
						res.render('u_paymentform_test', {
							title: '결제 페이지',
							user_id: req.session.user_id,
							o_id: req.session.o_id,
							price: price,
							g_name: g_name,
							CASH_GB: CASH_GB,
							MC_SVCID: MC_SVCID,
							Prdtprice: Prdtprice,
							PAY_MODE: PAY_MODE,
							Okurl: Okurl,
							Prdtnm: Prdtnm,
							Siteurl: Siteurl,
							Tradeid: Tradeid,
							LOGO_YN: LOGO_YN,
							CALL_TYPE: CALL_TYPE,
							MC_No: "",
							MC_FIXNO: MC_FIXNO,
							Payeremail: Payeremail,
							Userid: "",
							Item: "",
							Notiurl: Notiurl,
							Closeurl: Closeurl,
							Failurl: Failurl,
							next_url: 'https://www.omybrand.com/chm/order_web/finish'
						});
					});
				});
			}
		}
	} catch (e) {
		console.log("error : ", e);
	}
};


// 유저 결제 완료 페이지
exports.finishForm = function (req, res) {

//	console.log(req.body);
//	var reqmsg = new Buffer([0xBB, 0xF3, 0xC1, 0xA1, 0xBC, 0xAD, 0xBA, 0xF1, 0xBD, 0xBA, 0xB0, 0xB3, 0xBD, 0xC3, 0xBB, 0xF3, 0xC5, 0xC2, 0xB0, 0xA1, 0xBE, 0xC6, 0xB4, 0xD5, 0xB4, 0xCF, 0xB4, 0xD9, 0x28, 0x29, 0xC0, 0xDA, 0xBC, 0xBC, 0xC7, 0xD1, 0xBB, 0xE7, 0xC7, 0xD7, 0xC0, 0xBA, 0xC0, 0xCC, 0xB4, 0xCF, 0xBD, 0xC3, 0xBD, 0xBA, 0x28, 0x29, 0xB7, 0xCE, 0xB9, 0xAE, 0xC0, 0xC7, 0xC7, 0xD8, 0xC1, 0xD6, 0xBC, 0xBC, 0xBF, 0xE4]);
//	var euckr2utf8m = new Iconv('EUC-KR', 'UTF-8');
//	console.log(euckr2utf8m.convert(reqmsg).toString('utf8'));

	try {
		if (req.body.P_STATUS != "00" && req.body.Resultcd != "0000") {
			res.send('<script>alert("결제하는데 실패했습니다.");location.href="/chm/user/";</script>');
		} else if (req.body.P_STATUS == "00") {
			var euckr2utf8 = new Iconv('EUC-KR', 'UTF-8');
			var utf82euckr = new Iconv('UTF-8', 'EUC-KR');

			var p_tidBin = new Buffer(req.body.P_TID, 'binary');
			var p_tidEuckr = utf82euckr.convert(p_tidBin);

			var p_midBin = new Buffer(req.body.P_MID, 'binary');
			var p_midEuckr = utf82euckr.convert(p_midBin);

			var p_tid = p_tidEuckr.toString('utf8');
			var p_mid = p_midEuckr.toString('utf8');

			var request = require("request");

			order_app.showorderinfo(p_tid, function (err, results) {
				if (err) console.log(err);
				order_app.tempartistlist(results[0].artist_sn, function (err, results) {
					if (err) console.log(err);
					if (results[0].able == 0) {
						res.send('<script>alert("해당 작가는 이미 작업 중입니다! 결제는 되지 않습니다.");location.href="/chm/user/login";</script>');
						return;
					}
				});
			});
//			order_app.temporderstyleinfo

			request({
				uri: req.body.P_REQ_URL,
				method: "POST",
				form: {
					P_TID: p_tid,
					P_MID: p_mid
				}
			}, function(error, response, body) {
//				console.log(response);
//				console.log(body);
				if (req.session.user_id == null || req.session.user_id == undefined || req.session.user_id == '') {
					res.send('<script>alert("로그인을 먼저 해주세요!");location.href="/chm/user/login";</script>');
				} else {
					var status = true;
					var sbody = body.split("&");
					for (var i in sbody) {
//						console.log(sbody[i]);
						var parsedata = sbody[i].split("=");
						if (parsedata[0] == 'P_STATUS') {
							if (parsedata[1] != '00') {
								status = false;
								res.send('<script>alert("결제가 실패했습니다. 주문은 자동으로 취소됩니다.");location.href="/chm/user/";</script>');
							}
						}
						if (parsedata[0] == 'P_OID') {
							if (status) {
								order_app.validorder(parsedata[1], function (err, result) {
									if (err) console.log(err);
									if (result.affectedRows == 1) {
										// 주문 결제 완료
										res.render('u_finishform', { title: '결과 페이지' });
										order_app.showorderinfo(parsedata[1], function (err, results) {
											if (err) console.log(err);
											if (results != null && results != undefined && results.length != 0) {
												order_app.updateable(results[0].artist_sn, 0, function (err, uresult) {
													if (err) console.log(err);
													if (uresult.affectedRows == 1) {
														res.render('u_finishform', { title: '결과 페이지' });
													}
													else {
														res.render('u_finishform', { title: '결과 페이지' });
//														res.json({ msg: '관리자에게 문의해주세요' });
													}
												});
											}
											else {
												res.json({ msg: '관리자에게 문의해주세요' });
											}
										});
									}
									else {
										// DB 에러 문제
										res.json({ msg: '관리자에게 문의해주세요' });
									}
								});
								break;
							}
							else {
								order_app.cancelorder(parsedata[1], function (err, result) {
									if (err) console.log(err);
									if (result.affectedRows == 1) {
										res.send('<script>alert("결제 실패로 주문이 취소되었습니다");location.href="/chm/user/";</script>');
									} else {
										res.json({ msg: '관리자에게 문의해주세요' });
									}
								});
								break;
							}
						}
					}
				}
			});
		} else if (req.body.Resultcd == "0000") {
			var status = true;
			order_app.validorder(req.body.Tradeid, function (err, result) {
				if (err) console.log(err);
				if (result.affectedRows == 1) {
					// 주문 결제 완료
					res.render('u_finishform', { title: '결과 페이지' });
					order_app.showorderinfo(req.body.Tradeid, function (err, results) {
						if (err) console.log(err);
						if (results != null && results != undefined && results.length != 0) {
							order_app.updateable(results[0].artist_sn, 0, function (err, uresult) {
								if (err) console.log(err);
								if (uresult.affectedRows == 1) {
									res.render('u_finishform', { title: '결과 페이지' });
								}
								else {
									res.render('u_finishform', { title: '결과 페이지' });
//									res.json({ msg: '관리자에게 문의해주세요' });
								}
							});
						}
						else {
							res.json({ msg: '관리자에게 문의해주세요' });
						}
					});
				}
				else {
					// DB 에러 문제
					res.json({ msg: '관리자에게 문의해주세요' });
				}
			});
		}
	} catch (e) {
		console.log("error : ", e);
	}
};

// 유저 결제 페이지
exports.paymentappForm = function (req, res) {
//	console.log(req.session);
	try {
		if (req.body.o_id == null || req.body.o_id == undefined || req.body.o_id == '') {
//			res.send('<script>alert("잘못된 경로로 접근하셨습니다!");location.href="/chm/user/";</script>');
			res.json({ result: 'fail', msg: 'o_id' })
		}
		else if (req.body.user_id == null || req.body.user_id == undefined || req.body.user_id == '') {
//			res.send('<script>alert("잘못된 경로로 접근하셨습니다!");location.href="/chm/user/";</script>');
			res.json({ result: 'fail', msg: 'user_id' })
		}
		else {
			order_app.showorderinfo(req.body.o_id, function (err, result) {
				if (err) console.log(err);
				if (result[0] != undefined) {
					var price = result[0].price;
					var temp;
					if (result[0].mode == "0") {
						temp = result[0].artist_name + " " + result[0].style_name + " 상반신 스케치 " + result[0].pcount + "명";
					}
					else if (result[0].mode == "1") {
						temp = result[0].artist_name + " " + result[0].style_name + " 상반신 포인트컬러 " + result[0].pcount + "명";
					}
					else if (result[0].mode == "2") {
						temp = result[0].artist_name + " " + result[0].style_name + " 상반신 풀컬러 " + result[0].pcount + "명";
					}
					else if (result[0].mode == "3") {
						temp = result[0].artist_name + " " + result[0].style_name + " 전신 스케치 " + result[0].pcount + "명";
					}
					else if (result[0].mode == "4") {
						temp = result[0].artist_name + " " + result[0].style_name + " 전신 포인트컬러 " + result[0].pcount + "명";
					}
					else if (result[0].mode == "5") {
						temp = result[0].artist_name + " " + result[0].style_name + " 전신 풀컬러 " + result[0].pcount + "명";
					}

					CASH_GB = "MC";
					MC_SVCID = "140808790001";
					Prdtprice = result[0].price;
//					PAY_MODE = "00";
					PAY_MODE = "10";
					Okurl = "https://www.omybrand.com/chm/order_app/finishapp";
					Prdtnm = temp;
					Siteurl = "www.omybrand.com";
					Tradeid = req.body.o_id;
					LOGO_YN = "N";
					CALL_TYPE = "SELF";
					MC_FIXNO = "Y";
					Payeremail = req.body.user_id;
					Notiurl = "https://www.omybrand.com/chm/order_app/validordermobile";
					Closeurl = "https://www.omybrand.com/chm/user/";
					Failurl = "https://www.omybrand.com/chm/order_app/finishapp";

					order_app.temporderstyleinfo(result[0].artist_sn, result[0].style_sn, function (err, iresult) {
						var g_name = temp;
						res.render('u_paymentform', {
							title: '결제 페이지',
							user_id: req.body.user_id,
							o_id: req.body.o_id,
							price: price,
							g_name: g_name,
							CASH_GB: CASH_GB,
							MC_SVCID: MC_SVCID,
							Prdtprice: Prdtprice,
							PAY_MODE: PAY_MODE,
							Okurl: Okurl,
							Prdtnm: Prdtnm,
							Siteurl: Siteurl,
							Tradeid: Tradeid,
							LOGO_YN: LOGO_YN,
							CALL_TYPE: CALL_TYPE,
							MC_No: "",
							MC_FIXNO: MC_FIXNO,
							Payeremail: Payeremail,
							Userid: "",
							Item: "",
							Notiurl: Notiurl,
							Closeurl: Closeurl,
							Failurl: Failurl,
							next_url: 'https://www.omybrand.com/chm/order_app/finishapp?o_id=' + req.body.o_id,
							return_url: ''
						});
					});
				} else {
					res.json({ result: 'fail', msg: 'no order' });
				}
			});
		}
	} catch (e) {
		console.log("error : ", e);
	}
};


//결제 완료(계좌 이체 시)
exports.getresultForm = function (req, res) {
	try {
		if (req.query.rc == undefined) {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.query.rc == "00") {
			res.render('u_finishform_inipay', { title: '결과 페이지' });
		}
		else {
			res.render('u_failform', { title: '결과 페이지' });
		}
	} catch (err) {
		console.error('error :', err);
	}

};

exports.finishappINIForm = function (req, res) {
//	console.log(req);
	if (req.query.o_id == undefined) {
		res.json('Your try is logged in Our Server!');
		return;
	}
	if (req.query.vpresult == "00") {
		order_app.validorder(req.query.o_id, function (err, result) {
			if (err) console.log(err);
			if (result.affectedRows == 1) {
				// 주문 결제 완료
				order_app.showorderinfo(req.query.o_id, function (err, results) {
					if (err) console.log(err);
					if (results != null && results != undefined && results.length != 0) {
						order_app.updateable(results[0].artist_sn, 0, function (err, uresult) {
							if (err) console.log(err);
							if (uresult.affectedRows == 1) {
								res.send('<script>location.replace("https://www.omybrand.com/chm/order_app/result?rc=00");</script>');
//								res.render('u_finishform_inipay', { title: '결과 페이지' });
							}
							else {
								res.json({ msg: '관리자에게 문의해주세요' });
							}
						});
					}
					else {
						res.json({ msg: '관리자에게 문의해주세요' });
					}
				});
			}
			else {
				// DB 에러 문제
				res.json({ msg: '관리자에게 문의해주세요' });
			}
		});
//		res.render('u_finishform_inipay', { title: '결과 페이지' });
	}
	else if (req.query.vpresult != "00"){
		res.send('<script>location.replace("https://www.omybrand.com/chm/order_app/result?rc=01");</script>');
	}
	else {
		res.json('Your try is logged in Our Server!');
		return;
	}
}

// 유저 결제 완료 페이지
exports.finishappForm = function (req, res) {
//	console.log(req.body);s
	try {
		if (req.body.P_STATUS != "00" && req.body.Resultcd != "0000") {
			res.send('<script>alert("결제하는데 실패했습니다.");</script>');
		} else {
			if (req.body.P_STATUS != undefined) {
				var euckr2utf8 = new Iconv('EUC-KR', 'UTF-8');
				var utf82euckr = new Iconv('UTF-8', 'EUC-KR');

				var p_tidBin = new Buffer(req.body.P_TID, 'binary');
				var p_tidEuckr = utf82euckr.convert(p_tidBin);

				var p_midBin = new Buffer(req.body.P_MID, 'binary');
				var p_midEuckr = utf82euckr.convert(p_midBin);

				var p_tid = p_tidEuckr.toString('utf8');
				var p_mid = p_midEuckr.toString('utf8');

				var request = require("request");

				request({
					uri: req.body.P_REQ_URL,
					method: "POST",
					form: {
						P_TID: p_tid,
						P_MID: p_mid
					}
				}, function(error, response, body) {
//					console.log(response);
//					console.log(body);

					var status = true;
					var sbody = body.split("&");
					for (var i in sbody) {
//						console.log(sbody[i]);
						var parsedata = sbody[i].split("=");
						if (parsedata[0] == 'P_STATUS') {
							if (parsedata[1] != '00') {
								status = false;
								res.send('<script>alert("결제가 실패했습니다. 주문은 자동으로 취소됩니다.");</script>');
							}
						}

						if (parsedata[0] == 'P_OID') {
							if (status) {
								order_app.validorder(parsedata[1], function (err, result) {
									if (err) console.log(err);
									if (result.affectedRows == 1) {
										// 주문 결제 완료
										order_app.showorderinfo(parsedata[1], function (err, results) {
											if (err) console.log(err);
											if (results != null && results != undefined && results.length != 0) {
												order_app.updateable(results[0].artist_sn, 0, function (err, uresult) {
													if (err) console.log(err);
													if (uresult.affectedRows == 1) {
														res.render('u_finishform', { title: '결과 페이지' });
													}
													else {
														res.json({ msg: '관리자에게 문의해주세요' });
													}
												});
											}
											else {
												res.json({ msg: '관리자에게 문의해주세요' });
											}
										});
									}
									else {
										// DB 에러 문제
										res.json({ msg: '관리자에게 문의해주세요' });
									}
								});
								break;
							}
							else {
								order_app.cancelorder(parsedata[1], function (err, result) {
									if (err) console.log(err);
									if (result.affectedRows == 1) {
//										res.send('<script>alert("결제 실패로 주문이 취소되었습니다");</script>');
										res.render('u_failform', { title: '결과 페이지' });
									} else {
										res.json({ msg: '관리자에게 문의해주세요' });
									}
								});
								break;
							}
						}
					}
				});
			} else if (req.body.Resultcd != undefined) {
				order_app.validorder(req.body.Tradeid, function (err, result) {
					if (err) console.log(err);
					if (result.affectedRows == 1) {
						// 주문 결제 완료
						order_app.showorderinfo(req.body.Tradeid, function (err, results) {
							if (err) console.log(err);
							if (results != null && results != undefined && results.length != 0) {
								order_app.updateable(results[0].artist_sn, 0, function (err, uresult) {
									if (err) console.log(err);
									if (uresult.affectedRows == 1) {
										res.render('u_finishform', { title: '결과 페이지' });
									}
									else
									{
										res.json({ msg: '관리자에게 문의해주세요' });
									}
								});
							}
							else {
								res.json({ msg: '관리자에게 문의해주세요' });
							}
						});
					}
					else {
						// DB 에러 문제
						res.json({ msg: '관리자에게 문의해주세요' });
					}
				});
			} else {
				res.json('Your try is logged in Our Server!');
				return;
			}
		}
	} catch (e) {
		console.log("error : ", e);
	}
};




// 전체 주문 내역 보기(관리자용)
exports.showAlllist = function (req, res)  {
	try {
		order_app.showorderalllist(function (err, datas) {
//			console.log('chmorderlist pool에 들어왔숑~');
			if(err){
				res.json({ result: "fail", msg: err });
			} else {
				res.json({ result: "success", data: datas });
			}
		});
    } catch(err) {
        if(err) console.error('err', err);
    }
};


// 해당년월 내역 보기(작가용)
exports.showartistorderlist = function (req, res)  {
	try {
		var artist_sn = req.session.artist_sn;
		if (req.body.yy == null || req.body.yy == undefined || req.body.yy == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.mm == null || req.body.mm == undefined || req.body.mm == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
//		console.log(req.body);
		var yy = req.body.yy;
		var mm = req.body.mm;
//		console.log(yy + "-" + mm);
		order_app.showartistorderlist(artist_sn, yy, mm, function (err, datas) {
			// console.log('chmorderlist pool에 들어왔숑~');
//			console.log(datas);
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


// 주문 상태 변경하기(작가용)
exports.changeState = function (req, res) {
	try {
		if (req.session.artist_sn == null || req.session.artist_sn == undefined || req.session.artist_sn == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

		var artist_sn = req.session.artist_sn;

		if (req.body.period != undefined && req.body.period != '' && req.body.period >= 0) {
			order_app.updatefinishtime(artist_sn, req.body.period, function (err, fresult) {
				if (err) console.log(err);
				if (fresult.affectedRows == 1) {
					order_app.updateworkstate(artist_sn, 1, function (err, wresult) {
						console.log('chmorderlist pool에 들어왔숑~');
						if(err){
							console.log(err);
							res.send('<script>alert("작업의 상태를 변경할 수 없습니다.");location.href="/chm/artist/taskmanage";</script>');
						} else {
							if (wresult.affectedRows == 1) {
								order_app.updateable(artist_sn, 0, function (err, result) {
									if (err) console.log(err);
									if (result.affectedRows == 1) {
										res.send('<script>alert("작업 상태 변경이 완료되었습니다.");location.href="/chm/artist/taskmanage";</script>');
									}
								});
							}
						}
					});
				}
			});
		} else if (req.body.period == undefined) {
			order_app.updateworkstate(artist_sn, 2, function (err, result) {
				console.log('chmorderlist pool에 들어왔숑~');
				if(err){
//					res.json({result: "fail", msg: err});
					res.send('<script>alert("작업의 상태를 변경할 수 없습니다.");location.href="/chm/artist/taskmanage";</script>');
				} else {
					if (result.affectedRows == 1) {
						res.send('<script>alert("검수가 완료되면 새 주문을 받으실 수 있습니다.");location.href="/chm/artist/taskmanage";</script>');
					}
					else {
						res.send('<script>alert("유효하지 않은 작업입니다.");location.href="/chm/artist/taskmanage";</script>')
					}
				}
			});
		}
    } catch(err) {
        if(err) console.error('err', err);
    }
}


// 내 주문 내역 보기
exports.showMylist = function (req, res)  {
	try {
//		console.log('userid', req.body.user_id);
		if (req.body.user_id == null || req.body.user_id == undefined || req.body.user_id == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.user_pwd == null || req.body.user_pwd == undefined || req.body.user_pwd == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

		var id = req.body.user_id;
		var pwd = req.body.user_pwd;
//		var state = req.body.user_push;
		var hashpwd;
		var chmdatas = [];
		var encoid = "";

		security.security_encodata(id, function (encodata) {
			encoid = encodata;
			security.security_pwdproc(pwd, function (encopwd) {
				hashpwd = encopwd;
				user.login(encoid, hashpwd, function (err, msg) {
					if (err) console.error('err chmorderlist.login 1 ', err);
					if (msg.result == 'success'){
						if (err) console.error('err chmorderlist.login 2', err);
						order_app.showmyorderlist(encoid, function (err, datas) {
							console.log('chmorderlist pool에 들어왔숑~');
							if(err){
								res.json({ result: "fail", msg: err });
							} else {
								res.json({ result: "success", data: datas });
							}
						});
					} else if (msg.result == 'fail') {
						if (msg.msg == 'id') {
							res.json({ result: 'fail', msg: 'id' });
						} else if (msg.msg == 'pwd') {
							res.json({ result: 'fail', msg: 'pwd' });
						}
					}
				});
			});
		});
    } catch(err) {
        if(err) console.error('err', err);
    }
};


// 주문 내역 상세 보기
exports.showOrderinfo = function(req, res)  {
    try {
//    	console.log('userid', req.body.userid);
		if (req.body.user_id == null || req.body.user_id == undefined || req.body.user_id == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.user_pwd == null || req.body.user_pwd == undefined || req.body.user_pwd == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.order_sn == null || req.body.order_sn == undefined || req.body.order_sn == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

    		var id = req.body.user_id;
		var pwd = req.body.user_pwd;
		var order_sn = req.body.order_sn;

		var hashpwd;
		var encoid = "";

		security.security_encodata(id, function (encodata) {
			encoid = encodata;
			security.security_pwdproc(pwd, function (encopwd) {
				hashpwd = encopwd;
				user.login(encoid, hashpwd, function (err, msg) {
					if (err) console.error('err user.login 1 ', err);
					if (msg.result == 'success'){
						if (err) console.error('err user.login 2', err);
						order_app.showorderinfo(order_sn, function (err, datas) {
							console.log('chmorderlist pool에 들어왔숑~');
							if(err){
								res.json({result: "fail", msg: err});
							} else {
								res.json({result: "success", data: datas});
							}
						});
					} else if (msg.result == 'fail') {
						if (msg.msg == 'id') {
							res.json({result: 'fail', msg: 'id'});
						} else if (msg.msg == 'pwd') {
							res.json({result: 'fail', msg: 'pwd'});
						}
					}
				});
			});
		});
    } catch (err) {
        if (err) console.error('err', err);
    }
};


// 사진 다운로드(작가용)
exports.getPhoto = function (req, res) {
	try {
		if (req.body.filepath == null || req.body.filepath == undefined || req.body.filepath == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		var filepath = req.body.filepath;
//		console.log(filepath);
		var arr = filepath.split("/");
		var name = arr[arr.length-1];
		var foldername = name.substring(0, 12);
		var linkpath = path.resolve(__dirname, '..', 'uploads', foldername, name);
		res.download(linkpath);
	} catch (err) {
		if (err) console.error('err', err);
	}
};


// 주문하기 (앱 버전용)
exports.addOrder = function (req, res)  {
	try {
//		console.log(req.body);
		var id = req.body.user_id;
		if (id == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		var pwd = req.body.user_pwd;
		if (pwd == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		var artist_sn = req.body.artist_sn;
		if (artist_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		var style_sn = req.body.style_sn;
		if (style_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		/*var userreq = req.body.user_req;
		if (userreq == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}*/
		var userreq = '';

		var mode = parseInt(req.body.mode);
		if (mode == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		var pcount = parseInt(req.body.pcount);
		if (pcount == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		var price = parseInt(req.body.price);
		if (price == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
//		var goods_sn = req.body.goods_sn;
//		var goods_count = parseInt(req.body.goods_count);
		var goods_sn = 'chmg00000001';
		var goods_count = 1;
		var registID = req.body.user_registid;
		if (registID == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		var user_sn;
		var hashpwd;
		var tempdatas = [];
		var encodatas = [];
		var len = id.length;
		var con = true;

		order_app.temporderstyleinfo(artist_sn, style_sn, function (err, results) {
			if (err) console.log(err);
			if (results[0] != undefined && results[0].artist_able != undefined) {
				if (results[0].artist_able == 1) {
					if (mode == 0) {
						if (results[0].artist_onesketch + ((pcount - 1) * results[0].artist_onesketch * (1 - pcount * 0.05)) != price) {
							console.log("가격 틀림");
							con = false;
							res.json({ result: 'fail', msg: 'invalid' });
						}
					} else if (mode == 1) {
						if (results[0].artist_onepointcolor + ((pcount - 1) * results[0].artist_onepointcolor * (1 - pcount * 0.05)) != price) {
							console.log("가격 틀림");
							con = false;
							res.json({ result: 'fail', msg: 'invalid' });
						}
					} else if (mode == 2) {
						if (results[0].artist_onecolor + ((pcount - 1) * results[0].artist_onecolor * (1 - pcount * 0.05)) != price) {
							console.log("가격 틀림");
							con = false;
							res.json({ result: 'fail', msg: 'invalid' });
						}
					} else if (mode == 3) {
						if (results[0].artist_onefullsketch + ((pcount - 1) * results[0].artist_onefullsketch * (1 - pcount * 0.05)) != price) {
							console.log("가격 틀림");
							con = false;
							res.json({ result: 'fail', msg: 'invalid' });
						}
					} else if (mode == 4) {
						if (results[0].artist_onefullpointcolor + ((pcount - 1) * results[0].artist_onefullpointcolor * (1 - pcount * 0.05)) != price) {
							console.log("가격 틀림");
							con = false;
							res.json({ result: 'fail', msg: 'invalid' });
						}
					} else if (mode == 5) {
						if (results[0].artist_onefullcolor + ((pcount - 1) * results[0].artist_onefullcolor * (1 - pcount * 0.05)) != price) {
							console.log("가격 틀림");
							con = false;
							res.json({ result: 'fail', msg: 'invalid' });
						}
					} else {
						console.log("모드 틀림");
						con = false;
						res.json({ result: 'fail', msg: 'invalid' });
					}

					var artist_id = results[0].artist_id;
					if (con) {
						security.security_decodata(artist_id, function (decoid) {
							var encoid = "";
							security.security_encodata(id, function (encodata) {
								encoid = encodata;
								security.security_pwdproc(pwd, function (encopwd) {
									hashpwd = encopwd;
									user.getsn(encoid, function (err, result) {
										user_sn = result[0].user_sn;
										user.login(encoid, hashpwd, function (err, msg) {
											if (err) console.error('err user.login 1 ', err);
											if (msg.result == 'success'){
												if (err) console.error('err user.login 2', err);
												var number;
												var tempnum;
												var tempsn;
												var datas = [];
												var chmdatas = [];

												if (req.files == undefined) {
			//										console.log("파일 자체가 없을 시");
													res.json({ result : 'fail', msg : 'upfile' });
													return;
												}

												if (req.files != undefined) {

													var upfile = req.files.upfile;

			//										console.log('upfile', upfile);
													var exti = upfile.name.lastIndexOf('.');
													var extv = upfile.name.substring(exti);

													if (upfile.originalFilename == '') {		// 선택한 파일이 없을 때
			//											console.log("선택한 파일이 없음");
														res.json({ result : 'fail', msg : 'upfile' });
													}
													else if (extv != '.jpg' && extv != '.jpeg' && extv != '.png' && extv != '.bmp') {
														res.json({ result : 'fail', msg : 'upfile' });
													}
													else
													{
														var userfolder = path.resolve(__dirname, '..', 'uploads', user_sn);
														var publicsrcpath = "https://www.omybrand.com/chm/uploads/" + user_sn + "/";
														var publicthumbpath;
														// console.log('userfolder', userfolder);
														if (!fs.existsSync(userfolder)) {			// 폴더가 없으면 만듦
															fs.mkdirSync(userfolder);
														}

														var name = result[0].user_sn + upfile.name;		// 예) omav00000001Tulips.jpg
														publicsrcpath += name;
														var srcpath = upfile.path;
														var destpath = path.resolve(userfolder, name);
														var is = fs.createReadStream(srcpath);
														var os = fs.createWriteStream(destpath);
														is.pipe(os);
														is.on('end', function () {
															fs.unlinkSync(srcpath);
															var srcimg = destpath;
															var idx = destpath.lastIndexOf('.');
															var filename = destpath.substring(0, idx);
															var ext = destpath.substring(idx);
															var destimg = filename + '-thumbnail' + ext;

															var idx2 = publicsrcpath.lastIndexOf('.');
															publicthumbpath = publicsrcpath.substring(0, idx2);
															var ext2 = publicsrcpath.substring(idx2);
															publicthumbpath = publicthumbpath + '-thumbnail' + ext2;

															easyimage.resize({src:srcimg, dst:destimg, width:100, height:100}, function (err, image) {
																if (err) console.error('err', err);
															});

															order_app.checksn(function (err, results) {
																if (err) console.log('err', err);
					//											console.log('result', results);
																if (results == undefined || results == null || results.length == 0) {
																	number = 1;
																	util.leadingZeros(number, 8, function (tempnum) {
																		tempsn = "chmo" + tempnum;

																		// 주문 내역에 들어갈 실제 데이터
																		datas.push(tempsn);
																		datas.push(encoid);
																		datas.push(artist_sn);
																		datas.push(style_sn);
																		datas.push(publicsrcpath);
																		datas.push(publicthumbpath);
																		datas.push(userreq);
																		datas.push(mode);
																		datas.push(pcount);
																		datas.push(price);
																		datas.push(0);
																		datas.push('chmg00000001');
																		datas.push(1);
																		datas.push(registID);

																		// console.log('datas', datas);
																		order_app.addorder(datas, function (err, result){
																			if(result.affectedRows == 1) {
																				res.json({ result: 'success', msg: err, order_sn: tempsn });
																			} else {
																				res.json({ result: 'fail', msg: err });
																			}
																		});
																	});
																} else {
																	number = parseInt(results[0].order_sn.substring(4, 12)) + 1;
																	util.leadingZeros(number, 8, function (tempnum) {
																		tempsn = "chmo" + tempnum;

																		// 주문 내역에 들어갈 실제 데이터
																		datas.push(tempsn);
																		datas.push(encoid);
																		datas.push(artist_sn);
																		datas.push(style_sn);
																		datas.push(publicsrcpath);
																		datas.push(publicthumbpath);
																		datas.push(userreq);
																		datas.push(mode);
																		datas.push(pcount);
																		datas.push(price);
																		datas.push(0);
																		datas.push('chmg00000001');
																		datas.push(1);
																		datas.push(registID);

																		order_app.addorder(datas, function (err, result){
																			if (result.affectedRows == 1) {
																				res.json({ result: 'success', msg: err, order_sn: tempsn });
																			} else {
																				res.json({ result: 'fail', msg: err });
																			}
																		});
																	});
																}
															});
														});
													}
												}
											} else if (msg.result == 'fail') {
												if (msg.msg == 'id') {
													res.json({result: 'fail', msg: 'id'});
												} else if (msg.msg == 'pwd') {
													res.json({result: 'fail', msg: 'pwd'});
												}
											}
										});
									});
								});
							});
						});
					}
				} else {
					res.json({ result: 'fail', msg: 'not able' });
				}
			} else {
				res.json({ result: 'fail', msg: "invalid" });
			}
		});
    } catch(err) {
        if(err) console.error('err', err);
    }
};


// 주문하기 (웹 버전용)
// exports.order = function (req, res)  {
// 	try {
// //		console.log(req.body);
// 		if (req.body.artist_sn == null || req.body.artist_sn == undefined || req.body.artist_sn == '') {
// 			res.json('Your try is logged in Our Server!');
// 			return;
// 		}
// 		if (req.body.style_sn == null || req.body.style_sn == undefined || req.body.style_sn == '') {
// 			res.json('Your try is logged in Our Server!');
// 			return;
// 		}
// 		if (req.body.user_req == null || req.body.user_req == undefined || req.body.user_req == '') {
// 			res.json('Your try is logged in Our Server!');
// 			return;
// 		}
// 		if (req.body.mode == null || req.body.mode == undefined || req.body.mode == '') {
// 			res.json('Your try is logged in Our Server!');
// 			return;
// 		}
// 		if (req.body.pcount == null || req.body.pcount == undefined || req.body.pcount == '') {
// 			res.json('Your try is logged in Our Server!');
// 			return;
// 		}
// 		if (req.body.price == null || req.body.price == undefined || req.body.price == '') {
// 			res.json('Your try is logged in Our Server!');
// 			return;
// 		}
// 		if (req.body.goods_sn == null || req.body.goods_sn == undefined || req.body.goods_sn == '') {
// 			res.json('Your try is logged in Our Server!');
// 			return;
// 		}
// 		if (req.body.goods_count == null || req.body.goods_count == undefined || req.body.goods_count == '') {
// 			res.json('Your try is logged in Our Server!');
// 			return;
// 		}

// 		var artist_sn = req.body.artist_sn;
// 		var style_sn = req.body.style_sn;
// 		var userreq = req.body.user_req;
// 		var mode = parseInt(req.body.mode);
// 		var pcount = parseInt(req.body.pcount);
// 		var price = parseInt(req.body.price);
// 		var goods_sn = req.body.goods_sn;
// 		var goods_count = parseInt(req.body.goods_count);
// //		var goods_sn = 'CHMG00000001';
// //		var goods_count = 1;
// 		var registID = req.body.user_registid;
// 		var user_sn;
// //		var hashpwd;
// 		var tempdatas = [];
// 		var encodatas = [];
// 		var con = true;

// 		var goods_price = 0;

// 		if (goods_sn == "chmg00000001") {
// 			goods_price = 10000 * goods_count;
// 		}
// 		else if (goods_sn == "chmg00000002") {
// 			goods_price = 20000 * goods_count;
// 		}

// 		if (req.session.user_id == null || req.session.user_id == undefined || req.session.user_id == '') {
// 			con = false;
// 			res.send('<script>alert("로그인을 먼저 해주세요!");location.href="/chm/user/login";</script>');
// 		} else {
// 			var id = req.session.user_id;
// 			var len = id.length;

// 			order_app.temporderstyleinfo(artist_sn, style_sn, function (err, results) {
// 				if (err) console.log(err);
// 				if (results[0] == undefined) {
// 					res.send('<script>alert("해당 스타일은 존재하지 않습니다!");location.href="/chm/user/";</script>');
// 					return;
// 				}

// //				if (results[0].artist_able == 1) {
// 					if (mode == 0) {
// 						if (results[0].artist_onesketch + ((pcount - 1) * results[0].artist_onesketch * (1 - pcount * 0.05)) != price - goods_price) {
// 							con = false;
// 							res.send('<script>alert("가격을 임의로 조작하지 마세요!");location.href="/chm/orderlist/order";</script>');
// 						}
// 					} else if (mode == 1) {
// 						if (results[0].artist_onepointcolor + ((pcount - 1) * results[0].artist_onepointcolor * (1 - pcount * 0.05)) != price - goods_price) {
// 							con = false;
// 							res.send('<script>alert("가격을 임의로 조작하지 마세요!");location.href="/chm/orderlist/order";</script>');
// 						}
// 					} else if (mode == 2) {
// 						if (results[0].artist_onecolor + ((pcount - 1) * results[0].artist_onecolor * (1 - pcount * 0.05)) != price - goods_price) {
// 							con = false;
// 							res.send('<script>alert("가격을 임의로 조작하지 마세요!");location.href="/chm/orderlist/order";</script>');
// 						}
// 					} else if (mode == 3) {
// 						if (results[0].artist_onefullsketch + ((pcount - 1) * results[0].artist_onefullsketch * (1 - pcount * 0.05)) != price - goods_price) {
// 							con = false;
// 							res.send('<script>alert("가격을 임의로 조작하지 마세요!");location.href="/chm/orderlist/order";</script>');
// 						}
// 					} else if (mode == 4) {
// 						if (results[0].artist_onefullpointcolor + ((pcount - 1) * results[0].artist_onefullpointcolor * (1 - pcount * 0.05)) != price - goods_price) {
// 							con = false;
// 							res.send('<script>alert("가격을 임의로 조작하지 마세요!");location.href="/chm/orderlist/order";</script>');
// 						}
// 					} else if (mode == 5) {
// 						if (results[0].artist_onefullcolor + ((pcount - 1) * results[0].artist_onefullcolor * (1 - pcount * 0.05)) != price - goods_price) {
// 							con = false;
// 							res.send('<script>alert("가격을 임의로 조작하지 마세요!");location.href="/chm/orderlist/order";</script>');
// 						}
// 					} else {
// 						con = false;
// 						res.send('<script>alert("가격을 임의로 조작하지 마세요!");location.href="/chm/orderlist/order";</script>');
// 					}

// 					var artist_id = results[0].artist_id;
// 					var lena = artist_id.length;
// 	//				console.log(lena);
// 					var tempids = [];
// 					if (lena > 24) {
// 						for (var i = 0; i < Math.ceil(lena / 24); i++) {
// 	//						console.log(i);
// 							var stp = i * 24;
// 							var etp = (i + 1) * 24;
// 							if (etp > lena) {
// 								etp = lena;
// 							}
// 							tempids.push(artist_id.substring(stp, etp));
// 	//						console.log(artist_id.substring(stp, etp));
// 						}
// 					}
// 					else {
// 						tempids.push(artist_id);
// 					}

// 					var decoid = "";

// 					async.each(tempids, function (data, callback) {
// 						resproc.resdataproc(data, function (err, tresult) {
// 	//						console.log(data);
// 	//						console.log(result);
// 							decoid += tresult;
// 						});
// 						callback();
// 					});

// 	//				console.log(decoid);

// 	//				result.user_id = decoid;

// 	//				console.log(len);
// 					if (con) {
// 						tempids = [];
// 						if (len > 14) {
// 							for (var i = 0; i < Math.ceil(len / 14); i++) {
// 	//							console.log(i);
// 								var stp = i * 14;
// 								var etp = (i + 1) * 14;
// 								if (etp > len) {
// 									etp = len;
// 								}
// 								tempids.push(id.substring(stp, etp));
// 	//							console.log(id.substring(stp, etp));
// 							}
// 						}
// 						else {
// 							tempids.push(id);
// 						}

// 						var encoid = "";

// 						async.each(tempids, function (data, callback) {
// 							reqproc.reqdataproc(data, function (err, result) {
// 	//							console.log(data);
// 	//							console.log(result);
// 								encoid += result;
// 							});
// 							callback();
// 						});

// 	//					console.log("encoid", encoid);

// 						// 비밀번호 해쉬
// 						/*reqproc.reqpwdproc(pwd, function (err, result) {
// 							hashpwd = result;
// 						});*/

// 						// 개인 데이터 정보 암호화
// 						async.each(tempdatas, function (data, callback) {
// 							reqproc.reqdataproc(data, function (err, result) {
// 	//							console.log(result);
// 								encodatas.push(result);
// 							});
// 							callback();
// 						});

// 	//					console.log("encodata", encodatas);

// 						user.getsn(encoid, function (err, result) {
// 							user_sn = result[0].user_sn;
// 							var number;
// 							var tempnum;
// 							var tempsn;
// 							var datas = [];
// 							var chmdatas = [];

// 							/*var upfile = req.files.upfile;
// 	//						console.log('upfile', upfile);
// 							if (upfile.originalFilename == '') {		// 선택한 파일이 없을 때
// 								res.send('<script>alert("파일을 선택했는지 확인해주세요!");location.href="/chm/orderlist/order";</script>');
// 							}
// 							else
// 							{
// 								var userfolder = path.resolve(__dirname, '..', 'uploads', user_sn);
// 								var publicsrcpath = "https://www.omybrand.com/chm/uploads/" + user_sn + "/";
// 								var publicthumbpath;
// 								console.log('userfolder', userfolder);
// 								if (!fs.existsSync(userfolder)) {			// 폴더가 없으면 만듦
// 									fs.mkdirSync(userfolder);
// 								}

// 								var name = user_sn + upfile.name;		// 예) omav00000001Tulips.jpg
// 								publicsrcpath += name;
// 								var srcpath = upfile.path;
// 								var destpath = path.resolve(userfolder, name);
// //								console.log('destpath', destpath);
// 								var is = fs.createReadStream(srcpath);
// 								var os = fs.createWriteStream(destpath);
// 								is.pipe(os);
// 								is.on('end', function () {
// 									fs.unlinkSync(srcpath);
// 									var srcimg = destpath;
// 									var idx = destpath.lastIndexOf('.');
// 									var filename = destpath.substring(0, idx);
// 									var ext = destpath.substring(idx);
// 									var destimg = filename + '-thumbnail' + ext;

// 									var idx2 = publicsrcpath.lastIndexOf('.');
// 									publicthumbpath = publicsrcpath.substring(0, idx2);
// 									var ext2 = publicsrcpath.substring(idx2);
// 									publicthumbpath = publicthumbpath + '-thumbnail' + ext2;

// 									easyimage.resize({src:srcimg, dst:destimg, width:100, height:100}, function (err, image) {
// 										if (err) console.error('err', err);
// 	//									console.log('image', image);
// 	//									res.json({ userid : userid, status : 'success', image : image });
// 									});*/

// 									order_app.checksn(function (err, results) {
// 										if (err) console.log('err', err);
// 	//									console.log('result', results);
// 										if (results == undefined || results == null || results.length == 0) {
// 											number = 1;
// 											tempnum = leadingZeros(number, 8);
// 											tempsn = "chmo" + tempnum;

// 											// 주문 내역에 들어갈 실제 데이터
// 											datas.push(tempsn);
// 											datas.push(encoid);
// 											datas.push(artist_sn);
// 											datas.push(style_sn);
// //											datas.push(publicsrcpath);
// //											datas.push(publicthumbpath);
// 											datas.push('');
// 											datas.push('');
// 											datas.push(userreq);
// 											datas.push(mode);
// 											datas.push(pcount);
// 											datas.push(price);
// 											datas.push(0);
// 											datas.push('chmg00000001');
// 											datas.push(1);
// 											datas.push(registID);

// 	//										console.log('datas', datas);
// 											order_app.addorder(datas, function (err, result){
// 												if (result.affectedRows == 1) {
// 													req.session.o_id = tempsn;
// 													res.send('<script>location.href="/chm/orderlist/payment";</script>');
// 												} else {
// 													res.send('<script>alert("주문을 등록하는데 실패했습니다. 관리자에게 문의해주세요.^^");location.href="/chm/orderlist/order";</script>');
// 												}
// 											});
// 										} else {
// 											number = parseInt(results[0].order_sn.substring(4, 12)) + 1;
// 											tempnum = leadingZeros(number, 8);
// 											tempsn = "chmo" + tempnum;

// 											// 주문 내역에 들어갈 실제 데이터
// 											datas.push(tempsn);
// 											datas.push(encoid);
// 											datas.push(artist_sn);
// 											datas.push(style_sn);
// //											datas.push(publicsrcpath);
// //											datas.push(publicthumbpath);
// 											datas.push('');
// 											datas.push('');
// 											datas.push(userreq);
// 											datas.push(mode);
// 											datas.push(pcount);
// 											datas.push(price);
// 											datas.push(0);
// 											datas.push('chmg00000001');
// 											datas.push(1);
// 											datas.push(registID);

// 	//										console.log('datas', datas);

// 											order_app.addorder(datas, function (err, result){
// 												if (result.affectedRows == 1) {
// 													req.session.o_id = tempsn;
// 													res.send('<script>location.href="/chm/orderlist/payment";</script>');
// 												} else {
// 													res.send('<script>alert("주문을 등록하는데 실패했습니다. 관리자에게 문의해주세요.^^");location.href="/chm/orderlist/order";</script>');
// 												}
// 											});
// 										}
// 									});
// 								/*});
// 							}*/
// 						});
// 					}
// //				} else {
// //					res.send('<script>alert("해당 작가는 주문을 받을 수 없는 상태입니다. 다른 작가 스타일을 이용해주세요 ^^");location.href="/chm/orderlist/order";</script>');
// //				}
// 			});
// 		}
//     } catch(err) {
//         if(err) console.error('err', err);
//     }
// };


// 주문 결제 완료(휴대폰 제외)
exports.validOrder = function (req, res) {
	var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
	console.log(ip);
	if (ip == '118.129.210.25' || ip == '211.219.96.165') {
		if (req.body.p_status == '00') {
			order_app.validorder(req.body.P_OID, function (err, result) {
				if (err) console.log(err);
				if (result.affectedRows == 1) {
					// 주문 결제 완료
					res.send('<html><head></head><body>OK</body></html>');
					order_app.showorderemail(req.body.P_OID, function (err, result) {
						var id = result[0].artist_id;
						var len = id.length;
//						console.log(len);
						var tempids = [];
						if (len > 24) {
							for (var i = 0; i < Math.ceil(len / 24); i++) {
//								console.log(i);
								var stp = i * 24;
								var etp = (i + 1) * 24;
								if (etp > len) {
									etp = len;
								}
								tempids.push(id.substring(stp, etp));
//								console.log(id.substring(stp, etp));
							}
						}
						else {
							tempids.push(id);
						}

						var decoid = "";

						async.each(tempids, function (data, callback) {
							resproc.resdataproc(data, function (err, tresult) {
//								console.log(data);
//								console.log(result);
								decoid += tresult;
							});
							callback();
						});
						var title = "[캐리커쳐 마키] 주문이 도착했습니다.";
						var content = "작가 웹 페이지에 가셔서 확인해주세요 ^^";
						var data = [title, content];
						user.getemailsn(function (err, results) {
							if (results.length != undefined) {
								var user;
								var email_sn = results[0].email_sn;

								user.setemailsn(email_sn, 0, function (err, sresult1) {
									if (email_sn == 0) {
										user = 'omavmail@gmail.com';
									} else if (email_sn == 1) {
										user = 'omavmail1@gmail.com';
									} else if (email_sn == 2) {
										user = 'omavmail2@gmail.com';
									} else if (email_sn == 3) {
										user = 'omavmail3@gmail.com';
									}
									var smtpTransport = nodemailer.createTransport("SMTP", {
										service: 'Gmail',
										auth: {
											user: user,
											pass: '11dhakqmTJQ' //password 입력
										}
									});

									/*sendmail({
									    from: 'my@omybrand.com',
									    to: decoid,
									    subject: title,
									    content: content,
									  }, function(err, reply) {
									    console.log(err && err.stack);
									    console.dir(reply);
									});*/

									var mailOptions = {
										from: '<omavmail@gmail.com>',
										to: decoid,
										subject: title,
										text: content
									};

									console.log('mail 옵션 설정 완료!');
									smtpTransport.sendMail(mailOptions, function (err, response){
										if (err){
											console.log(err);
										} else {
											console.log("Message sent : " + response.message);
										}
										smtpTransport.close();
										var stop = new Date().getTime();
										while (new Date().getTime() < stop + 10000) {
											;
										}
										user.setemailsn(email_sn, 1, function (err, sresult2) {
											console.log('이메일 해제');
										});
									});
								});
							}
						});
					});
				}
				else if (result.affectedRows == 0) {
					res.send('<html><head></head><body>OK</body></html>');
					order_app.showorderemail(req.body.Tradeid, function (err, result) {
						var id = result[0].artist_id;
						var len = id.length;
//						console.log(len);
						var tempids = [];
						if (len > 24) {
							for (var i = 0; i < Math.ceil(len / 24); i++) {
//								console.log(i);
								var stp = i * 24;
								var etp = (i + 1) * 24;
								if (etp > len) {
									etp = len;
								}
								tempids.push(id.substring(stp, etp));
//								console.log(id.substring(stp, etp));
							}
						}
						else {
							tempids.push(id);
						}

						var decoid = "";

						async.each(tempids, function (data, callback) {
							resproc.resdataproc(data, function (err, tresult) {
//								console.log(data);
//								console.log(result);
								decoid += tresult;
							});
							callback();
						});


						// 업데이트가 이미 된 경우
						var title = "[캐리커쳐 마키] 주문이 도착했습니다.";
						var content = "작가 웹 페이지에 가셔서 확인해주세요 ^^";
						var data = [title, content];
						user.getemailsn(function (err, results) {
							if (results.length != undefined) {
								var user;
								var email_sn = results[0].email_sn;

								user.setemailsn(email_sn, 0, function (err, sresult1) {
									if (email_sn == 0) {
										user = 'omavmail@gmail.com';
									} else if (email_sn == 1) {
										user = 'omavmail1@gmail.com';
									} else if (email_sn == 2) {
										user = 'omavmail2@gmail.com';
									} else if (email_sn == 3) {
										user = 'omavmail3@gmail.com';
									}
									var smtpTransport = nodemailer.createTransport("SMTP", {
										service: 'Gmail',
										auth: {
											user: user,
											pass: '11dhakqmTJQ' //password 입력
										}
									});

									/*sendmail({
									    from: 'my@omybrand.com',
									    to: decoid,
									    subject: title,
									    content: content,
									  }, function(err, reply) {
									    console.log(err && err.stack);
									    console.dir(reply);
									});*/

									var mailOptions = {
										from: '<omavmail@gmail.com>',
										to: decoid,
										subject: title,
										text: content
									};

									console.log('mail 옵션 설정 완료!');
									smtpTransport.sendMail(mailOptions, function (err, response){
										if (err){
											console.log(err);
										} else {
											console.log("Message sent : " + response.message);
										}
										smtpTransport.close();
										var stop = new Date().getTime();
										while (new Date().getTime() < stop + 10000) {
											;
										}
										user.setemailsn(email_sn, 1, function (err, sresult2) {
											console.log('이메일 해제');
										});
									});
								});
							}
						});
					});
				}
				else {
					res.send('<html><head></head><body>FAIL</body></html>');
				}
			});
		} else if (req.body.p_status == '01') {
			// 해당 주문번호 검색해서 삭제하기 추가해야함
			order_app.showorderinfo(req.body.P_OID, function (err, results) {
				if (err) console.log(err);
				var tempphoto = results[0].photo;
				var s = tempphoto.split("/");
				var real = true;
				var user_sn = "";
				var state = "";
				var temppath = "";

				for (var i in s) {
					if (real) {
						if (state == "userfolder") {
							user_sn = s[i];
						}
						temppath = temppath + "/" + s[i];
					}
					if (s[i] == "chm") {
						real = true;
						state = "uploads";
					}
					if (s[i] == "uploads") {
						state = "userfolder";
					}
				}

				var realphotopath = path.resolve(__dirname, '..', temppath);
				fs.unlinkSync(realphotopath);

				var tempthumb = results[0].thumb;
				s = tempthumb.split("/");
				real = true;
				state = "";
				temppath = "";

				for (var i in s) {
					if (real) {
						temppath = temppath + "/" + s[i];
					}
					if (s[i] == "chm") {
						real = true;
						state = "uploads";
					}
				}

				var realthumbpath = path.resolve(__dirname, '..', temppath);
				fs.unlinkSync(realthumbpath);

				order_app.cancelorder(req.body.P_OID, function (err, result) {
					if (err) console.log(err);
					if (result.affectedRows == 1) {
						// 주문 결제 완료
						res.send('<html><head></head><body>OK</body></html>');
					}
					else {
						// DB 에러 문제
						res.send('<html><head></head><body>FAIL</body></html>');
					}
				});
			});
		}
	}
};


// 주문 결제 완료(휴대폰)
exports.validOrdermobile = function (req, res) {
	var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
//	console.log(ip);
//	console.log(req);
//	console.log(req.body.Resultcd);
//	console.log(req.body.Tradeid);
	if (req.body.Resultcd == '0000') {
		order_app.validorder(req.body.Tradeid, function (err, result) {
			if (err) {
				console.log(err);
				res.send('FAIL');
			}
			if (result.affectedRows == 1) {
				// 주문 결제 완료
				console.log('성공함 - 주문 결제 완료');
				res.send('SUCCESS');
				order_app.showorderemail(req.body.Tradeid, function (err, result) {
					var id = result[0].artist_id;
					var len = id.length;
//					console.log(len);
					var tempids = [];
					if (len > 24) {
						for (var i = 0; i < Math.ceil(len / 24); i++) {
//							console.log(i);
							var stp = i * 24;
							var etp = (i + 1) * 24;
							if (etp > len) {
								etp = len;
							}
							tempids.push(id.substring(stp, etp));
//							console.log(id.substring(stp, etp));
						}
					}
					else {
						tempids.push(id);
					}

					var decoid = "";

					async.each(tempids, function (data, callback) {
						resproc.resdataproc(data, function (err, tresult) {
//							console.log(data);
//							console.log(result);
							decoid += tresult;
						});
						callback();
					});

					// 주문 결제 완료
					var title = "[캐리커쳐 마키] 주문이 도착했습니다.";
					var content = "작가 웹 페이지에 가셔서 확인해주세요 ^^";
					var data = [title, content];
					// console.log ('sendmail.js data :', data);

					user.getemailsn(function (err, results) {
						if (results.length != undefined) {
							var user;
							var email_sn = results[0].email_sn;

							user.setemailsn(email_sn, 0, function (err, sresult1) {
								if (email_sn == 0) {
									user = 'omavmail@gmail.com';
								} else if (email_sn == 1) {
									user = 'omavmail1@gmail.com';
								} else if (email_sn == 2) {
									user = 'omavmail2@gmail.com';
								} else if (email_sn == 3) {
									user = 'omavmail3@gmail.com';
								}
								var smtpTransport = nodemailer.createTransport("SMTP", {
									service: 'Gmail',
									auth: {
										user: user,
										pass: '11dhakqmTJQ' //password 입력
									}
								});

								/*sendmail({
								    from: 'my@omybrand.com',
								    to: decoid,
								    subject: title,
								    content: content,
								  }, function(err, reply) {
								    console.log(err && err.stack);
								    console.dir(reply);
								});*/

								var mailOptions = {
									from: '<omavmail@gmail.com>',
									to: decoid,
									subject: title,
									text: content
								};

								console.log('mail 옵션 설정 완료!');
								smtpTransport.sendMail(mailOptions, function (err, response){
									if (err){
										console.log(err);
									} else {
										console.log("Message sent : " + response.message);
									}
									smtpTransport.close();
									var stop = new Date().getTime();
									while (new Date().getTime() < stop + 10000) {
										;
									}
									user.setemailsn(email_sn, 1, function (err, sresult2) {
										console.log('이메일 해제');
									});
								});
							});
						}
					});
				});
			}
			else if (result.affectedRows == 0) {
				console.log('성공함 - 이미 업데이트된 경우');
				res.send('SUCCESS');

				order_app.showorderemail(req.body.Tradeid, function (err, result) {
					var id = result[0].artist_id;
					var len = id.length;
//					console.log(len);
					var tempids = [];
					if (len > 24) {
						for (var i = 0; i < Math.ceil(len / 24); i++) {
//							console.log(i);
							var stp = i * 24;
							var etp = (i + 1) * 24;
							if (etp > len) {
								etp = len;
							}
							tempids.push(id.substring(stp, etp));
//							console.log(id.substring(stp, etp));
						}
					}
					else {
						tempids.push(id);
					}

					var decoid = "";

					async.each(tempids, function (data, callback) {
						resproc.resdataproc(data, function (err, tresult) {
//							console.log(data);
//							console.log(result);
							decoid += tresult;
						});
						callback();
					});

					// 이미 업데이트된 경우
					var title = "[캐리커쳐 마키] 주문이 도착했습니다.";
					var content = "작가 웹 페이지에 가셔서 확인해주세요 ^^";
					var data = [title, content];
					user.getemailsn(function (err, results) {
						if (results.length != undefined) {
							var user;
							var email_sn = results[0].email_sn;

							user.setemailsn(email_sn, 0, function (err, sresult1) {
								if (email_sn == 0) {
									user = 'omavmail@gmail.com';
								} else if (email_sn == 1) {
									user = 'omavmail1@gmail.com';
								} else if (email_sn == 2) {
									user = 'omavmail2@gmail.com';
								} else if (email_sn == 3) {
									user = 'omavmail3@gmail.com';
								}
								var smtpTransport = nodemailer.createTransport("SMTP", {
									service: 'Gmail',
									auth: {
										user: user,
										pass: '11dhakqmTJQ' //password 입력
									}
								});

								/*sendmail({
								    from: 'my@omybrand.com',
								    to: decoid,
								    subject: title,
								    content: content,
								  }, function(err, reply) {
								    console.log(err && err.stack);
								    console.dir(reply);
								});*/

								var mailOptions = {
									from: '<omavmail@gmail.com>',
									to: decoid,
									subject: title,
									text: content
								};

								console.log('mail 옵션 설정 완료!');
								smtpTransport.sendMail(mailOptions, function (err, response){
									if (err){
										console.log(err);
									} else {
										console.log("Message sent : " + response.message);
									}
									smtpTransport.close();
									user.setemailsn(email_sn, 1, function (err, sresult2) {
										console.log('이메일 해제');
									});
								});
							});
						}
					});
				});
			} else {
				console.log('실패함 - 기타');
				res.send('FAIL');
			}
		});
	} else if (req.body.Resultcd != undefined) {
		// 해당 주문번호 검색해서 삭제하기 추가해야함
		order_app.showorderinfo(req.body.Tradeid, function (err, results) {
			if (err) console.log(err);
			var tempphoto = results[0].photo;
			var s = tempphoto.split("/");
			var real = true;
			var user_sn = "";
			var state = "";
			var temppath = "";

			for (var i in s) {
				if (real) {
					if (state == "userfolder") {
						user_sn = s[i];
					}
					temppath = temppath + "/" + s[i];
				}
				if (s[i] == "chm") {
					real = true;
					state = "uploads";
				}
				if (s[i] == "uploads") {
					state = "userfolder";
				}
			}

			var realphotopath = path.resolve(__dirname, '..', temppath);
			fs.unlinkSync(realphotopath);

			var tempthumb = results[0].thumb;
			s = tempthumb.split("/");
			real = true;
			state = "";
			temppath = "";

			for (var i in s) {
				if (real) {
					temppath = temppath + "/" + s[i];
				}
				if (s[i] == "chm") {
					real = true;
					state = "uploads";
				}
			}

			var realthumbpath = path.resolve(__dirname, '..', temppath);
			fs.unlinkSync(realthumbpath);

			order_app.cancelorder(req.body.Tradeid, function (err, result) {
				if (err) console.log(err);
				if (result.affectedRows == 1) {
					// 주문 취소 완료
					res.send('SUCCESS');
				}
				else {
					// DB 에러 문제
					res.send('FAIL');
				}
			});
		});
	} else {
		console.log(ip + "에서의 잘못된 접근이 감지되었습니다.");
		res.send('SUCCESS');
	}
};


// 주문 취소 (앱)
exports.cancelOrder = function(req, res)  {
	try {
//		console.log('userid', req.body.userid);
    	var id = req.body.user_id;
		var pwd = req.body.user_pwd;
		var order_sn = req.body.order_sn;

		var hashpwd;
		var chmdatas = [];
		var len = id.length;
//		console.log(len);
		var tempids = [];
		if (len > 14) {
			for (var i = 0; i < Math.ceil(len / 14); i++) {
//				console.log(i);
				var stp = i * 14;
				var etp = (i + 1) * 14;
				if (etp > len) {
					etp = len;
				}
				tempids.push(id.substring(stp, etp));
//				console.log(id.substring(stp, etp));
			}
		}
		else {
			tempids.push(id);
		}

		var encoid = "";

		async.each(tempids, function (data, callback) {
			reqproc.reqdataproc(data, function (err, result) {
//				console.log(data);
//				console.log(result);
				encoid += result;
			});
			callback();
		});

//		console.log("encoid", encoid);

		// 비밀번호 해쉬
		reqproc.reqpwdproc(pwd, function (err, result) {
			hashpwd = result;
		});

		user.login(encoid, hashpwd, function (err, msg) {
			if (err) console.error('err user.login 1 ', err);
			if (msg.result == 'success'){
				if (err) console.error('err user.login 2', err);

				order_app.showorderinfo(order_sn, function (err, results) {
					if (err) console.log(err);
					var tempphoto = results[0].photo;
					var s = tempphoto.split("/");
					var real = false;
					var user_sn = "";
					var state = "";
					var temppath = "";

					for (var i in s) {
						if (real) {
							if (state == "userfolder") {
								user_sn = s[i];
							}
							temppath = temppath + "/" + s[i];
						}
						if (s[i] == "chm") {
							real = true;
							state = "uploads";
						}
						if (s[i] == "uploads") {
							state = "userfolder";
						}
					}

					var realphotopath = path.resolve(__dirname, '..', temppath);
					if (fs.existSync(realphotopath)) {
						fs.unlinkSync(realphotopath);
					}

					var tempthumb = results[0].thumb;
					s = tempthumb.split("/");
					real = false;
					state = "";
					temppath = "";

					for (var i in s) {
						if (real) {
							temppath = temppath + "/" + s[i];
						}
						if (s[i] == "chm") {
							real = true;
							state = "uploads";
						}
					}

					var realthumbpath = path.resolve(__dirname, '..', temppath);
					if (fs.existSync(realthumbpath)) {
						fs.unlinkSync(realthumbpath);
					}

					order_app.cancelorder(order_sn, encoid, 0, function (err, result) {
//						console.log('chmorderlist pool에 들어왔숑~');
						if(err){
							res.json({result: "fail", msg: err});
						} else if (result.affectedRows == 0) {
							res.json({ result: "fail", msg: "no order" })
						} else {
							res.json({ result: "success", msg: "" });
						}
					});
				});
			} else if (msg.result == 'fail') {
				if (msg.msg == 'id') {
					res.json({ result: "fail", msg: "id" });
				} else if (msg.msg == 'pwd') {
					res.json({ result: "fail", msg: "pwd" });
				}
			}
		});

	} catch(err) {
    	if(err) console.error('err', err);
	}
};


// 주문 취소 (웹)
// exports.cancelOrder = function(req, res)  {
// 	try {
// 		// console.log('userid', req.body.userid);
//     		var id = req.body.user_id;
// 		var pwd = req.body.user_pwd;
// 		var order_sn = req.body.order_sn;

// 		var hashpwd;
// 		var chmdatas = [];
// 		var len = id.length;
// 		console.log(len);
// 		var tempids = [];
// 		if (len > 14) {
// 			for (var i = 0; i < Math.ceil(len / 14); i++) {
// 				// console.log(i);
// 				var stp = i * 14;
// 				var etp = (i + 1) * 14;
// 				if (etp > len) {
// 					etp = len;
// 				}
// 				tempids.push(id.substring(stp, etp));
// 				console.log(id.substring(stp, etp));
// 			}
// 		}
// 		else {
// 			tempids.push(id);
// 		}

// 		var encoid = "";

// 		async.each(tempids, function (data, callback) {
// 			reqproc.reqdataproc(data, function (err, result) {
// 				console.log(data);
// 				console.log(result);
// 				encoid += result;
// 			});
// 			callback();
// 		});

//		// console.log("encoid", encoid);

// 		// 비밀번호 해쉬
// 		reqproc.reqpwdproc(pwd, function (err, result) {
// 			hashpwd = result;
// 		});

// 		user.login(encoid, hashpwd, function (err, msg) {
// 			if (err) console.error('err user.login 1 ', err);
// 			if (msg.result == 'success'){
// 				if (err) console.error('err user.login 2', err);
// 				order_app.cancelorder(order_sn, encoid, 0, function (err, result) {
//					// console.log('chmorderlist pool에 들어왔숑~');
// 					if(err){
// 						res.json({result: "fail", msg: err});
// 					} else if (result.affectedRows == 0) {
// 						res.json({ result: "fail", msg: "no order" })
// 					} else {
// 						res.json({ result: "success", msg: "" });
// 					}
// 				});
// 			} else if (msg.result == 'fail') {
// 				if (msg.msg == 'id') {
// 					res.json({ result: "fail", msg: "id" });
// 				} else if (msg.msg == 'pwd') {
// 					res.json({ result: "fail", msg: "pwd" });
// 				}
// 			}
// 		});

// 	} catch(err) {
//     	if(err) console.error('err', err);
// 	}
// };

// 주문 정보 수정
/*exports.updateOrder = function (req, res) {

};*/

// 요구사항 임시 수정
exports.updatereqOrder = function (req, res) {
	try {
		if (req.body.user_id == null || req.body.user_id == undefined || req.body.user_id == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.user_pwd == null || req.body.user_pwd == undefined || req.body.user_pwd == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.order_sn == null || req.body.order_sn == undefined || req.body.order_sn == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.userreq == null || req.body.userreq == undefined || req.body.userreq == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

   		var id = req.body.user_id;
		var pwd = req.body.user_pwd;
		var order_sn = req.body.order_sn;
		var userreq = req.body.userreq;

		var hashpwd;
		var chmdatas = [];
		var len = id.length;
//		console.log(len);
		var tempids = [];
		if (len > 14) {
			for (var i = 0; i < Math.ceil(len / 14); i++) {
//				console.log(i);
				var stp = i * 14;
				var etp = (i + 1) * 14;
				if (etp > len) {
					etp = len;
				}
				tempids.push(id.substring(stp, etp));
//				console.log(id.substring(stp, etp));
			}
		}
		else {
			tempids.push(id);
		}

		var encoid = "";

		async.each(tempids, function (data, callback) {
			reqproc.reqdataproc(data, function (err, result) {
//				console.log(data);
//				console.log(result);
				encoid += result;
			});
			callback();
		});

//		console.log("encoid", encoid);

		// 비밀번호 해쉬
		reqproc.reqpwdproc(pwd, function (err, result) {
			hashpwd = result;
		});

		user.login(encoid, hashpwd, function (err, msg) {
			if (err) console.error('err user.login 1 ', err);
			if (msg.result == 'success'){
				if (err) console.error('err user.login 2', err);
				order_app.updatereqorder(order_sn, userreq, function (err, result) {
//					console.log('chmorderlist pool에 들어왔숑~');
					if(err){
						res.json({result: "fail", msg: err});
					} else if (result.affectedRows == 0) {
						res.json({ result: "fail", msg: "no order" })
					} else {
						res.json({ result: "success", msg: "" });
					}
				});
			} else if (msg.result == 'fail') {
				if (msg.msg == 'id') {
					res.json({ result: "fail", msg: "id" });
				} else if (msg.msg == 'pwd') {
					res.json({ result: "fail", msg: "pwd" });
				}
			}
		});
	} catch (err) {
		if (err) console.error('err', err);
	}
};


// 검수가 필요한 주문 리스트 보여주기
/*exports.checkneedlist = function (req, res) {
	try {
		order_app.checkneedlist(function (err, datas) {
    		console.log('chmorderlist pool에 들어왔숑~');
     		if(err){
     			res.json({result: "fail", msg: err});
     		} else {
     			if (datas != null && datas != undefined && datas != 0) {
     				async.each(datas, function(item, callback) {
     					var id = item.user_id;
        				var len = id.length;
//        				console.log(len);
        				var tempids = [];
        				if (len > 24) {
        					for (var i = 0; i < Math.ceil(len / 24); i++) {
//        						console.log(i);
        						var stp = i * 24;
        						var etp = (i + 1) * 24;
        						if (etp > len) {
        							etp = len;
        						}
        						tempids.push(id.substring(stp, etp));
//        						console.log(id.substring(stp, etp));
        					}
        				}
        				else {
        					tempids.push(id);
        				}

        				var decoid = "";

        				async.each(tempids, function (data, callback) {
        					resproc.resdataproc(data, function (err, tresult) {
//        						console.log(data);
//        						console.log(result);
        						decoid += tresult;
        					});
        					callback();
        				});

//        				console.log(decoid);

        				item.user_id = decoid;
        				callback();
     				});
     				res.json({result: "success", data: datas});
    			}
     			else {
     				res.json({result: "success", data: []});
     			}
     		}
    	});
	} catch (err) {
		if (err) console.error('err', err);
	}
};*/


// 해당 주문의 검수 상태 변경하기
exports.changecheck = function (req, res) {
	try {
		if (req.body.order_sn == null || req.body.order_sn == undefined || req.body.order_sn == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.artist_id == null || req.body.artist_id == undefined || req.body.artist_id == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

		if (req.body.order_sn != undefined && req.body.artist_id != undefined) {
			console.log(req.body.order_sn);
			var order_sn = req.body.order_sn;
			// console.log(req.body.artist_id);

			var id = req.body.artist_id;
			var len = id.length;
			// console.log(len);
			var tempids = [];
			if (len > 24) {
				for (var i = 0; i < Math.ceil(len / 24); i++) {
					// console.log(i);
					var stp = i * 24;
					var etp = (i + 1) * 24;
					if (etp > len) {
						etp = len;
					}
					tempids.push(id.substring(stp, etp));
					// console.log(id.substring(stp, etp));
				}
			}
			else {
				tempids.push(id);
			}

			var decoid = "";

			async.each(tempids, function (data, callback) {
				resproc.resdataproc(data, function (err, tresult) {
					// console.log(data);
					// console.log(result);
					decoid += tresult;
				});
				callback();
			});

			// console.log(decoid);

			order_app.changecheck(order_sn, function (err, result) {
				if (err) {
					res.send("<script>alert('작업이 실패하였습니다. 관리자에게 문의해주세요.');</script>");
					// res.json({ result: "fail", msg: err });
				} else {
					if (result.affectedRows == 1) {
						// res.send("<script>alert('변환이 완료되었습니다.');</script>");
						order_app.getregistid(order_sn, function (err, results) {
							console.log(results[0].registid);
							var gcmcustomer = results[0].registid;
							var title = "[캐리커쳐 마키] 상품 검수가 완료되었습니다 .";
							var content = "작가 웹 페이지에 가셔서 상태 여부 변경을 해 주세요 ^^.\r\n 만약 작가 활동 여부를 안 바꾸시면 주문을 받으실 수 업어요.";
							var data = [title, content];
							// console.log ('sendmail.js data :', data);
							user.getemailsn(function (err, results) {
								if (results.length != undefined) {
									var user;
									var email_sn = results[0].email_sn;

									user.setemailsn(email_sn, 0, function (err, sresult1) {
										if (email_sn == 0) {
											user = 'omavmail@gmail.com';
										} else if (email_sn == 1) {
											user = 'omavmail1@gmail.com';
										} else if (email_sn == 2) {
											user = 'omavmail2@gmail.com';
										} else if (email_sn == 3) {
											user = 'omavmail3@gmail.com';
										}
										var smtpTransport = nodemailer.createTransport("SMTP", {
											service: 'Gmail',
											auth: {
												user: user,
												pass: '11dhakqmTJQ' //password 입력
											}
										});

										var mailOptions = {
											from: '<omavmail@gmail.com>',
											to: decoid,
											subject: title,
											text: content
										};

										console.log('mail 옵션 설정 완료!');
										smtpTransport.sendMail(mailOptions, function (err, response){
											if (err){
												console.log(err);
												res.send('<script>alert("주문이 검수되었지만 작가에게 알림을 보내는데 실패했습니다. 관리자에게 문의해주세요.^^");location.href="/chm/manage";</script>');
											} else {
												console.log("Message sent : " + response.message);
												var message = new gcm.Message();
												var sender = new gcm.Sender('AIzaSyBD9Y9gdb82fAJBaPjXHf3iiGM0L8B3zIo');

												console.log(gcmcustomer);
												message.addData('msg', '주문하신 작품이 완료되었어요! 이메일을 확인해주세요~!');
												message.collapseKey = 'omybrand';
												message.delayWhileIdle = true;
												message.timeToLive = 3;
												sender.send(message, [gcmcustomer], 4, function (err, result) {
													if (err) {
														res.send('<script>alert("사용자에게 GCM 전송이 실패했습니다.");location.href="/chm/manage";</script>');
													}
													else {
														res.send('<script>alert("사용자에게 GCM 전송이 완료되었습니다.");location.href="/chm/manage";</script>');
													}
													console.log('result', result);
												});
											}
											var stop = new Date().getTime();
											while (new Date().getTime() < stop + 10000) {
												;
											}
											user.setemailsn(email_sn, 1, function (err, sresult2) {
												console.log('이메일 해제');
											});
											smtpTransport.close();
										});
									});
								}
							});
						});
					}
					else {
						res.send("<script>alert('유효하지 않은 작업입니다.');location.href='/chm/manage';</script>");
					}
				}
			});
		}
	} catch (err) {
		if (err) console.error('err', err);
	}
};