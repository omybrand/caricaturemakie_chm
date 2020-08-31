var config  = require('../config/config');

// 주문 일련번호 체크
exports.checksn = function (callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.error('err dbomavchmpool.checksn 1', err);
		conn.query('SELECT order_sn FROM orderlist ORDER BY order_sn DESC LIMIT 1', [], function (err, result) {
			if (err) console.error('err dbomavchmpool.checksn 2', err);
			callback(err, result);
		});
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});
}

// 주문하기(사진 1장)
exports.addorder1 = function (data, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.addorder1 1', err);
		conn.query("INSERT INTO orderlist (order_sn, order_user_sn, order_artist_sn, order_style_sn, order_photo1, order_req, order_size, order_select, order_pcount, order_price, order_state, order_gettime, order_finishtime, order_coupon, order_addpay, order_pay, order_valid, order_check, order_addr1, order_addr2, order_phone, order_delivercode, order_name, order_rate, order_mileage) VALUES (?,?,?,?,?,?,?,?,?,?,0,NOW(),?,?,?,?,0,0,?,?,?,?,?,6,?);", data, function (err, result) {
			// console.log(data);
			if (err) console.log('err dbomavchmpool.addorder1 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};

// 주문하기(사진 2장)
exports.addorder2 = function (data, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.addorder2 1', err);
		conn.query("INSERT INTO orderlist (order_sn, order_user_sn, order_artist_sn, order_style_sn, order_photo1, order_photo2, order_req, order_size, order_select, order_pcount, order_price, order_state, order_gettime, order_finishtime, order_coupon, order_addpay, order_pay, order_valid, order_check, order_addr1, order_addr2, order_phone, order_delivercode, order_name, order_rate, order_mileage) VALUES (?,?,?,?,?,?,?,?,?,?,?,0,NOW(),?,?,?,?,0,0,?,?,?,?,?,6,?);", data, function (err, result) {
			if (err) console.log('err dbomavchmpool.addorder2 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};

// 주문하기(사진 3장)
exports.addorder3 = function (data, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.addorder3 1', err);
		conn.query("INSERT INTO orderlist (order_sn, order_user_sn, order_artist_sn, order_style_sn, order_photo1, order_photo2, order_photo3, order_req, order_size, order_select, order_pcount, order_price, order_state, order_gettime, order_finishtime, order_coupon, order_addpay, order_pay, order_valid, order_check, order_addr1, order_addr2, order_phone, order_delivercode, order_name, order_rate, order_mileage) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,0,NOW(),?,?,?,?,0,0,?,?,?,?,?,6,?);", data, function (err, result) {
			if (err) console.log('err dbomavchmpool.addorder3 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};

// 결제 완료
exports.validorder = function (order_sn, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.validorder 1', err);
		conn.query("UPDATE orderlist SET order_valid=1 WHERE order_sn=?;", [order_sn], function (err, result) {
			if (err) console.log('err dbomavchmpool.validorder 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};

// 주문 삭제
exports.cancelorder = function (order_sn, user_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.cancelorder 1', err);
		conn.query("DELETE FROM orderlist WHERE order_sn=? AND order_user_sn=?;", [order_sn, user_sn], function (err, result) {
			if (err) console.log('err dbomavchmpool.cancelorder 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		}); //query limit
		config.dbomavchmPool.release(conn);
	}); //pool
};

// 주문 삭제
exports.delorder = function (order_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.delorder 1', err);
		conn.query("DELETE FROM orderlist WHERE order_sn=?;", [order_sn], function (err, result) {
			if (err) console.log('err dbomavchmpool.delorder 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		}); //query limit
		config.dbomavchmPool.release(conn);
	}); //pool
};

// 주문 내역 얻기
exports.listorder = function (user_sn, state, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.listorder 1', err);
		conn.query("SELECT order_sn, style_cover_noframe, style_name, order_select, order_pcount, order_size, DATE_FORMAT(order_finishtime, '%Y-%m-%d') AS order_finishtime, order_state, order_check, order_rate FROM orderlist o, style s WHERE order_user_sn=? AND order_check=? AND order_valid=1 AND o.order_style_sn=s.style_sn;", [user_sn, state], function (err, result) {
			if (err) console.log('err dbomavchmpool.listorder 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		}); //query limit
		config.dbomavchmPool.release(conn);
	}); //pool
};

// 주문 정보 얻기(사용자)
exports.infoorder = function (user_sn, order_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.infoorder 1', err);
		conn.query("SELECT order_sn, style_name, order_select, order_pcount, order_size, order_price, order_req, order_addpay, DATE_FORMAT(order_gettime, '%Y-%m-%d') AS order_gettime, DATE_FORMAT(order_finishtime, '%Y-%m-%d') AS order_finishtime, order_state FROM orderlist o, style s WHERE order_user_sn=? AND order_sn=? AND order_valid=1 AND o.order_style_sn=s.style_sn;", [user_sn, order_sn], function (err, result) {
			if (err) console.log('err dbomavchmpool.infoorder 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		}); //query limit
		config.dbomavchmPool.release(conn);
	}); //pool
};

// 주문 정보 얻기(작가)
exports.getinfoorder = function (order_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.getinfoorder 1', err);
		conn.query("SELECT order_sn, artist_name, style_name, order_select, order_pcount, order_size, order_req, DATE_FORMAT(order_finishtime, '%Y-%m-%d') AS order_finishtime, (order_finishtime <= ADDDATE(NOW(), INTERVAL 3 DAY)) AS order_urgent, order_state, order_photo1, order_photo2, order_photo3 FROM orderlist o, style s, artist a WHERE order_sn=? AND order_valid=1 AND o.order_style_sn=s.style_sn AND o.order_artist_sn=a.artist_sn;", [order_sn], function (err, result) {
			if (err) console.log('err dbomavchmpool.getinfoorder 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		}); //query limit
		config.dbomavchmPool.release(conn);
	}); //pool
};

// 기한이 1주일 이내인 작업 목록 얻기
exports.urgentorder = function (artist_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.urgentorder 1', err);
		conn.query("SELECT order_sn, style_name, order_select, order_pcount, order_size, DATE_FORMAT(order_finishtime, '%Y-%m-%d') AS order_finishtime, (order_finishtime <= ADDDATE(NOW(), INTERVAL 3 DAY)) AS order_urgent FROM orderlist o, style s WHERE order_artist_sn=? AND order_valid=1 AND order_state=0 AND o.order_style_sn=s.style_sn AND order_finishtime <= ADDDATE(NOW(), INTERVAL 7 DAY);", [artist_sn], function (err, results) {
			if (err) console.log('err dbomavchmpool.urgentorder 2', err);
			// console.log('addorder result', result);
			callback(err, results);
		}); //query limit
		config.dbomavchmPool.release(conn);
	}); //pool
};

// 기한이 1주일 초과인 작업 목록 얻기
exports.noturgentorder = function (artist_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.noturgentorder 1', err);
		conn.query("SELECT order_sn, style_name, order_select, order_pcount, order_size, DATE_FORMAT(order_finishtime, '%Y-%m-%d') AS order_finishtime FROM orderlist o, style s WHERE order_artist_sn=? AND order_valid=1 AND order_state=0 AND o.order_style_sn=s.style_sn AND order_finishtime > ADDDATE(NOW(), INTERVAL 7 DAY);", [artist_sn], function (err, results) {
			if (err) console.log('err dbomavchmpool.noturgentorder 2', err);
			// console.log('addorder result', result);
			callback(err, results);
		}); //query limit
		config.dbomavchmPool.release(conn);
	}); //pool
};

// 작업 시작
exports.workstart = function (order_sn, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.workstart 1', err);
		conn.query("UPDATE orderlist SET order_state=1 WHERE order_sn=?;", [order_sn], function (err, result) {
			if (err) console.log('err dbomavchmpool.workstart 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};

// 작업 중인 상태의 주문이 있는지 확인
exports.findworking = function (artist_sn, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.findworking 1', err);
		conn.query("SELECT COUNT(order_sn) AS cnt FROM orderlist WHERE order_artist_sn=? AND order_state=1 AND order_valid=1;", [artist_sn], function (err, result) {
			if (err) console.log('err dbomavchmpool.findworking 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};

// 작업 중인 상태의 주문 정보 얻기
exports.workinginfo = function (artist_sn, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.workinginfo 1', err);
		conn.query("SELECT order_sn, artist_name, style_name, order_select, order_pcount, order_size, order_req, DATE_FORMAT(order_finishtime, '%Y-%m-%d') AS order_finishtime, (order_finishtime <= ADDDATE(NOW(), INTERVAL 3 DAY)) AS order_urgent, order_state, order_photo1, order_photo2, order_photo3 FROM orderlist o, style s, artist a WHERE order_artist_sn=? AND order_valid=1 AND order_state=1 AND o.order_style_sn=s.style_sn AND o.order_artist_sn=a.artist_sn;", [artist_sn], function (err, result) {
			if (err) console.log('err dbomavchmpool.workinginfo 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};

// 작업 완료
exports.workcomplete = function (order_sn, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.workcomplete 1', err);
		conn.query("UPDATE orderlist SET order_state=2 WHERE order_sn=?;", [order_sn], function (err, result) {
			if (err) console.log('err dbomavchmpool.workcomplete 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 작업 중인 상태의 주문 정보 얻기
exports.showartistorderlist = function (artist_sn, yy, mm, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.showartistorderlist 1', err);
		conn.query("SELECT order_sn, style_name, order_select, order_pcount, order_size, DATE_FORMAT(order_gettime, '%Y-%m-%d') AS order_gettime, order_price, order_addpay FROM orderlist o, style s WHERE order_artist_sn=? AND order_valid=1 AND order_state=2 AND order_check=1 AND o.order_style_sn=s.style_sn AND YEAR(order_gettime)=? AND MONTH(order_gettime)=? ORDER BY order_gettime DESC;", [artist_sn, yy, mm], function (err, results) {
			if (err) console.log('err dbomavchmpool.showartistorderlist 2', err);
			// console.log('addorder result', result);
			callback(err, results);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 결제 안 된 주문의 일련번호 얻기
exports.showinvalidorder = function (callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.showinvalidorder 1, err');
		conn.query("SELECT order_sn, order_photo1, order_photo2, order_photo3 FROM orderlist WHERE order_valid=? AND order_gettime < SUBTIME(now(), '00:50:00.000000')", [0], function (err, results) {
			if (err) console.log('err dbomavchmpool.showinvalidorder 2', err);
			// console.log('showinvalidorder results', results);
			callback(err, results);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 작업 완료된 주문의 일련번호와 사진경로 얻기
exports.showcompleteorder = function (callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.showcompleteorder 1, err');
		conn.query("SELECT order_sn, order_photo1, order_photo2, order_photo3 FROM orderlist WHERE order_valid=1 AND order_check=1 AND order_finishtime < DATE_SUB(now(), INTERVAL 5 DAY) AND order_photo1<>'';", [], function (err, results) {
			if (err) console.log('err dbomavchmpool.showcompleteorder 2', err);
			// console.log('showcompleteorder results', results);
			callback(err, results);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 작업 완료된 주문의 사진 경로 지우기
exports.delphotopath = function (order_sn, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.delphotopath 1', err);
		conn.query("UPDATE orderlist SET order_photo1='' WHERE order_sn=?;", [order_sn], function (err, result) {
			if (err) console.log('err dbomavchmpool.delphotopath 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};

// 주문 정보 얻기(서버용)
exports.getorderserver = function (order_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.getorderserver 1', err);
		conn.query("SELECT order_sn, order_user_sn, order_price, order_addpay, order_mileage FROM orderlist WHERE order_sn=? AND order_valid=1;", [order_sn], function (err, result) {
			if (err) console.log('err dbomavchmpool.getorderserver 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		}); //query limit
		config.dbomavchmPool.release(conn);
	}); //pool
};


// 주문 점수 얻기(사용자)
exports.getscore = function (user_sn, order_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.getscore 1', err);
		conn.query("SELECT order_rate FROM orderlist o WHERE order_user_sn=? AND order_sn=? AND order_valid=1;", [user_sn, order_sn], function (err, result) {
			if (err) console.log('err dbomavchmpool.getscore 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		}); //query limit
		config.dbomavchmPool.release(conn);
	}); //pool
};


// 주문 점수 업데이트하기(사용자)
exports.updatescore = function (user_sn, order_sn, score, reply, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.updatescore 1', err);
		conn.query("UPDATE orderlist SET order_rate=?, order_reply=? WHERE order_user_sn=? AND order_sn=? AND order_valid=1;", [score, reply, user_sn, order_sn], function (err, result) {
			if (err) console.log('err dbomavchmpool.updatescore 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		}); //query limit
		config.dbomavchmPool.release(conn);
	}); //pool
};


// 결제되었는지 확인하기
exports.confirmvalid = function (user_sn, order_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.confirmvalid 1', err);
		conn.query("SELECT COUNT(order_sn) AS cnt FROM orderlist WHERE order_user_sn=? AND order_sn=? AND order_valid=1;", [user_sn, order_sn], function (err, result) {
			if (err) console.log('err dbomavchmpool.confirmvalid 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		}); //query limit
		config.dbomavchmPool.release(conn);
	}); //pool
};


// 결제되었는지 확인하기
exports.getartistid = function (order_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.getartistid 1', err);
		conn.query("SELECT artist_id FROM orderlist o, artist a WHERE o.order_artist_sn=a.artist_sn AND order_sn=?;", [order_sn], function (err, result) {
			if (err) console.log('err dbomavchmpool.getartistid 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		}); //query limit
		config.dbomavchmPool.release(conn);
	}); //pool
};

// 후기랑 평점 가져오기
exports.getreview = function (style_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.getreview 1', err);
		conn.query("SELECT order_rate, order_reply FROM orderlist WHERE order_style_sn=? AND order_valid=1 AND order_state=2 AND order_check=1 AND order_rate<=5;", [style_sn], function (err, result) {
			if (err) console.log('err dbomavchmpool.getreview 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		}); //query limit
		config.dbomavchmPool.release(conn);
	}); //pool
};