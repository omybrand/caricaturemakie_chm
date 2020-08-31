var config = require('../config/config');
var security = require('../utility/security');
var util = require('../utility/util');
var user = require('../models/user');
var log = require('../models/log');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var htmlToText = require('nodemailer-html-to-text').htmlToText;

/*
 * ----------------------------------------------------------------------------------------
 *  										유저 뷰 관련
 * ----------------------------------------------------------------------------------------
 */

// 유저 로그인 페이지(완성) - 안씀
exports.userLoginform = function (req, res) {
	try {
		if (req.session.user_id == null || req.session.user_id == undefined || req.session.user_id == '') {
			res.render('u_loginform', { title: '사용자 로그인' });
		} else {
			res.send('<script>alert("이미 로그인하셨습니다! 메인 페이지로 넘어갑니다.");location.replace("/chm/user/");</script>');
		}
	} catch (e) {
		console.error("error : ", e);
	}
};

// 유저 로그아웃 get 방식(완성) - 안씀
exports.userLogout = function (req, res) {
	try {
		// console.log(req.session);
		if (req.session.user_id == null || req.session.user_id == undefined || req.session.user_id == '') {
			res.send('<script>alert("잘못된 경로로 접근하셨습니다!");location.replace("/chm/user/login");</script>');
		} else {
			req.session.destroy();
			res.send('<script>alert("성공적으로 로그아웃되었습니다!");location.replace("/chm/user/login");</script>');
		}
	} catch (e) {
		console.error("error : ", e);
	}
};

// 유저 인덱스 페이지(완성) - 안씀
exports.usermain = function (req, res) {
	// console.log(req.session);
	try {
		if (req.session.user_id == null || req.session.user_id == undefined || req.session.user_id == '') {
			res.send('<script>alert("로그인을 먼저 해주세요!");location.replace("/chm/user/login");</script>');
		} else {
			if (req.session.user_id != "INITest@omybrand.com") {
				res.render('u_mainform', { title: '메인 페이지' });
			} else {
				res.render('u_mainform_inipay', { title: '메인 페이지' });
			}
		}
	} catch (e) {
		console.error("error : ", e);
	}
};

