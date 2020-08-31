var reserve = require('../models/reserve');
var security = require('../utility/security');
var style = require('../models/style');
var async = require('async');
var path = require('path');
var fs = require('fs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var htmlToText = require('nodemailer-html-to-text').htmlToText;
var gcm = require('node-gcm');
var Cron = require('cron').CronJob;

// 거절된 예약 삭제(7일 기점)
var delrejectjob = new Cron({
	cronTime: '00 00 00 * * *',
	onTick: function () {
		// 거절된 예약 리스트 얻기
		reserve.showrejectreserve(function (err, results) {
			async.each(results, function (data, callback) {
				if (err) console.error(err);
				if (data.reserve_photo1 != "") {
					var photo1 = data.reserve_photo1;
					var photo2 = data.reserve_photo2;
					var photo3 = data.reserve_photo3;
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

					// 거절된 예약 삭제
					reserve.delreservation(data.reserve_sn, function (err, result) {
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
					// 거절된 예약 삭제
					reserve.delreservation(data.reserve_sn, function (err, result) {
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

// 주문 과정으로 진행 안 된 예약 삭제
var delnotpayjob = new Cron({
	cronTime: '00 00 00 * * *',
	onTick: function () {
		// 주문 과정으로 진행 안 된 예약 리스트 얻기
		reserve.shownotpayreserve(function (err, results) {
			async.each(results, function (data, callback) {
				if (err) console.error(err);
				if (data.reserve_photo1 != "") {
					var photo1 = data.reserve_photo1;
					var photo2 = data.reserve_photo2;
					var photo3 = data.reserve_photo3;
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

					// 예약 삭제
					reserve.delreservation(data.reserve_sn, function (err, result) {
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
					// 예약 삭제
					reserve.delreservation(data.reserve_sn, function (err, result) {
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

delrejectjob.start();
delnotpayjob.start();


// 사용자 예약 내역 리스트 보기
exports.showMyList = function (req, res) {
	try {
		var user_sn = req.body.user_sn;
		if (user_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		// 해당 유저 예약 리스트 얻기
		reserve.getmylist(user_sn, function (err, results) {
			if (err) {
				console.error(err);
				res.json({ result: 'fail', msg: err });
			} else {
				res.json({ result: 'success', datas: results });
			}
		});
	} catch (err) {
		console.error(err);
	}
};

// 해당 예약 정보 얻기
exports.showResevationInfo = function (req, res) {
	try {
		var reserve_sn = req.body.sn;
		if (reserve_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		// 해당 예약 정보 얻기
		reserve.getreservationinfo(reserve_sn, function (err, result) {
			if (err) {
				console.error(err);
				res.json({ result: 'fail', msg: err });
			} else {
				if (result.length != 0) {
					res.json({ result: 'success', datas: result[0] });
				} else {
					res.json({ result: 'fail', msg: 'no reservation' });
				}
			}
		});
	} catch (err) {
		console.error(err);
	}
};

// 예약하기
exports.makeReservation = function (req, res) {
	try {
		// console.log(req.body);
		var sn = req.body.user_sn;
		if (sn == undefined || sn == '') {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		var id = req.body.user_id;
		if (id == undefined || id == '') {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		var pwd = req.body.user_pwd;
		if (pwd == undefined || pwd == '') {
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
		var userreq = req.body.user_req;
		if (userreq == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
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
		var size = parseInt(req.body.re_size);
		if (size == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		var wanttime = new Date(req.body.wanttime);
		if (wanttime == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		var styleprice = 0;
		var sizeprice = 0;
		var pp = 0;

		// 스타일 정보 얻기
		style.showstyleinfo(style_sn, function (err, results) {
			if (err) console.error(err);
			if (results[0] != undefined && results[0].artist_able != undefined) {
				// 활동 여부 확인
				if (results[0].artist_able == 1) {
					// 할인 여부 확인
					if (results[0].style_discount == 0){
						// 작업 스타일 확인
						if (mode == 0) {
							if (results[0].style_onesketch != 0) {
								styleprice = results[0].style_onesketch;
							} else {
								res.json({ result: 'fail', msg: 'invalid' });
								return;
							}
						} else if (mode == 1) {
							if (results[0].style_onepointcolor != 0) {
								styleprice = results[0].style_onepointcolor;
							} else {
								res.json({ result: 'fail', msg: 'invalid' });
								return;
							}
						} else if (mode == 2) {
							if (results[0].style_onecolor != 0) {
								styleprice = results[0].style_onecolor;
							} else {
								res.json({ result: 'fail', msg: 'invalid' });
								return;
							}
						} else if (mode == 3) {
							if (results[0].style_onefullsketch != 0) {
								styleprice = results[0].style_onefullsketch;
							} else {
								res.json({ result: 'fail', msg: 'invalid' });
								return;
							}
						} else if (mode == 4) {
							if (results[0].style_onefullpointcolor != 0) {
								styleprice = results[0].style_onefullpointcolor;
							} else {
								res.json({ result: 'fail', msg: 'invalid' });
								return;
							}
						} else if (mode == 5) {
							if (results[0].style_onefullcolor != 0) {
								styleprice = results[0].style_onefullcolor;
							} else {
								res.json({ result: 'fail', msg: 'invalid' });
								return;
							}
						} else {
							// 기록 남기기 필수(구현 안함)
							res.json({ result: 'fail', msg: 'invalid' });
							return;
						}
					} else {
						if (mode == 0) {
							if (results[0].style_disonesketch != 0) {
								styleprice = results[0].style_disonesketch;
							} else {
								res.json({ result: 'fail', msg: 'invalid' });
								return;
							}
						} else if (mode == 1) {
							if (results[0].style_disonepointcolor != 0) {
								styleprice = results[0].style_disonepointcolor;
							} else {
								res.json({ result: 'fail', msg: 'invalid' });
								return;
							}
						} else if (mode == 2) {
							if (results[0].style_disonecolor != 0) {
								styleprice = results[0].style_disonecolor;
							} else {
								res.json({ result: 'fail', msg: 'invalid' });
								return;
							}
						} else if (mode == 3) {
							if (results[0].style_disonefullsketch != 0) {
								styleprice = results[0].style_disonefullsketch;
							} else {
								res.json({ result: 'fail', msg: 'invalid' });
								return;
							}
						} else if (mode == 4) {
							if (results[0].style_disonefullpointcolor != 0) {
								styleprice = results[0].style_disonefullpointcolor;
							} else {
								res.json({ result: 'fail', msg: 'invalid' });
								return;
							}
						} else if (mode == 5) {
							if (results[0].style_disonefullcolor != 0) {
								styleprice = results[0].style_disonefullcolor;
							} else {
								res.json({ result: 'fail', msg: 'invalid' });
								return;
							}
						} else {
							// 기록 남기기 필수
							res.json({ result: 'fail', msg: 'invalid' });
							return;
						}
					}

					// 작업 사이즈
					if (size == 0) {
						sizeprice = 0;
					} else if (size == 1) {
						sizeprice = results[0].style_a2;
					} else if (size == 2) {
						sizeprice = results[0].style_a1;
					} else if (size == 3) {
						sizeprice = results[0].style_a0;
					} else {
						res.json({ result: 'fail', msg: 'invalid' });
						return;
					}

					// 인원수(할인율 계산)
					if (pcount == 1) {
						pp = 0;
					} else if (pcount == 2) {
						pp = results[0].style_add1p;
					} else if (pcount == 3) {
						pp = results[0].style_add2p;
					} else if (pcount == 4) {
						pp = results[0].style_add3p;
					} else {
						res.json({ result: 'fail', msg: 'invalid' });
						return;
					}

					// 총 금액 맞는지 확인
					var pricetotal = (styleprice + sizeprice) + (styleprice + sizeprice) * parseFloat(pp) * (pcount - 1);
					if (pricetotal != price) {
						res.json({ result: 'fail', msg: 'invalid' });
						return;
					}

					var datas = [];

					datas.push(sn);
					datas.push(artist_sn);
					datas.push(style_sn);
					datas.push('');
					datas.push(userreq);
					datas.push(mode);
					datas.push(size);
					datas.push(pcount);
					datas.push(price);
					datas.push(wanttime);

					// 예약 하기
					reserve.makereservation(datas, function (err, result) {
						if (err) console.error(err);
						if (result.affectedRows == 1) {
							// 지금 예약한 예약 일련번호 얻기
							reserve.getreservationsn(sn, function (err, gresult) {
								if (err) console.error(err);
								// 작가 이메일 얻기
								reserve.getartistemail(gresult[0].reserve_sn, function (err, results) {
									if (err) console.error(err);
									if (results[0].artist_id != undefined) {
										// 작가 아이디 복호화
										security.security_decodata(results[0].artist_id, function (decoid) {
											var transport = nodemailer.createTransport(smtpTransport({
												host: 'localhost'
											}));

											transport.use('compile', htmlToText());

											var content = '<div id="frame"><a href="https://www.omybrand.com/chm/artist/login"> 예약 확인하러 가기 </a></div>';

											var mailOptions = {
												from: 'my@omybrand.com',
												to: decoid,
												subject: '[캐리커쳐 마키] 작가 페이지에서 예약을 확인해주세요',
												html: content
											};

											// console.log('mail 옵션 설정 완료!');
											transport.sendMail(mailOptions, function (err, response){
												if (err){
													console.error(err);
													res.json({ result : 'fail', msg : err });
												} else {
													// console.log("Message sent : " + response.message);
													res.json({ result: 'success', msg: '' });
												}
												transport.close();
											});
										});
									}
								});
							});
						} else {
							res.json({ result: 'fail', msg: err });
						}
					});
				} else {
					res.json({ result: 'fail', msg: 'not able' });
				}
			} else {
				res.json({ result: 'fail', msg: "invalid" });
			}
		});
	} catch (err) {
		console.error(err);
	}
};

// 사진 올리기(앱 전용)
exports.uploadPhoto = function (req, res) {
	try {
		// console.log(req.files);
		var sn = req.body.user_sn;
		if (sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		var exti2 = null;
		var extv2 = null;
		var exti3 = null;
		var extv3 = null;

		var upfile = req.files.upfile;
		if (upfile == undefined) {
			res.json({ result: 'fail', msg: 'upfile' });
			return;
		}
		var exti = upfile.name.lastIndexOf('.');
		var extv = upfile.name.substring(exti);

		var upfile2 = req.files.upfile2;
		if (upfile2 != undefined) {
			exti2 = upfile2.name.lastIndexOf('.');
			extv2 = upfile2.name.substring(exti2);
		}
		var upfile3 = req.files.upfile3;
		if (upfile3 != undefined) {
			exti3 = upfile3.name.lastIndexOf('.');
			extv3 = upfile3.name.substring(exti3);
		}

		var datas = [];

		if (upfile.originalFilename == '') {		// 선택한 파일이 없을 때
			if (upfile != undefined && upfile.path != undefined)
				fs.unlinkSync(upfile.path);

			if (upfile2 != undefined && upfile2.path != undefined)
				fs.unlinkSync(upfile2.path);

			if (upfile3 != undefined && upfile3.path != undefined)
				fs.unlinkSync(upfile3.path);
			res.json({ result: 'fail', msg: 'upfile' });
		} else if (extv != '.jpg' && extv != '.jpeg' && extv != '.png' && extv != '.bmp') {
			if (upfile != undefined && upfile.path != undefined)
				fs.unlinkSync(upfile.path);

			if (upfile2 != undefined && upfile2.path != undefined)
				fs.unlinkSync(upfile2.path);

			if (upfile3 != undefined && upfile3.path != undefined)
				fs.unlinkSync(upfile3.path);
			res.json({ result: 'fail', msg: 'upfile' });
		} else {
			// 첫번째 사진이 있다면(원본 사진)
			var useruploadsfolder = path.resolve(__dirname, '..', 'public', 'imgs', 'uploads', sn);
			var publicsrcpath = "https://www.omybrand.com/chm/imgs/uploads/" + sn + "/";
			var publicsrcpath2 = "https://www.omybrand.com/chm/imgs/uploads/" + sn + "/";
			var publicsrcpath3 = "https://www.omybrand.com/chm/imgs/uploads/" + sn + "/";
			// console.log('profilefolder', profilefolder);
			if (!fs.existsSync(useruploadsfolder)) {		// 폴더가 없으면 만듦
				fs.mkdirSync(useruploadsfolder);
			}

			var name = sn + "1" + new Date().getTime() + upfile.originalFilename;
			publicsrcpath += name;
			var srcpath = upfile.path;
			var destpath = path.resolve(useruploadsfolder, name);
			var is = fs.createReadStream(srcpath);
			var os = fs.createWriteStream(destpath);
			is.pipe(os);
			is.on('end', function () {
				fs.unlinkSync(upfile.path);
				var srcpath2;
				var destpath2;

				// 참고 사진 1이 없다면
				if (upfile2 != undefined) {		// 선택한 파일이 없을 때
					if (extv2 != '.jpg' && extv2 != '.jpeg' && extv2 != '.png' && extv2 != '.bmp') {
						fs.unlinkSync(destpath);
						fs.unlinkSync(upfile2.path);
						fs.unlinkSync(upfile3.path);
						res.json({ result: 'fail', msg: 'upfile2' });
					} else {
						// 참고 사진 1이 있다면
						var name2 = sn + "2" + new Date().getTime() + upfile2.originalFilename;
						publicsrcpath2 += name2;
						srcpath2 = upfile2.path;
						destpath2 = path.resolve(useruploadsfolder, name2);
						var is2 = fs.createReadStream(srcpath2);
						var os2 = fs.createWriteStream(destpath2);
						is2.pipe(os2);
						is2.on('end', function () {
							fs.unlinkSync(upfile2.path);
							// 참고사진 2가 없다면
							if (upfile3 != undefined) {		// 선택한 파일이 없을 때
								if (extv3 != '.jpg' && extv3 != '.jpeg' && extv3 != '.png' && extv3 != '.bmp') {
									fs.unlinkSync(destpath);
									fs.unlinkSync(destpath2);
									fs.unlinkSync(upfile3.path);
									res.json({ result: 'fail', msg: 'upfile3' });
								} else {
									// 참고사진 2가 있다면
									var name3 = sn + "3" + new Date().getTime()+ upfile3.originalFilename;
									publicsrcpath3 += name3;
									var srcpath3 = upfile3.path;
									var destpath3 = path.resolve(useruploadsfolder, name3);
									var is3 = fs.createReadStream(srcpath3);
									var os3 = fs.createWriteStream(destpath3);
									is3.pipe(os3);
									is3.on('end', function () {
										fs.unlinkSync(upfile3.path);

										// 예약하기
										reserve.getreservationsn(sn, function (err, sresult) {
											if (err) console.error(err);
											reserve_sn = sresult[0].reserve_sn;
											var datas = [publicsrcpath, publicsrcpath2, publicsrcpath3, reserve_sn];
											// console.log(datas);
											// 사진 경로 수정
											reserve.updatephoto(datas, function (err, result) {
												if (err) console.error(err);
												if (result.affectedRows == 1) {
													res.json({ result: 'success', msg: '' });
												} else {
													res.json({ result: 'fail', msg: '' });
												}
											});
										});
									});
								}
							} else {
								publicsrcpath3 = null;
								// fs.unlinkSync(upfile3.path);

								// 예약하기
								reserve.getreservationsn(sn, function (err, sresult) {
									if (err) console.error(err);
									reserve_sn = sresult[0].reserve_sn;
									var datas = [publicsrcpath, publicsrcpath2, publicsrcpath3, reserve_sn];
									// console.log(datas);
									// 사진 경로 수정
									reserve.updatephoto(datas, function (err, result) {
										if (err) console.error(err);
										if (result.affectedRows == 1) {
											res.json({ result: 'success', msg: '' });
										} else {
											res.json({ result: 'fail', msg: '' });
										}
									});
								});
							}
						});
					}
				} else {
					publicsrcpath2 = null;
					// fs.unlinkSync(upfile2.path);
					publicsrcpath3 = null;

					// 예약하기
					reserve.getreservationsn(sn, function (err, sresult) {
						if (err) console.error(err);
						reserve_sn = sresult[0].reserve_sn;
						var datas = [publicsrcpath, publicsrcpath2, publicsrcpath3, reserve_sn];
						// console.log(datas);
						// 사진 경로 수정
						reserve.updatephoto(datas, function (err, result) {
							if (err) console.error(err);
							if (result.affectedRows == 1) {
								res.json({ result: 'success', msg: '' });
							} else {
								res.json({ result: 'fail', msg: '' });
							}
						});
					});
				}
			});
		}
	} catch (err) {
		console.error(err);
	}
};

// 예약 취소
exports.cancelReservation = function (req, res) {
	try {
		var reserve_sn = req.body.reserve_sn;
		var user_sn = req.body.user_sn;
		if (reserve_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		if (user_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		// var useruploadsfolder = path.resolve(__dirname, '..', 'public', 'imgs', 'uploads', user_sn);

		// 예약 정보 얻기
		reserve.getreservationinfo(reserve_sn, function (err, results) {
			if (err) {
				console.error(err);
				res.json({ result: 'fail', msg: err });
				return;
			} else if (results.length == 0) {
				res.json({ result: 'fail', msg: 'not exist' });
				return;
			} else {

				// 예약 때 올렸던 사진 삭제하기
				if (results[0].photo1 != null) {
					var photo1 = path.resolve(__dirname, '..', 'public', 'imgs', 'uploads', user_sn, path.basename(results[0].photo1));
					if (fs.existsSync(photo1)) {
						fs.unlinkSync(photo1);
					}
				}
				if (results[0].photo2 != null) {
					var photo2 = path.resolve(__dirname, '..', 'public', 'imgs', 'uploads', user_sn, path.basename(results[0].photo2));
					if (fs.existsSync(photo2)) {
						fs.unlinkSync(photo2);
					}
				}
				if (results[0].photo3 != null) {
					var photo3 = path.resolve(__dirname, '..', 'public', 'imgs', 'uploads', user_sn, path.basename(results[0].photo3));
					if (fs.existsSync(photo3)) {
						fs.unlinkSync(photo3);
					}
				}

				var data = [reserve_sn, user_sn]

				// 예약 취소하기
				reserve.cancelreservation(data, function (err, result) {
					if (err) {
						console.error(err);
						res.json({ result: 'fail', msg: 'db' });
						return;
					} else if (result.affectedRows == 1) {
						res.json({ result: 'success', msg: '' });
					} else {
						res.json({ result: 'success', msg: '' });
					}
				});
			}
		});
	} catch (err) {
		console.error(err);
	}
};

// 예약 수락하기
exports.okReservation = function (req, res) {
	try {
		var reserve_sn = parseInt(req.body.reserve_sn);
		if (reserve_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		var reserve_addpay = parseInt(req.body.reserve_addpay);
		if (reserve_addpay == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		var reserve_reason = req.body.reserve_reason;
		if (reserve_reason == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		var reserve_time1 = req.body.reserve_time1;
		if (reserve_time1 == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		var reserve_time2 = req.body.reserve_time2;
		if (reserve_time2 == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		var reserve_time3 = req.body.reserve_time3;
		if (reserve_time3 == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		var data = [];

		data.push(reserve_reason);
		data.push(reserve_addpay);
		data.push(reserve_time1);
		data.push(reserve_time2);
		data.push(reserve_time3);
		data.push(reserve_sn);

		// 예약 수락하기
		reserve.okreservation(data, function (err, result) {
			if (err) console.error(err);
			if (result.affectedRows == 1) {
				// 사용자 GCM ID 얻기
				reserve.getusergcm(reserve_sn, function (err, uresult) {
					if (uresult[0] != undefined) {
						var message = new gcm.Message();
						var sender = new gcm.Sender('AIzaSyBD9Y9gdb82fAJBaPjXHf3iiGM0L8B3zIo');

						// console.log(gcmcustomer);
						message.addData('msg', '예약이 수락되었습니다. 결제를 진행해주세요.');
						message.collapseKey = 'omybrand';
						message.delayWhileIdle = true;
						message.timeToLive = 3;

						// GCM 전송
						sender.send(message, [uresult[0].user_registID], 4, function (err, result) {
							if (err) {
								res.send('<script>alert("사용자 GCM 알림이 실패했습니다.");location.replace("/chm/artist/reserve/request");</script>');
							}
							else {
								res.send('<script>alert("사용자 GCM 알림이 완료되었습니다.");location.replace("/chm/artist/reserve/request");</script>');
							}
						});
					} else {
						res.json({ result: 'fail', msg: 'registid' });
					}
				});
			}
		});
	} catch (err) {
		console.error(err);
	}
};

// 예약 변경 요청
exports.changeReservation = function (req, res) {
	try {
		var reserve_sn = parseInt(req.body.reserve_sn);
		if (reserve_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		var reserve_addpay = parseInt(req.body.reserve_addpay);
		if (reserve_addpay == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		var reserve_reason = req.body.reserve_reason;
		if (reserve_reason == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		var reserve_time1 = req.body.reserve_time1;
		if (reserve_time1 == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		var reserve_time2 = req.body.reserve_time2;
		if (reserve_time2 == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		var reserve_time3 = req.body.reserve_time3;
		if (reserve_time3 == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		var reserve_reject = parseInt(req.body.reserve_reject);
		if (reserve_reject == undefined) {
			if (reserve_reject != 2 && reserve_reject != 4) {
				res.json({ result: 'fail', msg: 'invalid' });
				return;
			}
		}

		var reserve_pcount = req.body.reserve_pcount;
		if (reserve_pcount == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		var data = [];

		data.push(reserve_reject);
		data.push(reserve_pcount);
		data.push(reserve_reason);
		data.push(reserve_addpay);
		data.push(reserve_time1);
		data.push(reserve_time2);
		data.push(reserve_time3);
		data.push(reserve_sn);

		// 예약 변경하기
		reserve.changereservation(data, function (err, result) {
			if (err) console.error(err);
			if (result.affectedRows == 1) {
				// 사용자 GCM ID 얻기
				reserve.getusergcm(reserve_sn, function (err, uresult) {
					if (uresult[0] != undefined) {
						var message = new gcm.Message();
						var sender = new gcm.Sender('AIzaSyBD9Y9gdb82fAJBaPjXHf3iiGM0L8B3zIo');

						// console.log(gcmcustomer);
						if (reserve_reject == 2) {
							message.addData('msg', '예약의 인원수가 변경되었습니다. 확인 후 결제를 진행해주세요.');
						} else if (reserve_reject == 4) {
							message.addData('msg', '예약의 원하는 날짜가 변경되었습니다. 확인 후 결제를 진행해주세요.');
						}

						message.collapseKey = 'omybrand';
						message.delayWhileIdle = true;
						message.timeToLive = 3;

						// GCM 보내기
						sender.send(message, [uresult[0].user_registID], 4, function (err, result) {
							if (err) {
								res.send('<script>alert("사용자 GCM 알림이 실패했습니다.");location.replace("/chm/artist/reserve/request");</script>');
							}
							else {
								res.send('<script>alert("사용자 GCM 알림이 완료되었습니다.");location.replace("/chm/artist/reserve/request");</script>');
							}
						});
					} else {
						res.json({ result: 'fail', msg: 'registid' });
					}
				});
			}
		});
	} catch (err) {
		console.error(err);
	}
};

// 예약 거절하기
exports.rejectReservation = function (req, res) {
	try {
		var reserve_sn = parseInt(req.body.reserve_sn);
		if (reserve_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		var reserve_reason = req.body.reserve_reason;
		if (reserve_reason == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		var reserve_reject = parseInt(req.body.reserve_reject);
		if (reserve_reject == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		if (reserve_reject != 1 && reserve_reject != 3) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		var data = [];

		data.push(reserve_reject);
		data.push(reserve_reason);
		data.push(reserve_sn);

		// 예약 거절하기
		reserve.rejectreservation(data, function (err, result) {
			if (err) console.error(err);
			if (result.affectedRows != undefined) {
				if (result.affectedRows == 1) {
					// 사용자 GCM ID 얻기
					reserve.getusergcm(reserve_sn, function (err, uresult) {
						if (uresult[0] != undefined) {
							var message = new gcm.Message();
							var sender = new gcm.Sender('AIzaSyBD9Y9gdb82fAJBaPjXHf3iiGM0L8B3zIo');

							// console.log(gcmcustomer);

							message.addData('msg', '예약이 거절되었습니다. 확인 후 그 부분을 다시 수정해서 재예약해주세요.');
							message.collapseKey = 'omybrand';
							message.delayWhileIdle = true;
							message.timeToLive = 3;
							// GCM 보내기
							sender.send(message, [uresult[0].user_registID], 4, function (err, result) {
								if (err) {
									res.send('<script>alert("사용자 GCM 알림이 실패했습니다.");location.replace("/chm/artist/reserve/request");</script>');
								}
								else {
									res.send('<script>alert("사용자 GCM 알림이 완료되었습니다.");location.replace("/chm/artist/reserve/request");</script>');
								}
							});
						} else {
							res.json({ result: 'fail', msg: 'registid' });
						}
					});
				}
			} else {
				res.send('<script>alert("관리자에게 문의해주시기 바랍니다.");location.replace("/chm/artist/reserve/request");</script>');
			}
		});
	} catch (err) {
		console.error(err);
	}
};

//  주문 완료 후 결제 될 시 예약 자동 삭제
exports.finishReservation = function (req, res) {
	try {
		var reserve_sn = req.body.reserve_sn;
		var user_sn = req.body.user_sn;
		if (reserve_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		if (user_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}

		var data = [reserve_sn, user_sn];

		// var useruploadsfolder = path.resolve(__dirname, '..', 'public', 'imgs', 'uploads', user_sn);

		// 예약 삭제
		reserve.cancelreservation(data, function (err, result) {
			if (err) {
				console.error(err);
				res.json({ result: 'fail', msg: 'db' });
				return;
			} else if (result.affectedRows == 1) {
				res.json({ result: 'success', msg: '' });
			} else {
				res.json({ result: 'success', msg: '' });
			}
		});
	} catch (err) {
		console.error(err);
	}
};
