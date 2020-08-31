var config  = require('../config/config');

/*******************
회원정보관리
*********************/

// 회원 일련번호 체크(완성) - omybrand
exports.checksn = function (callback) {
	config.dbomybrandPool.acquire(function (err, conn) {
		if(err) console.error('err user.checksn 1', err);
		conn.query('SELECT user_sn FROM user ORDER BY user_sn DESC LIMIT 1', [], function (err, results) {
			if(err) console.error('err user.checksn 2', err);
			callback(err, results);
		});
		config.dbomybrandPool.release(conn); //이걸 안하면 반납이 안됨
	});
}

// 아이디 중복 체크(완성) - omybrand
exports.checkid = function (data, callback) {
	config.dbomybrandPool.acquire(function (err, conn) {
		if(err) console.error('err user.checkid 1', err);
		conn.query('SELECT COUNT(*) cnt FROM user WHERE user_id=?', data, function (err, result) {
			if(err) console.error('err user.checkid 2', err);
			callback(err, result[0]);
		});
		config.dbomybrandPool.release(conn); //이걸 안하면 반납이 안됨
	});
};

// 가입하기(완성) - omybrand
exports.join = function (datas, callback) {
	config.dbomybrandPool.acquire(function (err, conn) {
		if(err) console.error('err user.join 1', err);
		// console.log('datas', datas);
		conn.query('INSERT INTO user (user_sn, user_id, user_pwd, user_name, user_mileage, user_cash, user_identify) VALUES (?, ?, ?, ?, 0, 0, 1);', datas, function (err, result) {
			if (err) console.error('err user.join 2', err);
			callback(err, result);
		});
		config.dbomybrandPool.release(conn); //이걸 안하면 반납이 안됨
	});
};

// 로그인하기(완성) - omybrand
exports.login = function(id, pwd, callback) {
	config.dbomybrandPool.acquire(function (err, conn) {
		if(err) console.error('err user.login 1 ', err);
		conn.query('SELECT count(*) cnt FROM user WHERE user_id=?', [id], function (err, result) {
			if (err) console.error('err user.login 2 ', err);
			// console.log(result[0].cnt);
			if (result[0].cnt == 0) {
				callback(err, {result : 'fail', msg : 'id'});
			} else {
				conn.query('SELECT count(*) cnt FROM user WHERE user_id=? AND user_pwd=?', [id, pwd], function (err, results) {
					// console.log(result[0].cnt);
					if (results[0].cnt == 0) {
						callback(err, { result : "fail", msg : "pwd" });
					}
					else
					{
						conn.query('SELECT count(*) cnt FROM user WHERE user_id=? AND user_pwd=? AND user_identify=1', [id, pwd], function (err, results) {
							// console.log(result[0].cnt);
							if (results[0].cnt == 0) {
								callback(err, { result : "success", msg: '' });
								// callback(err, { result : "fail", msg : "email" });
							}
							else
							{
								callback(err, { result : "success", msg: '' });
							}
						});
					}
				});
			}
		});
		config.dbomybrandPool.release(conn); //이걸 안하면 반납이 안됨
	});
};

// 유저 일련번호 얻기(완성) - omybrand
exports.getsn = function(id, callback) {
	config.dbomybrandPool.acquire(function (err, conn) {
		if(err) console.error('err user.getsn 1 ', err);
		conn.query('SELECT user_sn FROM user WHERE user_id=?', [id], function (err, result) {
			if(err) console.error('err user.getsn 2 ', err);
			// console.log(result);
			callback(err, result);
		});
		config.dbomybrandPool.release(conn); //이걸 안하면 반납이 안됨
	});
};

// 탈퇴하기(완성) - omybrand
exports.secess = function (id, callback) {
	config.dbomybrandPool.acquire(function (err, conn) {
		if(err) console.error('err user.secess 1 ', err);
		conn.query('DELETE FROM user WHERE user_id=?', id, function (err, result) {
			if(err) console.error('err user.secess 2 ', err);
			if(result.affectedRows == 0) {
				callback(err, { result: 'fail', msg: 'Wrong user_id' });
			} else {
				callback(err, { result: "success", msg: '' });
			}
		});
		config.dbomybrandPool.release(conn); //이걸 안하면 반납이 안됨
	});
};