// 유저 비밀번호 변경 페이지(완성)
exports.changePwdform = function (req, res) {
	// console.log(req.session);
	try {
		if (req.query.code == null || req.query.code == undefined || req.query.code == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		else {
			var code = req.query.code;
			// 유저 비밀변경 코드 확인
			user.confirmcode(code, function (err, result) {
				if (result.result == 'success') {
					// 유저 아이디를 복호화
					security.security_decodata(result.msg, function (decoid) {
						req.session.user_id = decoid;
						res.render('u_pwdchangeform', { title: '사용자 비밀번호 변경' });
					});
				} else  {
					res.json('Your try is logged in Our Server!');
					return;
				}
			});
		}
	} catch (e) {
		console.error("error : ", e);
	}
};

/*
 * ----------------------------------------------------------------------------------------
 *  										유저 관련 처리
 * ----------------------------------------------------------------------------------------
 */

// 웹 로그인(완성) - 안씀
exports.weblogin = function (req, res) {
	try {
		var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
		// 유효성 검사
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
		var encoid;
		var hashpwd;

		security.security_encodata(id, function (encodata) {
			encoid = encodata;
			security.security_pwdproc(pwd, function (encopwd) {
				hashpwd = encopwd;
				// console.log(hashpwd);
				user.login(encoid, hashpwd, function (err, msg) {
					if (err) console.error('err user.weblogin 1 ', err);
					if (msg.result == 'success'){
						if (err) console.error('err user.weblogin 2', err);
						req.session.user_id = id;
						user.getsn(encoid, function (err, result) {
							if (err) console.error('err user.weblogin 3', err);
							var datas = [];
							datas.push(result[0].user_sn);
							datas.push(1);
							datas.push(1);
							datas.push('');
							datas.push(ip);
							// console.log(ip);
							// arp.getMAC(ip, function (err, mac) {
							// 	if (!err) {
							// 		datas.push(mac);
							// 		console.log(mac);
									datas.push('');
									datas.push(0);
									// log.userlog(datas, function (err, lresult) {
										// if (err) console.log(err);
										// if (lresult.affectedRows == 1) {
										res.send('<script>alert("성공적으로 로그인되었습니다.");location.replace("/chm/user/");</script>');
										// }
									// });
								// } else {
									// console.log(err);
								// }
							// });
							// res.send('<script>alert("성공적으로 로그인되었습니다.");location.replace("/chm/user/");</script>');
						});
					} else if (msg.result == 'fail') {
						if (msg.msg == 'id') {
							res.send('<script>alert("해당 아이디가 존재하지 않거나 잘못된 비밀번호입니다.");location.replace("/chm/user/login");</script>');
							// res.json({result: 'fail', msg: 'id'});
						} else if (msg.msg == 'pwd') {
							user.getsn(encoid, function (err, result) {
								if (err) console.error('err user.weblogin 4', err);
								var datas = [];
								datas.push(result[0].user_sn);
								datas.push(1);
								datas.push(0);
								datas.push('pwd');
								datas.push(ip);
								// arp.getMAC(ip, function (err, mac) {
								// 	if (!err) {
										datas.push('');
										// datas.push(mac);
										datas.push(1);
										// log.userlog(datas, function (err, lresult) {
											// if (err) console.log(err);
											// if (lresult.affectedRows == 1) {
											res.send('<script>alert("해당 아이디가 존재하지 않거나 잘못된 비밀번호입니다.");location.replace("/chm/user/login");</script>');
											// }
										// });
									// } else {
									// 	console.log(err);
									// }
								// });
							});
						}
					}
				});
			});
		});
	} catch (e) {
		console.error("error : ", e);
	}
};

// 앱 로그인(완성)
exports.applogin = function (req, res) {
	// console.log(req.body);
	try {
		var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
		// console.log(req.body.user_id);
		// console.log(req.body.user_pwd);
		// 유효성 검사
		if (req.body.user_id == null || req.body.user_id == undefined || req.body.user_id == '') {
			// console.log('아이디');
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.user_pwd == null || req.body.user_pwd == undefined || req.body.user_pwd == '') {
			// console.log('비번');
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.user_registid == null || req.body.user_registid == undefined || req.body.user_registid == '') {
			// console.log('gcm아이디');
			res.json('Your try is logged in Our Server!');
			return;
		}

		var id = req.body.user_id;
		var pwd = req.body.user_pwd;
		var registID = req.body.user_registid;
		var encoid;
		var hashpwd;
		var chmdatas = [];

		// console.log(id);
		// console.log(pwd);

		// 아이디 암호화
		security.security_encodata(id, function (encodata) {
			encoid = encodata;
			// 비밀번호 암호화
			security.security_pwdproc(pwd, function (encopwd) {
				hashpwd = encopwd;
				// 사용자 로그인 확인
				user.login(encoid, hashpwd, function (err, msg) {
					if (err) console.error('err user.applogin 1 ', err);
					if (msg.result == 'success'){
						if (err) console.error('err user.applogin 2', err);
						// 사용자 일련번호 얻기
						user.getsn(encoid, function (err, result) {
							chmdatas.push(registID);
							chmdatas.push(result[0].user_sn);
							var user_sn = result[0].user_sn;
							// 유저 GCM ID 변경(접속한 기기로)
							user.changeregistid(chmdatas, function (err, cresult) {
								if (cresult.affectedRows == 1) {
									var datas = [];
									datas.push(user_sn);
									datas.push(1);
									datas.push(1);
									datas.push('');
									datas.push(ip);
									datas.push('');
									datas.push(0);
									// log.userlog(datas, function (err, lresult) {
									// 	if (err) console.log(err);
									// 	if (lresult.affectedRows == 1) {
											res.json({ result: 'success', msg: '', sn: user_sn });
										// }
									// });
								}
								else {
									res.json({ result: 'fail', msg: msg.msg });
								}
							});
						});
					} else if (msg.result == 'fail') {
						if (msg.msg == 'id') {
							res.json({result: 'fail', msg: 'id'});
						} else if (msg.msg == 'pwd') {
							// 사용자 일련번호 얻기
							user.getsn(encoid, function (err, result) {
								var datas = [];
								datas.push(result[0].user_sn);
								datas.push(1);
								datas.push(0);
								datas.push('pwd');
								datas.push(ip);
								datas.push('');
								datas.push(1);
								// 사용자 로그인 실패 기록
								log.userlog(datas, function (err, lresult) {
									if (err) console.error(err);
									if (lresult.affectedRows == 1) {
										res.json({result: 'fail', msg: 'pwd'});
									}
								});
							});
						} else if (msg.msg == 'email') {
							res.json({result: 'fail', msg: 'email'});
						}
					}
				});
			});
		});
	} catch (e) {
		console.error('error : ', e);
	}
};

// 앱 가입(완성)
exports.appjoin = function (req, res) {
	try {
		// 유효성 검사
		if (req.body.user_id == null || req.body.user_id == undefined || req.body.user_id == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.user_pwd == null || req.body.user_pwd == undefined || req.body.user_pwd == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.user_registid == null || req.body.user_registid == undefined || req.body.user_registid == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

		var id = req.body.user_id;
		var pwd = req.body.user_pwd;
		var registID = req.body.user_registid;
		var user_name = 'no';
		var user_sn;
		var encoid;
		var enconame;
		var hashpwd;
		var number;
		var tempsn;
		var datas = [];
		var chmdatas = [];

		// console.log(id);
		// console.log(pwd);

		// 사용자 아이디 암호화
		security.security_encodata(id, function (encodata) {
			encoid = encodata;
			// console.log(encoid);
			// 사용자 비밀번호 암호화
			security.security_pwdproc(pwd, function (encopwd) {
				hashpwd = encopwd;
				// console.log(encoid);
				// security.security_encodata(user_name, function (encodata1) {
				// 	enconame = encodata1;

					// 아이디 중복 체크
					user.checkid(encoid, function (err, cresult) {
						if (err) console.error('err user.appjoin 1', err);
						// console.log(cresult);
						if (cresult == undefined || cresult == null || cresult.cnt == 0) {
							// 마지막 유저 일련번호 확인
							user.checksn(function (err, results) {
								if (err) console.error('err user.appjoin 2', err);
								// console.log('result', results);
								if (results == undefined || results == null) {
									number = 1;
									// 유저 일련번호 생성
									util.leadingZeros(number, 8, function (tempnum) {
										tempsn = "omav" + tempnum;
										datas.push(tempsn);
										datas.push(encoid);
										datas.push(hashpwd);
										datas.push('');
										/*async.each(encodatas, function (data, result) {
											datas.push(data);
										});*/

										// console.log('datas', datas);

										// 유저 생성하기
										user.join(datas, function (err, result){
											if(result.affectedRows == 1) {
												chmdatas.push(tempsn);
												chmdatas.push(registID);

												// 유저 push 정보 생성
												user.setpush(chmdatas, function (err, sresult) {
													if (sresult.affectedRows == 1) {
														var code = id + new Date(Date.now());

														// 이 부분은 이메일 인증 부분이나 지금 막아놓은 상태
														security.security_pwdproc(code, function (hashcode) {
															user.registcode(encoid, hashcode, function (err, msg) {
																if (err) console.error('err user.registcode 2 ', err);
																if (msg.result == 'success') {
																	// var title = '[캐리커쳐 마키] 회원 가입 인증 메일입니다.';
																	// var content = '회원 가입을 완료하시려면 아래의 인증 링크를 클릭해주세요.<br><a href="https://www.omybrand.com/chm/user/validuser?code=' + hashcode + '">https://www.omybrand.com/chm/user/validuser?code=' + hashcode + '</a>';

																	// var transport = nodemailer.createTransport(smtpTransport({
																	// 	host: 'localhost'
																	// }));

																	// transport.use('compile', htmlToText());

																	// var mailOptions = {
																	// 	from: '<our@omybrand.com>',
																	// 	to: id,
																	// 	subject: title,
																	// 	html: content
																	// };

																	// // console.log('mail 옵션 설정 완료!');
																	// transport.sendMail(mailOptions, function (err, response){
																	// 	if (err){
																	// 		console.error(err);
																	// 		res.json({ result : 'fail', msg : err });
																	// 	} else {
																	// 		// console.log("Message sent : " + response.message);
																			res.json({ result: 'success', msg: '' });
																	// 	}
																	// 	transport.close();
																	// });
																}
															});
														});
													}
													else {
														res.json({ result: 'fail', msg: err });
													}
												});
											} else {
												res.json({ result: 'fail', msg: err });
											}
										});
									});
								} else {
									// 유저 일련번호 생성
									number = parseInt(results[0].user_sn.substring(4, 12)) + 1;
									util.leadingZeros(number, 8, function (tempnum) {
										tempsn = "omav" + tempnum;
										datas.push(tempsn);
										datas.push(encoid);
										datas.push(hashpwd);
										datas.push('');
										/*async.each(encodatas, function (data, result) {
											datas.push(data);
										});*/

										// console.log('datas', datas);

										// 사용자 생성하기
										user.join(datas, function (err, result){
											if (err) res.json({result: 'fail', msg: err});
											if(result.affectedRows == 1) {
												// res.json({result: 'success', msg: ''});
												chmdatas.push(tempsn, registID);
												// 사용자 푸쉬 정보 생성
												user.setpush(chmdatas, function (err, sresult) {
													if (sresult.affectedRows == 1) {
														var code = id + new Date(Date.now());
														// 이메일 인증 관련(지금 안 씀)
														security.security_pwdproc(code, function (hashcode) {
															user.registcode(encoid, hashcode, function (err, msg) {
																if (err) console.error('err user.registcode 2 ', err);
																if (msg.result == 'success') {
																	// var title = '[캐리커쳐 마키] 회원 가입 인증 메일입니다.';
																	// var content = '회원 가입을 완료하시려면 아래의 인증 링크를 클릭해주세요.<br><a href="https://www.omybrand.com/chm/user/validuser?code=' + hashcode + '">https://www.omybrand.com/chm/user/validuser?code=' + hashcode + '</a>';

																	// var transport = nodemailer.createTransport(smtpTransport({
																	// 	host: 'localhost'
																	// }));

																	// transport.use('compile', htmlToText());

																	// var mailOptions = {
																	// 	from: '<our@omybrand.com>',
																	// 	to: id,
																	// 	subject: title,
																	// 	html: content
																	// };

																	// // console.log('mail 옵션 설정 완료!');
																	// transport.sendMail(mailOptions, function (err, response){
																	// 	if (err){
																	// 		console.error(err);
																	// 		res.json({ result : 'fail', msg : err });
																	// 	} else {
																			// console.log("Message sent : " + response.message);
																			res.json({ result: 'success', msg: '' });
																	// 	}
																	// 	transport.close();
																	// });
																}
															});
														});
													}
													else {
														res.json({ result: 'fail', msg: err });
													}
												});
											} else {
												res.json({ result: 'fail', msg: err });
											}
										});
									});
								}
							});
						}
						else {
							res.json({result: 'fail', msg: 'id'});
						}
					});
				// });
			});
		});
	} catch (e) {
		console.error('error : ', e);
	}
};

// 아이디 중복 체크(완성)
exports.checkid = function (req, res) {
	try {
		// 유효성 검사
		// console.log(req.body.user_id);
		if (req.body.user_id == null || req.body.user_id == undefined || req.body.user_id == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

		var id = req.body.user_id;
		// console.log(id);
		// 아이디 암호화
		security.security_encodata(id, function (encodata) {
			// console.log(encodata);
			encoid = encodata;
			// 중복인지 체크
			user.checkid(encoid, function (err, cresult) {
				if (err) console.error('err', err);
				// console.log(cresult);
				if (cresult == undefined || cresult == null || cresult.cnt == 0) {
					res.json({ result: "ok" });
				} else {
					res.json({ result: "duplicate" });
				}
			});
		});
	} catch (e) {
		console.error('error : ', e);
	}
};

// 회원 탈퇴(완성)
exports.secess = function (req, res) {
	try {
		// 유효성 검사
		if (req.body.user_id == null || req.body.user_id == undefined || req.body.user_id == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.user_pwd == null || req.body.user_pwd == undefined || req.body.user_pwd == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.content == null || req.body.content == undefined) {
			res.json('Your try is logged in Our Server!');
			return;
		}

		var id = req.body.user_id;
		var pwd = req.body.user_pwd;
		var content = req.body.content;
		var hashpwd;
		var chmdatas = [];

		// 아이디 암호화
		security.security_encodata(id, function (encodata) {
			encoid = encodata;
			// 비밀번호 암호화
			security.security_pwdproc(pwd, function (encopwd) {
				hashpwd = encopwd;
				// 로그인 확인
				user.login(encoid, hashpwd, function (err, msg) {
					if (err) console.error('err user.secess 1 ', err);
					if (msg.result == 'success'){
						if (err) console.error('err user.secess 2', err);
						// 일련번호 얻기
						user.getsn(encoid, function (err, result) {
							chmdatas.push(result[0].user_sn);
							// 해당 사용자 GCM 정보 삭제
							user.chmsecess(chmdatas, function (err, result) {
								if (result.affectedRows == 1) {
									// 해당 사용자 정보 삭제
									user.secess(encoid, function (err, result) {
										if (result.result == 'success') {
											/*req.session.destroy();
											res.send('<script>location.href="/loginpage";</script>');*/
											var title = '[캐리커쳐 마키] 회원 탈퇴입니다. ㅜ.ㅜ';

											var transport = nodemailer.createTransport(smtpTransport({
												host: 'localhost'
											}));

											var mailOptions = {
												from: '<omav@omybrand.com>',
												to: '<our@omybrand.com>',
												subject: title,
												text: '사유 : ' + content
											};

											// console.log('mail 옵션 설정 완료!');
											// 이메일 보내기
											transport.sendMail(mailOptions, function (err, response){
												if (err){
													console.error(err);
													res.json({ result: 'success', msg: '' });
												} else {
													// console.log("Message sent : " + response.message);
													res.json({ result: 'success', msg: '' });
												}
												transport.close();
											});
										}
										else {
											res.json({ result: 'fail', msg: err });
										}
									});
								}
								else {
									res.json({ result: 'fail', msg: err });
								}
							});
						});
			//			res.redirect('/loginpage');
					} else if (msg.result == 'fail') {
						// 사용자 인증에 실패
						if (msg.msg == 'id') {
							res.json({result: 'fail', msg: 'id'});
						} else if (msg.msg == 'pwd') {
							res.json({result: 'fail', msg: 'pwd'});
						}
					}
				});
			});
		});
	} catch (e) {
		console.error('error : ', e);
	}
};

// 회원 비밀번호 변경 요청(완성)
exports.forgotPwd = function (req, res) {
	try {
		// 유효성 검사
		if (req.body.user_id == null || req.body.user_id == undefined || req.body.user_id == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

		var id = req.body.user_id;
		var encoid = '';
		// 아이디 암호화
		security.security_encodata(id, function (encodata) {
			encoid = encodata;
			// 아이디가 있는지 확인
			user.forgotpwd(encoid, function (err, msg) {
				if (err) console.error('err user.forgotpwd 1 ', err);
				if (msg.result == 'success') {
					// 코드 생성
					var code = id + new Date(Date.now());
					security.security_pwdproc(code, function (hashcode) {
						// 인증 코드 등록
						user.registcode(encoid, hashcode, function (err, msg) {
							if (err) console.error('err user.forgotpwd 2 ', err);

							var title = "[캐리커쳐 마키] 비밀번호 변경을 위한 이메일입니다.";
							var content = '아래의 링크를 클릭하시면 비밀번호 변경 페이지로 연결됩니다.<br><a href="https://www.omybrand.com/chm/user/changepwd?code=' + hashcode + '">https://www.omybrand.com/chm/user/changepwd?code=' + hashcode + '</a>';

							var transport = nodemailer.createTransport(smtpTransport({
								host: 'localhost'
							}));

							transport.use('compile', htmlToText());

							var mailOptions = {
								from: '<our@omybrand.com>',
								to: id,
								subject: title,
								html: content
							};

							// console.log('mail 옵션 설정 완료!');

							// 이메일 보내기
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
					});
				} else if (msg.result == 'fail') {
					res.json({ result: 'fail', msg: 'id' });
				}
			});
		});
	} catch(err) {
		if(err) console.error('err', err);
	}
};

// 회원 비밀번호 변경(완성)
exports.changePwd = function (req, res) {
	try {
		// 유효성 검사
		if (req.session.user_id == null || req.session.user_id == undefined || req.session.user_id == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.user_pwd == null || req.body.user_pwd == undefined || req.body.user_pwd == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.user_pwd2 == null || req.body.user_pwd2 == undefined || req.body.user_pwd2 == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.user_pwd2 != req.body.user_pwd) {
			res.json('Your try is logged in Our Server!');
			return;
		}

		// 아이디 암호화
		security.security_encodata(req.session.user_id, function (encodata) {
			var encoid = encodata;
			// 비밀번호 암호화
			security.security_pwdproc(req.body.user_pwd, function (encopwd) {
				var hashpwd = encopwd;
				var datas = [encopwd, encoid];
				// 비밀번호 변경
				user.changepwd(datas, function (err, result) {
					if (err) console.error('error : ', err);
					if (result.result == 'success') {
						// 인증코드 삭제
						user.deletecode(req.session.user_id, function (err, result) {
							if (result.result == 'success') {
								res.send('<script>alert("성공적으로 비밀번호 변경을 하였습니다.");</script>');
							} else {
								res.send('<script>alert("성공적으로 비밀번호 변경을 하였습니다.");</script>');
							}
						});
					} else {
						res.send('<script>alert("관리자에게 문의해 주시기 바랍니다.");location.replace("http://www.omybrand.com");</script>');
					}
				});
			});
		});
	} catch (e) {
		console.error('error : ', e);
	}
};

// 푸쉬 여부 변경 (완성)
exports.changePush = function (req, res) {
	try {
		// 유효성 검사
		if (req.body.user_id == null || req.body.user_id == undefined || req.body.user_id == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.user_pwd == null || req.body.user_pwd == undefined || req.body.user_pwd == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}
		if (req.body.user_push == null || req.body.user_push == undefined || req.body.user_push == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

		var id = req.body.user_id;
		var pwd = req.body.user_pwd;
		var state = req.body.user_push;
		var hashpwd;
		var chmdatas = [];
		var encoid;

		// 아이디 암호화
		security.security_encodata(id, function (encodata) {
			encoid = encodata;

			// 비밀번호 암호화
			security.security_pwdproc(pwd, function (encopwd) {
				hashpwd = encopwd;

				// 사용자 로그인
				user.login(encoid, hashpwd, function (err, msg) {
					if (err) console.error('err user.login 1 ', err);
					if (msg.result == 'success'){
						if (err) console.error('err user.login 2', err);
						// 유저 일련번호 얻기
						user.getsn(encoid, function (err, result) {
							chmdatas.push(state);
							chmdatas.push(result[0].user_sn);

							// push 알림 변경
							user.changepush(chmdatas, function (err, cresult) {
								if (cresult.affectedRows == 1) {
									res.json({ result: 'success', msg: '' });
								}
								else {
									res.json({ result: 'fail', msg: err });
								}
							});
						});
					} else if (msg.result == 'fail') {
						// 로그인 실패
						if (msg.msg == 'id') {
							res.json({result: 'fail', msg: 'id'});
						} else if (msg.msg == 'pwd') {
							res.json({result: 'fail', msg: 'pwd'});
						}
					}
				});
			});
		});
	} catch (e) {
		console.error('error : ', e);
	}
};

// 푸쉬 여부 받기(완성)
exports.getPush = function (req, res) {
	try {
		// 유효성 검사
		if (req.body.user_sn == null || req.body.user_sn == undefined || req.body.user_sn == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

		var sn = req.body.user_sn;
		// 유저 push 정보 받기
		user.getpush(sn, function (err, result) {
			if (result[0] != undefined) {
				res.json({ result: 'success', push: result[0].push });
			}
			else {
				res.json({ result: 'fail', msg: "sn" });
			}
		});
	} catch (e) {
		console.error('error : ', e);
	}
};

// 이메일 인증 완료
exports.validUser = function (req, res) {
	try {
		var code = req.query.code;
		// 사용자 인증 상태로 만들기
		user.valid(code, function (err, result) {
			if (result.result == "success") {
				res.send("<script>alert('이메일 인증이 완료되었습니다.');history.back();</script>");
			} else {
				res.send("<script>alert('이메일 인증에 실패했습니다.');history.back();</script>");
			}
		});
	} catch (err) {
		console.error('error : ', err);
	}
};

// 마일리지 정보 받기
exports.getMileage = function (req, res) {
	try {
		// 유효성 검사
		if (req.body.user_sn == null || req.body.user_sn == undefined || req.body.user_sn == '') {
			res.json('Your try is logged in Our Server!');
			return;
		}

		var sn = req.body.user_sn;
		// 해당 사용자 마일리지 얻기
		user.getmileage(sn, function (err, result) {
			if (result[0] != undefined) {
				res.json({ result: 'success', mileage: result[0].user_mileage });
			}
			else {
				res.json({ result: 'fail', msg: "sn" });
			}
		});
	} catch (e) {
		console.error('error : ', e);
	}
}