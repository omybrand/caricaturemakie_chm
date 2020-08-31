var config  = require('../config/config');
var orderlist = require('../models/orderlist');
var reserve = require('../models/reserve');
var user = require('../models/user');
var async = require('async');
var security = require('../utility/security');
var util = require('../utility/util');
var log = require('../models/log');
var path = require('path');
var fs = require('fs');
var gcm = require('node-gcm');
var Cron = require('cron').CronJob;
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var htmlToText = require('nodemailer-html-to-text').htmlToText;

// 결제가 되지 않은 주문 삭제
var delinvalidjob = new Cron({
	cronTime: '00 00 00 * * *',
	onTick: function () {
		// 결제 되지 않은 주문 내역 가져오기
		orderlist.showinvalidorder(function (err, results) {
			async.each(results, function (data, callback) {
				if (err) console.error(err);
				if (data.order_photo1 != "") {
					var photo1 = data.order_photo1;
					var photo2 = data.order_photo2;
					var photo3 = data.order_photo3;
					var arr = photo1.split("/");
					var name = arr[arr.length - 1];
					var foldername = name.substring(0, 12);
					var realpath1 = path.resolve(__dirname, '..', 'public', 'imgs', 'uploads', foldername, name);
					if (photo2 != null) {
						arr = photo2.split("/");
						name = arr[arr.length - 1];
						foldername = name.substring(0, 12);
						var realpath2 = path.resolve(__dirname, '..', 'public', 'imgs', 'uploads', foldername, name);
					}

					if (photo3 != null) {
						arr = photo3.split("/");
						name = arr[arr.length - 1];
						foldername = name.substring(0, 12);
						var realpath3 = path.resolve(__dirname, '..', 'public', 'imgs', 'uploads', foldername, name);
					}

					// 주문 삭제(사진 있음)
					orderlist.delorder(data.order_sn, function (err, result) {
						if(err){
							callback();
						} else if (result.affectedRows == 0) {
							callback();
						} else {
							if (fs.existsSync(realpath1)) {
								// fs.unlinkSync(realpath1);
							}
							if (fs.existsSync(realpath2)) {
								// fs.unlinkSync(realpath2);
							}
							if (fs.existsSync(realpath3)) {
								// fs.unlinkSync(realpath3);
							}
							callback();
						}
					});
				} else {
					// 주문 삭제(사진 없음)
					orderlist.delorder(data.order_sn, function (err, result) {
						if(err){
							callback();
						} else if (result.affectedRows == 0) {
							callback();
						} else {
							callback();
						}
					});
				}
			});
		});
	},
	start: false
});

// 완료된 작업(사진만 삭제)
var delcompletejob = new Cron({
	cronTime: '00 00 00 * * *',
	onTick: function () {
		// 검수까지 끝난 주문 내역 얻기
		orderlist.showcompleteorder(function (err, results) {
			async.each(results, function (data, callback) {
				if (err) console.error(err);
				if (data.order_photo1 != "") {
					var photo1 = data.order_photo1;
					var photo2 = data.order_photo2;
					var photo3 = data.order_photo3;
					var arr = photo1.split("/");
					var name = arr[arr.length - 1];
					var foldername = name.substring(0, 12);
					var realpath1 = path.resolve(__dirname, '..', 'public', 'imgs', 'uploads', foldername, name);
					if (photo2 != null) {
						arr = photo2.split("/");
						name = arr[arr.length - 1];
						foldername = name.substring(0, 12);
						var realpath2 = path.resolve(__dirname, '..', 'public', 'imgs', 'uploads', foldername, name);
					}

					if (photo3 != null) {
						arr = photo3.split("/");
						name = arr[arr.length - 1];
						foldername = name.substring(0, 12);
						var realpath3 = path.resolve(__dirname, '..', 'public', 'imgs', 'uploads', foldername, name);
					}

					// 지워야할 사진 경로 얻기
					orderlist.delphotopath(data.order_sn, function (err, result) {
						if(err){
							callback();
						} else if (result.affectedRows == 0) {
							callback();
						} else {
							if (fs.existsSync(realpath1)) {
								// fs.unlinkSync(realpath1);
							}
							if (fs.existsSync(realpath2)) {
								// fs.unlinkSync(realpath2);
							}
							if (fs.existsSync(realpath3)) {
								// fs.unlinkSync(realpath3);
							}
							callback();
						}
					});
				} else {
					// 지워야할 사진 경로 얻기
					orderlist.delphotopath(data.order_sn, function (err, result) {
						if(err){
							callback();
						} else if (result.affectedRows == 0) {
							callback();
						} else {
							if (fs.existsSync(realpath1)) {
								// fs.unlinkSync(realpath1);
							}
							if (fs.existsSync(realpath2)) {
								// fs.unlinkSync(realpath2);
							}
							if (fs.existsSync(realpath3)) {
								// fs.unlinkSync(realpath3);
							}
							callback();
						}
					});
				}
			});
		});
	},
	start: false
});