// 인증 - omybrand
exports.valid = function (code, callback) {
	config.dbomybrandPool.acquire(function (err, conn) {
		if (err) console.error('err user.valid 1 ', err);
		conn.query('SELECT user_id FROM reqcode WHERE code=?', [code], function (err, result) {
			if(err) console.error('err user.valid 2 ', err);
			if (result[0] != undefined) {
				conn.query('UPDATE user SET user_identify=1 WHERE user_id=?', [result[0].user_id], function (err, result1) {
					if(err) console.error('err user.valid 3 ', err);
					if (result1.affectedRows == 1) {
						conn.query('DELETE FROM reqcode WHERE code=?', [code], function (err, result) {
							callback(err, { result: "success", msg: "" });
						});
					} else {
						callback(err, { result: "fail", msg: err });
					}
				});
			} else {
				callback(err, { result: "fail", msg: "no code" });
			}
		});
		config.dbomybrandPool.release(conn); //이걸 안하면 반납이 안됨
	});
};


// 유저 비밀번호 변경 요청(완성) - omybrand
exports.forgotpwd = function (id, callback) {
	config.dbomybrandPool.acquire(function (err, conn) {
		if(err) console.error('err user.forgotpwd 1 ', err);
		conn.query('SELECT COUNT(*) AS cnt FROM user WHERE user_id=?', id, function (err, result) {
			if(err) console.error('err user.forgotpwd 2 ', err);
			if (result[0].cnt == 1) {
				callback(err, { result: "success", msg: "" });
			} else {
				callback(err, { result: "fail", msg: "Wrong user_id" });
			}
		});
		config.dbomybrandPool.release(conn); //이걸 안하면 반납이 안됨
	});
};

// 유저 비밀번호 변경 코드 등록(완성) - omybrand
exports.registcode = function (id, code, callback) {
	config.dbomybrandPool.acquire(function (err, conn) {
		if (err) console.error('err user.registcode 1 ', err);
		conn.query('SELECT COUNT(*) AS cnt FROM reqcode WHERE user_id=?', id, function (err, result) {
			if(err) console.error('err user.registcode 2 ', err);
			if (result[0].cnt == 1) {
				conn.query('UPDATE reqcode SET code=? WHERE user_id=?', [code, id], function (err, result) {
					if(err) console.error('err user.registcode 3 ', err);
					if (result.affectedRows == 1) {
						callback(err, { result: "success", msg: "" });
					} else {
						callback(err, { result: "fail", msg: err });
					}
				});
			} else {
				conn.query('INSERT INTO reqcode(user_id, code) VALUES(?,?)', [id, code], function (err, result) {
					if(err) console.error('err user.registcode 3 ', err);
					if (result.affectedRows == 1) {
						callback(err, { result: "success", msg: "" });
					} else {
						callback(err, { result: "fail", msg: err });
					}
				});
			}
		});
		config.dbomybrandPool.release(conn); //이걸 안하면 반납이 안됨
	});
};

// 유저 비밀번호 변경 코드 확인(완성) - omybrand
exports.confirmcode = function (code, callback) {
	config.dbomybrandPool.acquire(function (err, conn) {
		if(err) console.error('err user.confirmcode 1 ', err);
		conn.query('SELECT user_id FROM reqcode WHERE code=?', code, function (err, result) {
			if(err) console.error('err user.confirmcode 2 ', err);
			if (result[0] != undefined) {
				callback(err, { result: "success", msg: result[0].user_id });
			} else {
				callback(err, { result: "fail", msg: err });
			}
		});
		config.dbomybrandPool.release(conn); //이걸 안하면 반납이 안됨
	});
};

// 유저 비밀번호 변경 코드 삭제
exports.deletecode = function (user_id, callback) {
	config.dbomybrandPool.acquire(function (err, conn) {
		if(err) console.error('err user.deletecode 1 ', err);
		conn.query('DELETE FROM reqcode WHERE user_id=?', user_id, function (err, result) {
			if(err) console.error('err user.deletecode 2 ', err);
			if (result.affectedRows == 1) {
				callback(err, { result: "success", msg: '' });
			} else {
				callback(err, { result: "fail", msg: err });
			}
		});
		config.dbomybrandPool.release(conn); //이걸 안하면 반납이 안됨
	});
};

