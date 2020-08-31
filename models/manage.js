var config  = require('../config/config');

// 관리자 관련

// 관리자 로그인
exports.login = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.login 1', err);
			// console.log('data', data);
			conn.query('SELECT COUNT(*) AS cnt FROM manager WHERE manager_id=? AND manager_pwd=?;', data, function (err, results) {
				if (err) console.error('err manage.login 2', err);
				callback(err, results[0]);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 새로운 검수작품 카운트하기
exports.getneedcheck = function (callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getneedcheck 1', err);
			// console.log('data', data);
			conn.query('SELECT COUNT(*) AS cnt FROM orderlist WHERE order_check=0 AND order_valid=1 AND order_state=2;', [], function (err, results) {
				if (err) console.error('err manage.getneedcheck 2', err);
				callback(err, results[0]);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 새로운 문의 카운트하기
exports.getneedreturn = function (callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getneedreturn 1', err);
			// console.log('data', data);
			conn.query('SELECT COUNT(*) AS cnt FROM contact WHERE contact_success=0;', [], function (err, results) {
				if (err) console.error('err manage.getneedreturn 2', err);
				callback(err, results[0]);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 주문 내역 관련
// 전체 주문정보

// 해당 주문의 유저 아이디 얻기
exports.getuserid = function (user_sn, callback) {
	try {
		config.dbomybrandPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getuserid 1', err);
			// console.log('data', data);
			conn.query("SELECT user_id FROM user WHERE user_sn=?;", [user_sn], function (err, result) {
				if (err) console.error('err manage.getuserid 2', err);
				callback(err, result);
			});
			config.dbomybrandPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 전체 주문 내역 보기
exports.getallorderlist = function (yy, mm, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getallorderlist 1', err);
			// console.log('data', data);
			conn.query("SELECT order_sn, order_user_sn AS user_sn, s.style_name AS style_name, DATE_FORMAT(order_gettime, '%Y-%m-%d') AS gettime FROM orderlist o, style s WHERE order_valid=1 AND YEAR(order_gettime)=? AND MONTH(order_gettime)=? AND o.order_style_sn=s.style_sn ORDER BY order_sn DESC;", [yy, mm], function (err, result) {
				if (err) console.error('err manage.getallorderlist 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 결제 완료 주문 보기(작업 완료 X )
exports.getpayedorderlist = function (yy, mm, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getallorderlist 1', err);
			// console.log('data', data);
			conn.query("SELECT order_sn, order_user_sn AS user_sn, s.style_name AS style_name, DATE_FORMAT(order_gettime, '%Y-%m-%d') AS gettime FROM orderlist o, style s WHERE order_valid=1 AND YEAR(order_gettime)=? AND MONTH(order_gettime)=? AND o.order_style_sn=s.style_sn  AND order_state<2 ORDER BY order_sn DESC;", [yy, mm], function (err, result) {
				if (err) console.error('err manage.getallorderlist 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 작업 완료 주문 보기
exports.getfinishedorderlist = function (yy, mm, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getfinishedorderlist 1', err);
			// console.log('data', data);
			conn.query("SELECT order_sn, order_user_sn AS user_sn, s.style_name AS style_name, DATE_FORMAT(order_gettime, '%Y-%m-%d') AS gettime FROM orderlist o, style s WHERE order_valid=1 AND YEAR(order_gettime)=? AND MONTH(order_gettime)=? AND o.order_style_sn=s.style_sn  AND order_state>1 ORDER BY order_sn DESC;", [yy, mm], function (err, result) {
				if (err) console.error('err manage.getfinishedorderlist 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 주문 정보 보기
exports.getorderinfo = function (order_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getorderinfo 1', err);
			// console.log('data', data);
			conn.query("SELECT order_sn, order_user_sn AS user_sn, style_name, DATE_FORMAT(order_gettime, '%Y-%m-%d') AS order_gettime, DATE_FORMAT(order_finishtime, '%Y-%m-%d') AS order_finishtime, order_select, order_size, order_pcount, order_price, order_state, artist_name, order_check, order_phone, order_addr1, order_addr2, order_name, order_req FROM orderlist o, style s, artist a WHERE o.order_style_sn=s.style_sn AND o.order_artist_sn=a.artist_sn AND o.order_sn=?;", [order_sn], function (err, result) {
				if (err) console.error('err manage.getorderinfo 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 주문 상품 리스트 보기
exports.getordergoodslist = function (order_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getordergoodslist 1', err);
			// console.log('data', data);
			conn.query("SELECT * FROM goods g, order_goods og, goods_option o WHERE og.goods_option_sn=o.goods_option_sn AND og.order_sn=? AND og.goods_sn=g.goods_sn;", [order_sn], function (err, results) {
				if (err) console.error('err manage.getordergoodslist 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 해당 주문 취소하기

// 주문 검수 관련
// 주문 검수 필요 리스트
exports.getchecklist = function (callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getchecklist 1', err);
			// console.log('data', data);
			conn.query("SELECT order_sn, order_user_sn AS user_sn, s.style_name AS style_name, a.artist_name AS artist_name FROM orderlist o, style s, artist a WHERE order_valid=1 AND o.order_style_sn=s.style_sn AND o.order_artist_sn=a.artist_sn AND order_state=2 AND order_check=0 ORDER BY order_sn DESC;", [], function (err, result) {
				if (err) console.error('err manage.getchecklist 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 해당 주문 정보 얻기
exports.getcheckorder = function (order_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getcheckorder 1', err);
			// console.log('data', data);
			conn.query('SELECT order_sn, order_user_sn AS user_sn, a.artist_id AS artist_id FROM orderlist o, artist a WHERE order_sn=? AND o.order_artist_sn=a.artist_sn;', [order_sn], function (err, result) {
				if (err) console.error('err manage.getcheckorder 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 해당 주문의 유저 GCM 정보 얻기
exports.getregistid = function (user_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getregistid 1', err);
			// console.log('data', data);
			conn.query("SELECT user_registID FROM user WHERE user_sn=?;", [user_sn], function (err, result) {
				if (err) console.error('err manage.getregistid 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 해당 주문 검수 완료
exports.changecheck = function (order_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.changecheck 1', err);
			// console.log('data', data);
			conn.query('UPDATE orderlist SET order_check=1 WHERE order_sn=?;', [order_sn], function (err, result) {
				if (err) console.error('err manage.changecheck 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};


// 작가 일련번호 얻기(스타일을 기준으로)
exports.getartistsn = function (style_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if (err) console.error('err manage.getartistsn 1', err);
			// console.log('datas', data);
			conn.query('SELECT artist_sn FROM style WHERE style_sn=?;', [style_sn], function (err, results) {
				if (err) console.error('err manage.getartistsn 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 주문하기
exports.addorder = function (data, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.addorder 1', err);
		conn.query("INSERT INTO orderlist (order_sn, order_user_sn, order_artist_sn, order_style_sn, order_photo1, order_req, order_size, order_select, order_pcount, order_price, order_state, order_gettime, order_finishtime, order_coupon, order_addpay, order_pay, order_valid, order_check, order_addr1, order_addr2, order_phone, order_delivercode, order_name, order_rate, order_mileage) VALUES (?,?,?,?,?,?,?,?,?,?,2,?,?,?,?,?,1,1,?,?,?,?,?,6,?);", data, function (err, result) {
			// console.log(data);
			if (err) console.log('err dbomavchmpool.addorder 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 작가 정보 관련
// 추가해야 할 작가 일련번호 얻기
exports.getnewartistsn = function (callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if (err) console.error('err manage.getnewartistsn 1', err);
			// console.log('datas', data);
			conn.query('SELECT artist_sn FROM artist ORDER BY artist_sn DESC LIMIT 1;', [], function (err, results) {
				if (err) console.error('err manage.getnewartistsn 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 작가 추가하기
exports.addartist = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if (err) console.error('err manage.addartist 1', err);
			// console.log('datas', data);
			conn.query('INSERT INTO artist (artist_sn, artist_id, artist_pwd, artist_name, artist_ment, artist_photo, artist_able, artist_longtime, artist_weekend) VALUES (?,?,?,?,?,?,0,0,?);', data, function (err, result) {
				if (err) console.error('err manage.addartist 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 작가 프로필 수정하기
exports.updateprofileartist = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.updateprofileartist 1', err);
			// console.log('data', data);
			conn.query('UPDATE artist SET artist_photo=? WHERE artist_sn=?;', data, function (err, result) {
				if (err) console.error('err manage.updateprofileartist 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 작가 정보 수정하기
exports.updateartistinfo = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.updateartistinfo 1', err);
			// console.log('data', data);
			conn.query('UPDATE artist SET artist_id=?, artist_name=?, artist_ment=?, artist_able=?, artist_longtime=?, artist_weekend=? WHERE artist_sn=?;', data, function (err, result) {
				if (err) console.error('err manage.updateartistinfo 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 작가 삭제하기
exports.deleteartist = function (artist_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.deleteartist 1', err);
			// console.log('data', data);
			conn.query('DELETE FROM artist WHERE artist_sn=?;', [artist_sn], function (err, result) {
				if (err) console.error('err manage.deleteartist 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 작가 리스트 얻기
exports.showartistlist = function (callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.showartistlist 1', err);
			// console.log('data', data);
			conn.query('SELECT artist_sn, artist_name, artist_photo FROM artist;', [], function (err, results) {
				if (err) console.error('err manage.showartistlist 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 해당 작가 정보 얻기
exports.getartistinfo = function (artist_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getartistinfo 1', err);
			// console.log('data', data);
			conn.query('SELECT artist_sn, artist_id, artist_name, artist_ment, artist_photo, artist_able, artist_longtime, artist_weekend FROM artist WHERE artist_sn=?;', [artist_sn], function (err, results) {
				if (err) console.error('err manage.getartistinfo 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 작가 약력 추가하기
exports.addartist_info = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if (err) console.error('err manage.addartist_info 1', err);
			// console.log('datas', data);
			conn.query('INSERT INTO artist_info (artist_sn, artist_info_year, artist_info_month, artist_info_content) VALUES (?,?,?,?);', data, function (err, result) {
				if (err) console.error('err manage.addartist_info 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 작가 약력 삭제하기
exports.deleteartist_info = function (artist_info_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.deleteartist_info 1', err);
			// console.log('data', data);
			conn.query('DELETE FROM artist_info WHERE artist_info_sn=?;', [artist_info_sn], function (err, result) {
				if (err) console.error('err manage.deleteartist_info 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 작가 약력 전체 삭제하기
exports.deleteallartist_info = function (artist_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.deleteallartist_info 1', err);
			// console.log('data', data);
			conn.query('DELETE FROM artist_info WHERE artist_sn=?;', [artist_sn], function (err, result) {
				if (err) console.error('err manage.deleteallartist_info 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 해당 작가 약력 얻기
exports.getartist_info = function (artist_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getartist_info 1', err);
			// console.log('data', data);
			conn.query('SELECT artist_info_sn, artist_sn, artist_info_year, artist_info_month, artist_info_content FROM artist_info WHERE artist_sn=? ORDER BY CAST(artist_info_year AS UNSIGNED) ASC, CAST(artist_info_month AS UNSIGNED) ASC;', [artist_sn], function (err, results) {
				if (err) console.error('err manage.getartist_info 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};


// 작가 포트폴리오 관련
// 작가 포트폴리오 리스트 보기
exports.getartistport = function (artist_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getartistport 1', err);
			// console.log('data', data);
			conn.query('SELECT artist_port_sn, artist_sn, artist_port FROM artist_port WHERE artist_sn=?;', [artist_sn], function (err, results) {
				if (err) console.error('err manage.getartistport 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};


// 작가 포트폴리오 경로 리스트 보기
exports.getartistportpaths = function (artist_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getartistportpaths 1', err);
			// console.log('data', data);
			conn.query('SELECT artist_port FROM artist_port WHERE artist_sn=?;', [artist_sn], function (err, results) {
				if (err) console.error('err manage.getartistportpaths 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};


// 작가 포트폴리오 경로 보기
exports.getartistportpath = function (artist_port_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getartistportpath 1', err);
			// console.log('data', data);
			conn.query('SELECT artist_sn, artist_port FROM artist_port WHERE artist_port_sn=?;', [artist_port_sn], function (err, results) {
				if (err) console.error('err manage.getartistportpath 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};


// 작가 포트폴리오 추가하기
exports.addartistport = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.addartistport 1', err);
			// console.log('data', data);
			conn.query('INSERT INTO artist_port (artist_sn, artist_port) VALUES (?,?);', data, function (err, result) {
				if (err) console.error('err manage.addartistport 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 작가 포트폴리오 삭제하기
exports.delartistport = function (artist_port_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.delartistport 1', err);
			// console.log('data', data);
			conn.query('DELETE FROM artist_port WHERE artist_port_sn=?', [artist_port_sn], function (err, result) {
				if (err) console.error('err manage.delartistport 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};


// 작가 포트폴리오 전체 삭제하기
exports.delartistports = function (artist_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.delartistports 1', err);
			// console.log('data', data);
			conn.query('DELETE FROM artist_port WHERE artist_sn=?', [artist_sn], function (err, result) {
				if (err) console.error('err manage.delartistports 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};


// 스타일 정보 관련
// 작가에 따른 스타일 일련번호 얻기
exports.getstylesns = function (artist_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if (err) console.error('err manage.getstylesns 1', err);
			// console.log('datas', data);
			conn.query('SELECT style_sn FROM style WHERE artist_sn=?;', [artist_sn], function (err, results) {
				if (err) console.error('err manage.getstylesns 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 스타일 일련번호 얻기
exports.getnewstylesn = function (callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if (err) console.error('err manage.getnewstylesn 1', err);
			// console.log('datas', data);
			conn.query('SELECT style_sn FROM style ORDER BY style_sn DESC LIMIT 1;', [], function (err, results) {
				if (err) console.error('err manage.getnewstylesn 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 스타일 추가하기
exports.addstyle = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if (err) console.error('err manage.addstyle 1', err);
			// console.log('datas', data);
			conn.query('INSERT INTO style (style_sn, artist_sn, style_name, style_adjective, style_category, style_onesketch, style_onepointcolor, style_onecolor, style_onefullsketch, style_onefullpointcolor, style_onefullcolor, style_cover, style_cover_noframe, style_description, style_discount, style_disonesketch, style_disonepointcolor, style_disonecolor, style_disonefullsketch, style_disonefullpointcolor, style_disonefullcolor, style_a0, style_a1, style_a2, style_add1p, style_add2p, style_add3p, style_digital) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,0,0,0,0,0,0,?,?,?,?,?,?,?);', data, function (err, result) {
				if (err) console.error('err manage.addstyle 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 스타일 커버(앱) 수정하기
exports.updatestylecoverapp = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.updatestylecoverapp 1', err);
			// console.log('data', data);
			conn.query('UPDATE style SET style_cover=? WHERE style_sn=?;', data, function (err, result) {
				if (err) console.error('err manage.updatestylecoverapp 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 스타일 커버(웹) 수정하기
exports.updatestylecoverweb = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.updatestylecoverweb 1', err);
			// console.log('data', data);
			conn.query('UPDATE style SET style_cover_noframe=? WHERE style_sn=?;', data, function (err, result) {
				if (err) console.error('err manage.updatestylecoverweb 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 스타일 커버(모두) 수정하기
exports.updatestylecoverall = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.updatestylecover 1', err);
			// console.log('data', data);
			conn.query('UPDATE style SET style_cover=?, style_cover_noframe=? WHERE style_sn=?;', data, function (err, result) {
				if (err) console.error('err manage.updatestylecover 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 스타일 정보 수정하기
exports.updatestyleinfo = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.updatestyleinfo 1', err);
			// console.log('data', data);
			conn.query('UPDATE style SET style_name=?, style_adjective=?, style_onesketch=?, style_onepointcolor=?, style_onecolor=?, style_onefullsketch=?, style_onefullpointcolor=?, style_onefullcolor=?, style_description=?, style_discount=?, style_disonesketch=?, style_disonepointcolor=?, style_disonecolor=?, style_disonefullsketch=?, style_disonefullpointcolor=?, style_disonefullcolor=?, style_add1p=?, style_add2p=?, style_add3p=?, style_digital=? WHERE style_sn=?;', data, function (err, result) {
				if (err) console.error('err manage.updatestyleinfo 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};


// 스타일 삭제하기
exports.deletestyle = function (style_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.deletestyle 1', err);
			// console.log('data', data);
			conn.query('DELETE FROM style WHERE style_sn=?;', [style_sn], function (err, result) {
				if (err) console.error('err manage.deletestyle 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};


// 스타일 리스트 얻기
exports.showstylelist = function (callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.showstylelist 1', err);
			// console.log('data', data);
			conn.query('SELECT style_sn, style_name, style_cover FROM style;', [], function (err, results) {
				if (err) console.error('err manage.showstylelist 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};


// 해당 스타일 정보 얻기
exports.getstyleinfo = function (style_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getstyleinfo 1', err);
			// console.log('data', data);
			conn.query('SELECT style_sn, artist_sn, style_name, style_adjective, style_category, style_onesketch, style_onepointcolor, style_onecolor, style_onefullsketch, style_onefullpointcolor, style_onefullcolor, style_cover, style_cover_noframe, style_description, style_discount, style_disonesketch, style_disonepointcolor, style_disonecolor, style_disonefullsketch, style_disonefullpointcolor, style_disonefullcolor, style_a0, style_a1, style_a2, style_add1p, style_add2p, style_add3p, style_digital FROM style WHERE style_sn=?;', [style_sn], function (err, results) {
				if (err) console.error('err manage.getstyleinfo 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};


// 스타일 포트폴리오 관련
// 스타일 포트폴리오 경로 리스트 보기
exports.getstyleportpaths = function (style_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getstyleportpaths 1', err);
			// console.log('data', data);
			conn.query('SELECT style_port FROM style_port WHERE style_sn=? ORDER BY style_port_sn;', [style_sn], function (err, results) {
				if (err) console.error('err manage.getstyleportpaths 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 스타일 포트폴리오 리스트 보기
exports.getstyleport = function (style_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getstyleport 1', err);
			// console.log('data', data);
			conn.query('SELECT style_port_sn, style_sn, style_port FROM style_port WHERE style_sn=? ORDER BY style_port_sn;', [style_sn], function (err, results) {
				if (err) console.error('err manage.getstyleport 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};


// 스타일 포트폴리오 경로 보기
exports.getstyleportpath = function (style_port_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getstyleportpath 1', err);
			// console.log('data', data);
			conn.query('SELECT style_sn, style_port FROM style_port WHERE style_port_sn=? ORDER BY style_port_sn;', [style_port_sn], function (err, results) {
				if (err) console.error('err manage.getstyleportpath 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};


// 스타일 포트폴리오 추가하기
exports.addstyleport = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.addstyleport 1', err);
			// console.log('data', data);
			conn.query('INSERT INTO style_port (style_sn, style_port) VALUES (?,?);', data, function (err, result) {
				if (err) console.error('err manage.addstyleport 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 스타일 포트폴리오 삭제하기
exports.delstyleport = function (style_port_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.delstyleport 1', err);
			// console.log('data', data);
			conn.query('DELETE FROM style_port WHERE style_port_sn=?', [style_port_sn], function (err, result) {
				if (err) console.error('err manage.delstyleport 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 스타일 포트폴리오 전체 삭제하기
exports.delstyleports = function (style_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.delstyleports 1', err);
			// console.log('data', data);
			conn.query('DELETE FROM style_port WHERE style_sn=?', [style_sn], function (err, result) {
				if (err) console.error('err manage.delstyleports 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};


// 상품 정보 관련
// 상품 일련번호 얻기
exports.getnewgoodssn = function (callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if (err) console.error('err manage.getnewgoodssn 1', err);
			// console.log('datas', data);
			conn.query('SELECT goods_sn FROM goods ORDER BY goods_sn DESC LIMIT 1;', [], function (err, results) {
				if (err) console.error('err manage.getnewgoodssn 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 상품 추가하기
exports.addgoods = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if (err) console.error('err manage.addgoods 1', err);
			// console.log('datas', data);
			conn.query('INSERT INTO goods (goods_sn, goods_name, goods_price) VALUES (?,?,?);', data, function (err, result) {
				if (err) console.error('err manage.addgoods 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 상품 리스트 얻기
exports.showgoodslist = function (callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.showgoodslist 1', err);
			// console.log('data', data);
			conn.query('SELECT goods_sn, goods_name, goods_price FROM goods;', [], function (err, results) {
				if (err) console.error('err manage.showgoodslist 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 해당 상품 정보 얻기
exports.getgoodsinfo = function (goods_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getgoodsinfo 1', err);
			// console.log('data', data);
			conn.query('SELECT goods_sn, goods_name, goods_price FROM goods WHERE goods_sn=?;', [goods_sn], function (err, results) {
				if (err) console.error('err manage.getgoodsinfo 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 해당 상품 옵션 얻기
exports.getgoodsoptionlist = function (goods_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getgoodsoptionlist 1', err);
			// console.log('data', data);
			conn.query('SELECT goods_option_sn, goods_sn, goods_option_name, goods_option_price, artist_sn FROM goods_option WHERE goods_sn=?;', [goods_sn], function (err, results) {
				if (err) console.error('err manage.getgoodsoptionlist 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 상품 정보 수정하기
exports.updategoodsinfo = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.updategoodsinfo 1', err);
			// console.log('data', data);
			conn.query('UPDATE goods SET goods_name=? goods_price=? WHERE goods_sn=?;', data, function (err, result) {
				if (err) console.error('err manage.updategoodsinfo 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 상품 삭제하기
exports.deletegoods = function (goods_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.deletegoods 1', err);
			// console.log('data', data);
			conn.query('DELETE FROM goods WHERE goods_sn=?;', [goods_sn], function (err, result) {
				if (err) console.error('err manage.deletegoods 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};


// 상품 포트폴리오 관련
// 상품 포트폴리오 추가하기
exports.addgoodsport = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.addgoodsport 1', err);
			// console.log('data', data);
			conn.query('INSERT INTO goods_port (goods_sn, goods_port) VALUES (?,?);', data, function (err, result) {
				if (err) console.error('err manage.addgoodsport 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 상품 포트폴리오 삭제하기
exports.delgoodsport = function (goods_port_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.delgoodsport 1', err);
			// console.log('data', data);
			conn.query('DELETE FROM goods_port WHERE goods_port_sn=?', [goods_port_sn], function (err, result) {
				if (err) console.error('err manage.delgoodsport 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 상품 포트폴리오 전체 삭제하기
exports.delgoodsports = function (goods_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.delgoodsports 1', err);
			// console.log('data', data);
			conn.query('DELETE FROM goods_port WHERE goods_sn=?', [goods_sn], function (err, result) {
				if (err) console.error('err manage.delgoodsports 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 상품 포트폴리오 리스트 보기
exports.getgoodsport = function (goods_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getgoodsport 1', err);
			// console.log('data', data);
			conn.query('SELECT goods_port_sn, goods_sn, goods_port FROM goods_port WHERE goods_sn=?;', [goods_sn], function (err, results) {
				if (err) console.error('err manage.getgoodsport 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};


// 상품 포트폴리오 경로 리스트 보기
exports.getgoodsportpaths = function (goods_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getgoodsportpaths 1', err);
			// console.log('data', data);
			conn.query('SELECT goods_port FROM goods_port WHERE goods_sn=?;', [goods_sn], function (err, results) {
				if (err) console.error('err manage.getgoodsportpaths 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};


// 상품 포트폴리오 경로 보기
exports.getgoodsportpath = function (goods_port_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getgoodsportpath 1', err);
			// console.log('data', data);
			conn.query('SELECT goods_sn, goods_port FROM goods_port WHERE goods_port_sn=?;', [goods_port_sn], function (err, results) {
				if (err) console.error('err manage.getgoodsportpath 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};


// 상품 옵션 관련
// 상품 옵션 추가하기
exports.addgoodsoption = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if (err) console.error('err manage.addgoodsoption 1', err);
			// console.log('datas', data);
			conn.query('INSERT INTO goods_option (goods_sn, goods_option_name, goods_option_price, artist_sn) VALUES (?,?,?,?);', data, function (err, result) {
				if (err) console.error('err manage.addgoodsoption 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 상품 옵션 삭제하기
exports.deletegoodsoption = function (goods_option_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.deletegoodsoption 1', err);
			// console.log('data', data);
			conn.query('DELETE FROM goods_option WHERE goods_option_sn=?;', [goods_option_sn], function (err, result) {
				if (err) console.error('err manage.deletegoodsoption 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 상품 옵션 삭제하기
exports.deletegoodsoptions = function (goods_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.deletegoodsoptions 1', err);
			// console.log('data', data);
			conn.query('DELETE FROM goods_option WHERE goods_sn=?;', [goods_sn], function (err, result) {
				if (err) console.error('err manage.deletegoodsoptions 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};


// 문의 관리
// 전체 문의내역 보기
exports.showallcontact = function (callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.showallcontact 1', err);
			// console.log('data', data);
			conn.query('SELECT * FROM contact;', [], function (err, results) {
				if (err) console.error('err manage.showallcontact 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 답변해야할 문의내역 보기
exports.shownotcontact = function (callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.shownotcontact 1', err);
			// console.log('data', data);
			conn.query("SELECT contact_sn, contact_user_sn, contact_content, contact_success, contact_user_sn AS contact_user_name, DATE_FORMAT(contact_time, '%Y-%m-%d') AS contact_time FROM contact WHERE contact_success=0;", [], function (err, results) {
				if (err) console.error('err manage.shownotcontact 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 문의내역 정보 보기
exports.showcontactinfo = function (contact_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.shownotcontact 1', err);
			// console.log('data', data);
			conn.query("SELECT contact_sn, contact_user_sn, contact_content FROM contact WHERE contact_sn=?;", [contact_sn], function (err, results) {
				if (err) console.error('err manage.shownotcontact 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 해당 문의내역 이름 보기
exports.getusername = function (user_sn, callback) {
	try {
		config.dbomybrandPool.acquire(function (err, conn) {
			if(err) console.error('err manage.getusername 1', err);
			// console.log('data', data);
			conn.query('SELECT user_name FROM user WHERE user_sn=?;', [user_sn], function (err, results) {
				if (err) console.error('err manage.getusername 2', err);
				callback(err, results);
			});
			config.dbomybrandPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 문의에 대한 답변하기
exports.answercontact = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.answercontact 1', err);
			// console.log('data', data);
			conn.query('UPDATE contact SET contact_return=?, contact_success=1 WHERE contact_sn=?;', data, function (err, results) {
				if (err) console.error('err manage.answercontact 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 유저 관련
// 블랙리스트 보여주기
// 로그인 실패 리스트 보여주기
// 로그인 실패 초기화

// 앱 관련
// 작가 공지사항 관련
// 작가 공지사항 리스트
exports.shownotice_alist = function (callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.shownotice_alist 1', err);
			// console.log('data', data);
			conn.query("SELECT notice_a_sn, notice_a_title,  DATE_FORMAT(notice_a_date, '%Y-%m-%d') AS notice_a_date, notice_a_content FROM notice_a;", [], function (err, results) {
				if (err) console.error('err manage.shownotice_alist 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 작가 공지사항 정보 보여주기
exports.shownotice_ainfo = function (notice_a_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.shownotice_ainfo 1', err);
			// console.log('data', data);
			conn.query("SELECT notice_a_sn, notice_a_title,  DATE_FORMAT(notice_a_date, '%Y-%m-%d') AS notice_a_date, notice_a_content FROM notice_a WHERE notice_a_sn=?;", [notice_a_sn], function (err, result) {
				if (err) console.error('err manage.shownotice_ainfo 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 작가 공지사항 추가하기
exports.addnotice_a = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if (err) console.error('err manage.addnotice_a 1', err);
			// console.log('datas', data);
			conn.query('INSERT INTO notice_a (notice_a_title, notice_a_date, notice_a_content) VALUES (?,?,?);', data, function (err, result) {
				if (err) console.error('err manage.addnotice_a 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 작가 공지사항 수정하기
exports.updatenotice_a = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.updatenotice_a 1', err);
			// console.log('data', data);
			conn.query('UPDATE notice_a SET notice_a_title=?, notice_a_date=?, notice_a_content=? WHERE notice_a_sn=?;', data, function (err, result) {
				if (err) console.error('err manage.updatenotice_a 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 작가 공지사항 삭제하기
exports.deletenotice_a = function (notice_a_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.deletenotice_a 1', err);
			// console.log('data', data);
			conn.query('DELETE FROM notice_a WHERE notice_a_sn=?;', [notice_a_sn], function (err, result) {
				if (err) console.error('err manage.deletenotice_a 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 앱 공지사항 관련
// 앱 공지사항 리스트
exports.shownoticelist = function (callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.shownoticelist 1', err);
			// console.log('data', data);
			conn.query("SELECT notice_sn, notice_title,  DATE_FORMAT(notice_date, '%Y-%m-%d') AS notice_date, notice_content FROM notice;", [], function (err, results) {
				if (err) console.error('err manage.shownoticelist 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 앱 공지사항 정보 보여주기
exports.shownoticeinfo = function (notice_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.shownotice_ainfo 1', err);
			// console.log('data', data);
			conn.query("SELECT notice_sn, notice_title,  DATE_FORMAT(notice_date, '%Y-%m-%d') AS notice_date, notice_content FROM notice WHERE notice_sn=?;", [notice_sn], function (err, result) {
				if (err) console.error('err manage.shownotice_ainfo 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 앱 공지사항 추가하기
exports.addnotice = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if (err) console.error('err manage.addnotice 1', err);
			// console.log('datas', data);
			conn.query('INSERT INTO notice (notice_title, notice_date, notice_content) VALUES (?,?,?);', data, function (err, result) {
				if (err) console.error('err manage.addnotice 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 앱 공지사항 수정하기
exports.updatenotice = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.updatenotice 1', err);
			// console.log('data', data);
			conn.query('UPDATE notice SET notice_title=?, notice_date=?, notice_content=? WHERE notice_sn=?;', data, function (err, result) {
				if (err) console.error('err manage.updatenotice 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 앱 공지사항 삭제하기
exports.deletenotice = function (notice_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.deletenotice 1', err);
			// console.log('data', data);
			conn.query('DELETE FROM notice WHERE notice_sn=?;', [notice_sn], function (err, result) {
				if (err) console.error('err manage.deletenotice 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 앱 배너 관련
// 앱 배너 리스트
exports.showbannerlist = function (callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.showbannerlist 1', err);
			// console.log('data', data);
			conn.query('SELECT * FROM banner;', [], function (err, results) {
				if (err) console.error('err manage.showbannerlist 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 앱 배너 정보 보기
exports.showbannerinfo = function (banner_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.showbannerinfo 1', err);
			// console.log('data', data);
			conn.query('SELECT * FROM banner WHERE banner_sn=?;', [banner_sn], function (err, result) {
				if (err) console.error('err manage.showbannerinfo 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 앱 배너 정보 수정하기
exports.updatebanner = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.updatebanner 1', err);
			// console.log('data', data);
			conn.query('UPDATE banner SET banner_path=?, banner_link=? WHERE banner_sn=?;', data, function (err, result) {
				if (err) console.error('err manage.updatebanner 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 앱 버전 관련
// 앱 정보 보여주기
exports.showappinfo = function (callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.showappinfo 1', err);
			// console.log('data', data);
			conn.query('SELECT * FROM app_info;', [], function (err, results) {
				if (err) console.error('err manage.showappinfo 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 앱 정보 수정하기
exports.updateappinfo = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.updateappinfo 1', err);
			// console.log('data', data);
			conn.query('UPDATE app_info SET app_version=?, app_link=?, app_updatemust=? WHERE app_version=?;', data, function (err, result) {
				if (err) console.error('err manage.updateappinfo 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 작업 중인 상태의 주문 정보 얻기
exports.showorderlistap = function (artist_sn, yy, mm, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.showorderlistap 1', err);
		conn.query("SELECT order_sn, style_name, order_select, order_pcount, order_size, DATE_FORMAT(order_gettime, '%Y-%m-%d') AS order_gettime, order_price, order_addpay, order_mileage FROM orderlist o, style s WHERE order_valid=1 AND o.order_style_sn=s.style_sn AND YEAR(order_gettime)=? AND MONTH(order_gettime)=? AND order_user_sn<>'offmarket' AND order_user_sn<>'offcompany' AND order_artist_sn=?;", [yy, mm, artist_sn], function (err, results) {
			if (err) console.log('err dbomavchmpool.showorderlistap 2', err);
			// console.log('addorder result', result);
			callback(err, results);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};

// 작업 중인 상태의 주문 정보 얻기
exports.showorderlistom = function (artist_sn, yy, mm, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.showorderlistom 1', err);
		conn.query("SELECT order_sn, style_name, order_select, order_pcount, order_size, DATE_FORMAT(order_gettime, '%Y-%m-%d') AS order_gettime, order_price, order_addpay, order_mileage FROM orderlist o, style s WHERE order_valid=1 AND o.order_style_sn=s.style_sn AND YEAR(order_gettime)=? AND MONTH(order_gettime)=? AND order_user_sn='offmarket' AND order_artist_sn=?;", [yy, mm, artist_sn], function (err, results) {
			if (err) console.log('err dbomavchmpool.showorderlistom 2', err);
			// console.log('addorder result', result);
			callback(err, results);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};

// 작업 중인 상태의 주문 정보 얻기
exports.showorderlistco = function (artist_sn, yy, mm, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.showorderlistco 1', err);
		conn.query("SELECT order_sn, style_name, order_select, order_pcount, order_size, DATE_FORMAT(order_gettime, '%Y-%m-%d') AS order_gettime, order_price, order_addpay, order_mileage FROM orderlist o, style s WHERE order_valid=1 AND o.order_style_sn=s.style_sn AND YEAR(order_gettime)=? AND MONTH(order_gettime)=? AND order_user_sn='offcompany' AND order_artist_sn=?;", [yy, mm, artist_sn], function (err, results) {
			if (err) console.log('err dbomavchmpool.showorderlistco 2', err);
			// console.log('addorder result', result);
			callback(err, results);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};