//delinvalidjob.start();
delcompletejob.start();

// 주문하기
exports.addOrder = function (req, res) {
	try {
		var reserve_sn = req.body.reserve_sn;
		if (reserve_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		var user_sn = req.body.user_sn;
		if (user_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		var confirmdate = req.body.confirmdate;
		if (confirmdate == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		var pay = parseInt(req.body.pay);
		if (pay == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		var mileage = parseInt(req.body.mileage);
		if (mileage == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		// console.log(confirmdate);

		// var coupon = req.body.coupon;
		// if (confirmdate == undefined) {
		// 	res.json({ result: 'fail', msg: 'invalid' });
		// 	return;
		// }

		// 예약 정보 얻기
		reserve.getreservationinfo(reserve_sn, function (err, result) {
			if (err) {
				console.error(err);
				res.json({ result: 'fail', msg: err });
			} else {
				if (result.length != 0) {
					// res.json({ result: 'success', datas: result[0] });
					if (result[0].reserve_user_sn == user_sn) {
						var datas = [];
						// 마지막 주문 일련번호 얻기
						orderlist.checksn(function (err, results) {
							if (err) console.log('err', err);
							// console.log('result', results);
							if (results == undefined || results == null || results.length == 0) {
								number = 1;
								// 주문 일련번호 생성
								util.leadingZeros(number, 8, function (tempnum) {
									var order_sn = "chmo" + tempnum;
									datas.push(order_sn);
									datas.push(user_sn);
									datas.push(result[0].reserve_artist_sn);
									datas.push(result[0].reserve_style_sn);
									datas.push(result[0].reserve_photo1);
									if (result[0].reserve_photo2 != null) {
										datas.push(result[0].reserve_photo2);
									}

									if (result[0].reserve_photo3 != null) {
										datas.push(result[0].reserve_photo3);
									}

									datas.push(result[0].reserve_req);							// 요구사항
									datas.push(result[0].reserve_size);						// 작업 사이즈
									datas.push(result[0].reserve_select);						// 선택한 작업 스타일
									datas.push(result[0].reserve_pcount);						// 사람 인원 수
									datas.push(result[0].reserve_price);						// 가격(추가비용 제외)
									datas.push(confirmdate);								// 완성 날짜
									datas.push(0);											// 쿠폰 사용 여부
									datas.push(result[0].reserve_addpay);						// 추가 비용
									datas.push(pay);											// 결제 수단
									datas.push('');											// 기본 주소
									datas.push('');											// 상세 주소
									datas.push('');											// 주문자 전화번호
									datas.push('');											// 택배 번호
									datas.push('');											// 주문자 이름
									datas.push(mileage);									// 마일리지

									// console.log(datas);

									if (result[0].reserve_photo2 != null) {
										if (result[0].reserve_photo3 != null) {
											// 사진 3개짜리 주문 넣기
											orderlist.addorder3(datas, function (err, oresult){
												if (err) console.error(err);
												if (oresult.affectedRows == 1) {
													// 사용한 마일리지 반영하기
													user.submileage(user_sn, mileage, function (err, sresult) {
														if (err) console.error(err);
														res.json({ result: 'success', msg: '', order_sn: order_sn });
													});
												} else {
													res.json({ result: 'fail', msg: err });
												}
											});
										} else {
											// 사진 2개짜리 주문 넣기
											orderlist.addorder2(datas, function (err, oresult){
												if (err) console.error(err);
												if (oresult.affectedRows == 1) {
													// 사용한 마일리지 반영하기
													user.submileage(user_sn, mileage, function (err, sresult) {
														if (err) console.error(err);
														res.json({ result: 'success', msg: '', order_sn: order_sn });
													});
												} else {
													res.json({ result: 'fail', msg: err });
												}
											});
										}
									} else {
										// 사진 1개짜리 주문 넣기
										orderlist.addorder1(datas, function (err, oresult){
											if (err) console.error(err);
											if (oresult.affectedRows == 1) {
												// 사용한 마일리지 반영하기
												user.submileage(user_sn, mileage, function (err, sresult) {
													if (err) console.error(err);
													res.json({ result: 'success', msg: '', order_sn: order_sn });
												});
											} else {
												res.json({ result: 'fail', msg: err });
											}
										});
									}
								});
							} else {
								// 주문 일련번호 생성
								number = parseInt(results[0].order_sn.substring(4, 12)) + 1;
								util.leadingZeros(number, 8, function (tempnum) {
									var order_sn = "chmo" + tempnum;
									datas.push(order_sn);
									datas.push(user_sn);
									datas.push(result[0].reserve_artist_sn);
									datas.push(result[0].reserve_style_sn);
									datas.push(result[0].reserve_photo1);
									if (result[0].reserve_photo2 != null) {
										datas.push(result[0].reserve_photo2);
									}

									if (result[0].reserve_photo3 != null) {
										datas.push(result[0].reserve_photo3);
									}

									datas.push(result[0].reserve_req);							// 요구사항
									datas.push(result[0].reserve_size);						// 작업 사이즈
									datas.push(result[0].reserve_select);						// 선택한 작업 스타일
									datas.push(result[0].reserve_pcount);						// 사람 인원 수
									datas.push(result[0].reserve_price);						// 가격(추가비용 제외)
									datas.push(confirmdate);								// 완성 날짜
									datas.push(0);											// 쿠폰 사용 여부
									datas.push(result[0].reserve_addpay);						// 추가 비용
									datas.push(pay);											// 결제 수단
									datas.push('');											// 기본 주소
									datas.push('');											// 상세 주소
									datas.push('');											// 주문자 전화번호
									datas.push('');											// 택배 번호
									datas.push('');											// 주문자 이름
									datas.push(mileage);									// 마일리지


									if (result[0].reserve_photo2 != null) {
										if (result[0].reserve_photo3 != null) {
											// 사진 3개짜리 주문 넣기
											orderlist.addorder3(datas, function (err, oresult){
												if (err) console.error(err);
												if (oresult.affectedRows == 1) {
													// 사용한 마일리지 반영하기
													user.submileage(user_sn, mileage, function (err, sresult) {
														if (err) console.error(err);
														res.json({ result: 'success', msg: '', order_sn: order_sn });
													});
												} else {
													res.json({ result: 'fail', msg: err });
												}
											});
										} else {
											// 사진 2개짜리 주문 넣기
											orderlist.addorder2(datas, function (err, oresult){
												if (err) console.error(err);
												if (oresult.affectedRows == 1) {
													// 사용한 마일리지 반영하기
													user.submileage(user_sn, mileage, function (err, sresult) {
														if (err) console.error(err);
														res.json({ result: 'success', msg: '', order_sn: order_sn });
													});
												} else {
													res.json({ result: 'fail', msg: err });
												}
											});
										}
									} else {
										// 사진 1개짜리 주문 넣기
										orderlist.addorder1(datas, function (err, oresult){
											if (err) console.error(err);
											if (oresult.affectedRows == 1) {
												// 사용한 마일리지 반영하기
												user.submileage(user_sn, mileage, function (err, sresult) {
													if (err) console.error(err);
													res.json({ result: 'success', msg: '', order_sn: order_sn });
												});
											} else {
												res.json({ result: 'fail', msg: err });
											}
										});
									}
								});
							}
						});
					} else {
						res.json({ result: 'fail', msg: 'reserve_sn' });
					}
				} else {
					res.json({ result: 'fail', msg: 'no reservation' });
				}
			}
		});
	} catch (err) {
		console.error(err);
	}
};


// 결제 완료하기(휴대폰)
exports.validOrder = function (req, res) {
	// console.log(req);
	try {
		var Resultcd = req.body.Resultcd;
		var Tradeid = req.body.Tradeid;
		// console.log(req.body);
		if (Resultcd != undefined && Tradeid != undefined) {
			// 결제 완료 시
			if (Resultcd == '0000') {
				// 주문 유효하게 하기
				orderlist.validorder(Tradeid, function (err, result) {
					if (err) {
						console.error(err);
						// PG사 쪽 전송(DB 실패시)
						res.send("FAIL");
					} else {
						// 실제 주문 번호 넣기(PG사 측)
						orderlist.getorderserver(Tradeid, function (err, gresult) {
							var user_sn = gresult[0].order_user_sn;
							var price = gresult[0].order_price;
							var addpay = gresult[0].order_addpay;
							var mileage = gresult[0].order_mileage;
							var addmile = (price + addpay - mileage) * 0.01;
							// 마일리지 적립
							user.addmileage(user_sn, addmile, function (err, aresult) {
								if (err) {
									// PG사 쪽 전송(DB 성공시)
									res.send("SUCCESS");
								} else {
									// 작가 아이디 얻기
									orderlist.getartistid(Tradeid, function (err, iresult) {
										if (err) console.error(err);
										if (iresult[0].artist_id != undefined) {
											// 작가 아이디 복호화
											security.security_decodata(iresult[0].artist_id, function (decoid) {
												var transport = nodemailer.createTransport(smtpTransport({
													host: 'localhost'
												}));

												transport.use('compile', htmlToText());

												var content = '<div id="frame"><a href="https://www.omybrand.com/chm/artist/login"> 주문 확인하러 가기 </a></div>';
												var content2 = '<div id="frame"><a href="https://www.omybrand.com/chm/manage/login"> 주문 확인하러 가기 </a></div>';

												var mailOptions = {
													from: 'my@omybrand.com',
													to: decoid,
													subject: '[캐리커쳐 마키] 작가 페이지에서 주문을 확인해주세요',
													html: content
												};

												// console.log('mail 옵션 설정 완료!');
												transport.sendMail(mailOptions, function (err, response){
													if (err){
														console.log(err);
														// PG사 쪽 전송(DB 성공시)
														res.send("SUCCESS");
													} else {
														// console.log("Message sent : " + response.message);
														// PG사 쪽 전송(DB 성공시)
														res.send("SUCCESS");
													}
													transport.close();
												});

												var mailOptions2 = {
													from: '<omavmail@omybrand.com>',
													to: '<my@omybrand.com>',
													subject: '[캐리커쳐 마키] 관리자 페이지에서 주문을 확인해주세요',
													html: content2 + '<br>' + decoid + '<br>(핸드폰)'
												};

												// console.log('mail 옵션 설정 완료!');
												transport.sendMail(mailOptions2, function (err, response){
													if (err){
														console.log(err);
														// res.json({ result : 'fail', msg : err });
													} else {
														// console.log("Message sent : " + response.message);
														// res.json({ result : 'success' });
													}
													transport.close();
												});
											});
										}
									});
								}
							});
						});
					}
				});
			}
		} else {
			// 실제 주문 번호 얻기(PG사)
			orderlist.getorderserver(Tradeid, function (err, gresult) {
				var user_sn = gresult[0].order_user_sn;
				var price = gresult[0].order_price;
				var addpay = gresult[0].order_addpay;
				var mileage = gresult[0].order_mileage;
				// 마일리지 적립
				user.addmileage(user_sn, mileage, function (err, aresult) {
					if (err) {
						// PG사 쪽 전송(DB 실패시)
						res.send("FAIL");
					} else {
						// PG사 쪽 전송(DB 성공시)
						res.send("SUCCESS");
					}
				});
			});
		}
	} catch (err) {
		console.error(err);
		// PG사 쪽 전송(DB 실패시)
		res.send("FAIL");
	}
};

// 결제 완료시 보여줄 페이지(휴대폰)
exports.okOrder = function (req, res) {
	try {
		var Resultcd = req.body.Resultcd;
		var Tradeid = req.body.Tradeid;
		var Prdtnm = req.body.Prdtnm;
		var Prdtprice = req.body.Prdtprice;
		// console.log(req.body);
		res.render('o_finishmobile', { code: Resultcd });
	} catch (err) {
		console.error(err);
	}
};

// 신용카드 결제시 결제 완료 확인(앱에서 요청)
exports.confirmValid = function (req, res) {
	// console.log(req);
	try {
		var user_sn = req.body.user_sn;
		var order_sn = req.body.order_sn;

		// 주문이 유효 상태인지 확인
		orderlist.confirmvalid(user_sn, order_sn, function (err, result) {
			if (err) console.error(err);
			if (result[0].cnt == 1) {
				// 작가 아이디 얻기
				orderlist.getartistid(order_sn, function (err, iresult) {
					if (err) console.error(err);
					if (iresult[0].artist_id != undefined) {
						// 작가 아이디 복호화
						security.security_decodata(iresult[0].artist_id, function (decoid) {
							var transport = nodemailer.createTransport(smtpTransport({
								host: 'localhost'
							}));

							transport.use('compile', htmlToText());

							var content = '<div id="frame"><a href="https://www.omybrand.com/chm/artist/login"> 주문 확인하러 가기 </a></div>';
							var content2 = '<div id="frame"><a href="https://www.omybrand.com/chm/manage/login"> 주문 확인하러 가기 </a></div>';

							var mailOptions = {
								from: 'my@omybrand.com',
								to: decoid,
								subject: '[캐리커쳐 마키] 작가 페이지에서 주문을 확인해주세요',
								html: content
							};

							// console.log('mail 옵션 설정 완료!');
							transport.sendMail(mailOptions, function (err, response){
								if (err){
									console.error(err);
									res.json({ result: 'success' });
								} else {
									// console.log("Message sent : " + response.message);
									res.json({ result: 'success' });
								}
								transport.close();
							});

							var mailOptions2 = {
								from: '<omavmail@omybrand.com>',
								to: '<my@omybrand.com>',
								subject: '[캐리커쳐 마키] 관리자 페이지에서 주문을 확인해주세요',
								html: content2 + '<br>' + decoid + '<br>(신용카드)'
							};

							// console.log('mail 옵션 설정 완료!');
							transport.sendMail(mailOptions2, function (err, response){
								if (err){
									console.log(err);
									// res.json({ result : 'fail', msg : err });
								} else {
									// console.log("Message sent : " + response.message);
									// res.json({ result : 'success' });
								}
								transport.close();
							});
						});
					}
				});
			} else {
				res.json({ result: 'fail' });
			}
		});
	} catch (err) {
		console.error(err);
		res.json({ result: 'fail' });
	}
};

// 주문 취소(결제 실패시) - 예약은 안 지움
exports.cancelOrder = function (req, res) {
	try {
		// var order_sn = req.body.order_sn;
		// if (order_sn == undefined) {
		// 	res.json({ result: 'fail', msg: 'invalid' });
		// 	return;
		// }

		// var user_sn = req.body.user_sn;
		// if (user_sn == undefined) {
		// 	res.json({ result: 'fail', msg: 'invalid' });
		// 	return;
		// }
		// console.log(req.body);
		// orderlist.cancelorder(order_sn, user_sn, function (err, result) {
			// if (err) {
				// console.error(err);
			// } else {
				res.json({ result: 'success', msg: ''});
			// }
		// });
	} catch (err) {
		console.error(err);
		res.json({ result: 'fail', msg: err });
	}
};

// 내 주문 리스트 확인하기
exports.listOrder = function (req, res) {
	try {
		var user_sn = req.body.user_sn;
		if (user_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		var state = req.body.state;
		if (state == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		// console.log(req.body);

		// 주문 내역 얻기(상태별)
		orderlist.listorder(user_sn, state, function (err, results) {
			if (err) {
				console.error(err);
				res.json({ result: 'fail', msg: err });
			} else {
				res.json({ result: 'success', datas: results });
			}
		})
	} catch (err) {
		console.error(err);
		res.json({ result: 'fail', msg: err });
	}
};

// 주문 상세정보 확인하기
exports.infoOrder = function (req, res) {
	try {
		var user_sn = req.body.user_sn;
		if (user_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		var order_sn = req.body.order_sn;
		if (order_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		// console.log(req.body);

		// 해당 주문 정보 얻기
		orderlist.infoorder(user_sn, order_sn, function (err, result) {
			if (err) {
				console.error(err);
				res.json({ result: 'fail', msg: err });
			} else {
				res.json({ result: 'success', data: result[0] });
			}
		})
	} catch (err) {
		console.error(err);
		res.json({ result: 'fail', msg: err });
	}
};


// 주문 평가 여부 확인하기
exports.scoreOrder = function (req, res) {
	try {
		var user_sn = req.body.user_sn;
		if (user_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		var order_sn = req.body.order_sn;
		if (order_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		// console.log(req.body);

		// 해당 주문 평가 얻기
		orderlist.getscore(user_sn, order_sn, function (err, result) {
			if (err) {
				console.error(err);
				res.json({ result: 'fail', msg: err });
			} else {
				if (result[0] != undefined) {
					res.json({ result: 'success', score: result[0].order_rate });
				} else {
					res.json({ result: 'fail', msg: '' });
				}
			}
		})
	} catch (err) {
		console.error(err);
		res.json({ result: 'fail', msg: err });
	}
};


// 주문 평가하기
exports.rateOrder = function (req, res) {
	try {
		var user_sn = req.body.user_sn;
		if (user_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		var order_sn = req.body.order_sn;
		if (order_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		var score = req.body.score;
		if (score == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		var reply = req.body.reply;
		if (score == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		// 평가 점수 매기기
		orderlist.updatescore(user_sn, order_sn, score, reply, function (err, result) {
			if (err) {
				console.error(err);
				res.json({ result: 'fail', msg: err });
			} else {
				res.json({ result: 'success', msg: '' });
			}
		})
	} catch (err) {
		console.error(err);
		res.json({ result: 'fail', msg: err });
	}
};

exports.showReply = function (req, res) {
	try {
		var style_sn = req.body.style_sn;
		if (style_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		// 해당 스타일의 주문 후기 얻기
		orderlist.getreview(style_sn, function (err, results) {
			if (err) {
				console.error(err);
				res.json({ result: 'fail', msg: err });
			} else {
				// res.json({ result: 'success', msg: '' });
				res.render('app_review', { datas: results });
			}
		})
	} catch (err) {
		console.error(err);
		res.json({ result: 'fail', msg: err });
	}
};