// 유저 비밀번호 변경
exports.changepwd = function (data, callback) {
	config.dbomybrandPool.acquire(function (err, conn) {
		if(err) console.error('err user.changepwd 1 ', err);
		conn.query('UPDATE user SET user_pwd=? WHERE user_id=?', data, function (err, result) {
			if(err) console.error('err user.changepwd 2 ', err);
			if (result.affectedRows == 1) {
				callback(err, { result: "success", msg: '' });
			} else {
				callback(err, { result: "fail", msg: err });
			}
		});
		config.dbomybrandPool.release(conn); //이걸 안하면 반납이 안됨
	});
};

// 앱 유저 push 얻기(완성) - omav_chm
exports.getpush = function (data, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.error('err user.getpush 1', err);
		// console.log('data', data);
		conn.query('SELECT user_push AS push FROM user WHERE user_sn=?;', data, function (err, result) {
			if (err) console.error('err user.getpush 2', err);
			callback(err, result);
		});
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});
};

// 앱 유저 registerid 변경(완성) - omav_chm
exports.changeregistid = function (data, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.error('err user.changeregistid 1', err);
		// console.log('data', data);
		conn.query('UPDATE user SET user_registID=? WHERE user_sn=?;', data, function (err, result) {
			if (err) console.error('err user.changeregistid 2', err);
			callback(err, result);
		});
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});
};

// 앱 유저 push 변경(완성) - omav_chm
exports.changepush = function (data, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.error('err user.changepush 1', err);
		// console.log('data', data);
		conn.query('UPDATE user SET user_push=? WHERE user_sn=?;', data, function (err, result) {
			if (err) console.error('err user.changepush 2', err);
			callback(err, result);
		});
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});
};


// 푸쉬 알림 설정 (가입시) - (완성) - omav_chm
exports.setpush = function(data, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err dbomavchmpool.setpush 1', err);
		conn.query('INSERT INTO user (user_sn, user_registID, user_push) VALUES (?, ?, 1);', data, function (err, result) {
			if(err) console.log('err dbomavchmpool.setpush 2', err);
			// console.log('setpush result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});//pool
};


// 유저 정보 삭제 (탈퇴시) - (완성) - omav_chm
exports.chmsecess = function(data, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err dbomavchmpool.secess 1', err);
		conn.query('DELETE FROM user WHERE user_sn=?', data, function (err, result) {
			if(err) console.log('err dbomavchmpool.secess 2', err);
			// console.log('secess result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});//pool
};

// 유저 마일리지 조회(완성) - omybrand
exports.getmileage = function (sn, callback) {
	config.dbomybrandPool.acquire(function (err, conn) {
		if(err) console.error('err user.getmileage 1 ', err);
		conn.query('SELECT user_mileage FROM user WHERE user_sn=?', sn, function (err, result) {
			if(err) console.error('err user.getmileage 2 ', err);
			callback(err, result);
		});
		config.dbomybrandPool.release(conn); //이걸 안하면 반납이 안됨
	});
};

// 유저 마일리지 감소(완성) - omybrand
exports.submileage = function (sn, mileage, callback) {
	config.dbomybrandPool.acquire(function (err, conn) {
		if(err) console.error('err user.submileage 1 ', err);
		conn.query('UPDATE user SET user_mileage = user_mileage - ? WHERE user_sn=?;', [mileage, sn], function (err, result) {
			if(err) console.error('err user.submileage 2 ', err);
			callback(err, result);
		});
		config.dbomybrandPool.release(conn); //이걸 안하면 반납이 안됨
	});
};

// 유저 마일리지 증가(완성) - omybrand
exports.addmileage = function (sn, mileage, callback) {
	config.dbomybrandPool.acquire(function (err, conn) {
		if(err) console.error('err user.addmileage 1 ', err);
		conn.query('UPDATE user SET user_mileage = user_mileage + ? WHERE user_sn=?;', [mileage, sn], function (err, result) {
			if(err) console.error('err user.addmileage 2 ', err);
			callback(err, result);
		});
		config.dbomybrandPool.release(conn); //이걸 안하면 반납이 안됨
	});
};