var config  = require('../config/config');

//주분 GCM 아이디 얻기
exports.getregistids = function (callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err dbomavchmpool.getregistids 1', err);
		conn.query("SELECT user_registID AS registid FROM user", [], function (err, results) {
			if(err) console.log('err dbomavchmpool.getregistids 2', err);
//			console.log('getregistid results', results);
			callback(err, results);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};

// 임시 주문 스타일 상세 정보
exports.temporderstyleinfo = function (artistsn, stylesn, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.temporderstyleinfo 1', err);
		conn.query('SELECT artist.artist_sn AS artist_sn, style.style_sn AS style_sn, artist.artist_id AS artist_id, artist.artist_name AS artist_name, style.style_name AS style_name, style.style_onesketch AS artist_onesketch, style.style_onepointcolor AS artist_onepointcolor, style.style_onecolor AS artist_onecolor, style.style_onefullsketch AS artist_onefullsketch, style.style_onefullpointcolor AS artist_onefullpointcolor, style.style_onefullcolor AS artist_onefullcolor, artist.artist_able AS artist_able FROM style, artist WHERE style.style_artist_sn=artist.artist_sn AND style.style_artist_sn=? AND style.style_sn=?', [artistsn, stylesn], function (err, results) {
			if (err) console.log('err dbomavchmpool.temporderstyleinfo 2', err);
			// console.log('temporderstyleinfo results', results);
			var datas = results;
			callback(err, datas);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 작가 작업 대기 또는 작업 중인 주문 조회(날짜)
exports.getfindunfinishedwork = function (artist_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.getfindunfinishedwork 1', err);
		conn.query("SELECT order_sn AS sn, order_user_id AS user_id, order_style_sn AS style_sn, order_photo AS photo, order_thumb AS thumb, order_req AS oreq, order_select AS mode, order_pcount AS pcount, order_price AS price, order_state AS state, order_valid AS valid, DATE_FORMAT(order_ordertime, '%Y-%m-%d') AS ordertime, DATE_FORMAT(order_finishtime, '%Y-%m-%d') AS finishtime FROM orderlist WHERE order_artist_sn=? AND order_valid=1 AND ((order_state=1) OR (order_state=2 AND order_check=0)) ORDER BY order_finishtime DESC", [artist_sn], function (err, results) {
			if(err) console.log('err dbomavchmpool.getfindunfinishedwork 2', err);
			if (results != undefined) {
//				console.log('findunfinishedwork results', results);
				if (results.length == 1) {
					var data = results[0];
					callback(err, data);
				}
				else {
					var data = 0;
					callback(err, data);
				}
			} else {
				var data = 0;
				callback(err, data);
			}
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 검수가 필요한 주문 조회하기
exports.checkneedlist = function (callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.log('err dbomavchmpool.checkneedlist 1', err);
			conn.query('SELECT o.order_sn AS sn, o.order_artist_sn AS artist_sn, o.order_style_sn AS style_sn, o.order_user_id AS user_id, a.artist_id AS artist_id, a.artist_name AS artist_name, s.style_name AS style_name FROM orderlist AS o, artist AS a, style AS s WHERE (o.order_artist_sn=a.artist_sn AND o.order_style_sn=s.style_sn) AND (order_state=2 AND order_check=0)', [], function (err, results) {
				if(err) console.log('err dbomavchmpool.checkneedlist 2', err);
//				console.log('showgoodslist results', results);
				var datas = results;
				callback(err, datas);
			});	//query limit
			config.dbomavchmPool.release(conn);
		});//pool
	} catch (err) {
		console.error('error:', err);
	}
};


// 검수 확인하기
exports.changecheck = function (order_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err dbomavchmpool.changecheck 1', err);
//			console.log('data', data);
			conn.query('UPDATE orderlist SET order_check=1 WHERE order_sn=?;', [order_sn], function (err, result) {
				if (err) console.error('err dbomavchmpool.changecheck 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn);
		});
	} catch (err) {
		console.error('error:', err);
	}
};


// 예상 일자 변경하기
exports.updatefinishtime = function (artist_sn, periods, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.updatefinishtime 1', err);
		conn.query("SELECT order_sn AS sn, order_user_id AS user_id, order_photo AS photo, order_select AS mode, order_pcount AS pcount, order_price AS price, order_state AS state, order_valid AS valid, DATE_FORMAT(order_ordertime, '%Y-%m-%d') AS ordertime, DATE_FORMAT(order_finishtime, '%Y-%m-%d') AS finishtime FROM orderlist WHERE order_artist_sn=? AND order_valid=1 AND order_state=0", [artist_sn], function (err, results) {
			if(err) console.log('err dbomavchmpool.updatefinishtime 2', err);
			var sn = results[0].sn;
//			var period = results[0].state + 1;
			conn.query('UPDATE orderlist SET order_finishtime=ADDDATE(now(), ?) WHERE order_sn=?', [periods, sn], function (err, result) {
				if(err) console.log('err dbomavchmpool.updatefinishtime 3', err);
//				console.log('updatefinishtime result', result);
				callback(err, result);
			});//query limit
		});
		config.dbomavchmPool.release(conn);
	});
};


// 작업 상태 변경하기
exports.updateworkstate = function (artist_sn, cstate, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.updateworkstate 1', err);
		conn.query("SELECT order_sn AS sn, order_user_id AS user_id, order_photo AS photo, order_select AS mode, order_pcount AS pcount, order_price AS price, order_state AS state, order_valid AS valid, DATE_FORMAT(order_ordertime, '%Y-%m-%d') AS ordertime, DATE_FORMAT(order_finishtime, '%Y-%m-%d') AS finishtime FROM orderlist WHERE order_artist_sn=? AND order_valid=1 AND order_state<2", [artist_sn], function (err, results) {
			if(err) console.log('err dbomavchmpool.updateworkstate 2', err);
			if (results[0].sn != undefined) {
				var sn = results[0].sn;
				var state = results[0].state + 1;
				conn.query('UPDATE orderlist SET order_state=? WHERE order_sn=?', [state, sn], function (err, result) {
					if(err) console.log('err dbomavchmpool.updateworkstate 3', err);
	//				console.log('updateworkstate result', result);
					callback(err, result);
				});//query limit
			}
			else {
				callback(err);
			}
		});
		config.dbomavchmPool.release(conn);
	});
};


// 작가 작업 대기 또는 작업 중인 주문 조회
exports.findunfinishedwork = function (artist_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.findunfinishedwork 1', err);
		conn.query("SELECT order_sn AS sn, order_user_id AS user_id, order_style_sn AS style_sn, order_photo AS photo, order_thumb AS thumb, order_req AS oreq, order_select AS mode, order_pcount AS pcount, order_price AS price, order_state AS state, order_valid AS valid, DATE_FORMAT(order_ordertime, '%Y-%m-%d') AS ordertime, DATE_FORMAT(order_finishtime, '%Y-%m-%d') AS finishtime FROM orderlist WHERE order_artist_sn=? AND order_valid=1 AND ((order_state<=1) OR (order_state=2 AND order_check=0))", [artist_sn], function (err, results) {
			if(err) console.log('err dbomavchmpool.findunfinishedwork 2', err);
			if (results != undefined) {
//				console.log('findunfinishedwork results', results);
				if (results.length >= 1) {
					var data = results[0];
					callback(err, data);
				}
				else {
					var data = 0;
					callback(err, data);
				}
			} else {
				var data = 0;
				callback(err, data);
			}
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 작가 작업 완료 보기
exports.showartistorderlist = function (artist_sn, yy, mm, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err dbomavchmpool.showartistorderlist 1', err);
		conn.query("SELECT order_sn AS sn, order_photo AS photo, order_style_sn AS style_sn, order_select AS mode, order_pcount AS pcount, order_price AS price, order_state AS state, order_valid AS valid, DATE_FORMAT(order_ordertime, '%Y-%m-%d') AS ordertime, DATE_FORMAT(order_finishtime, '%Y-%m-%d') AS finishtime FROM orderlist WHERE order_artist_sn=? AND order_valid=1 AND order_state=2 AND YEAR(order_finishtime)=? AND MONTH(order_finishtime)=? AND order_check=1 ORDER BY order_sn DESC", [artist_sn, yy, mm], function (err, results) {
			if(err) console.log('err dbomavchmpool.showartistorderlist 2', err);
//			console.log('showartistorderlist results', results);
			callback(err, results);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 내 주문 내역 보기
exports.showmyorderlist = function (user_id, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err dbomavchmpool.showmyorderlist 1', err);
		conn.query("SELECT order_sn AS sn, order_artist_sn AS artist_sn, order_style_sn AS style_sn, order_photo AS photo, order_select AS mode, order_pcount AS pcount, order_price AS price, order_state AS state, order_valid AS valid, DATE_FORMAT(order_ordertime, '%Y-%m-%d') AS ordertime, DATE_FORMAT(order_finishtime, '%Y-%m-%d') AS finishtime, order_check FROM orderlist WHERE order_user_id=? AND order_valid=1 ORDER BY order_sn DESC", [user_id], function (err, results) {
			if(err) console.log('err dbomavchmpool.showmyorderlist 2', err);
//			console.log('showmyorderlist results', results);
			callback(err, results);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 주분 이메일 받기
exports.showorderemail = function (order_sn, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err dbomavchmpool.showorderemail 1', err);
		conn.query("SELECT artist_id AS artist_id FROM orderlist, artist WHERE order_sn=? AND orderlist.order_artist_sn=artist.artist_sn", [order_sn], function (err, result) {
			if(err) console.log('err dbomavchmpool.showorderemail 2', err);
//			console.log('showorderinfo results', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 주분 정보 상세 보기
exports.showorderinfo = function (order_sn, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err dbomavchmpool.showorderinfo 1', err);
		conn.query("SELECT order_sn AS sn, order_style_sn AS style_sn, order_artist_sn AS artist_sn, artist.artist_name AS artist_name, style.style_name AS style_name, order_photo AS photo, order_thumb AS thumb, order_req AS oreq, order_select AS mode, order_pcount AS pcount, order_price AS price, order_state AS state, DATE_FORMAT(order_ordertime, '%Y-%m-%d') AS ordertime, DATE_FORMAT(order_finishtime, '%Y-%m-%d') AS finishtime FROM orderlist, style, artist WHERE order_sn=? AND orderlist.order_artist_sn=artist.artist_sn AND orderlist.order_style_sn=style.style_sn", [order_sn], function (err, result) {
			if(err) console.log('err dbomavchmpool.showorderinfo 2', err);
//			console.log('showorderinfo results', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 주분 GCM 아이디 얻기
exports.getregistid = function (order_sn, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err dbomavchmpool.getregistid 1', err);
		conn.query("SELECT order_registID AS registid FROM orderlist WHERE order_sn=?", [order_sn], function (err, results) {
			if(err) console.log('err dbomavchmpool.getregistid 2', err);
//			console.log('getregistid results', results);
			callback(err, results);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 주문 일련번호 체크
exports.checksn = function (callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.error('err dbomavchmpool.checksn 1', err);
		conn.query('SELECT order_sn FROM orderlist ORDER BY order_sn DESC LIMIT 1', [], function (err, result) {
			if(err) console.error('err dbomavchmpool.checksn 2', err);
			callback(err, result);
		});
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});
}


// 주문하기
exports.addorder = function (data, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err dbomavchmpool.addorder 1', err);
		conn.query('INSERT INTO orderlist (order_sn, order_user_id, order_artist_sn, order_style_sn, order_photo, order_thumb, order_req, order_select, order_pcount, order_price, order_state, order_goods_sn, order_goods_count, order_ordertime, order_finishtime, order_registID, order_valid) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,now(),now(),?,0)', data, function (err, result) {
			if(err) console.log('err dbomavchmpool.addorder 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 결제 완료
exports.validorder = function(order_sn, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err dbomavchmpool.validorder 1', err);
		conn.query('UPDATE orderlist SET order_valid=?	WHERE order_sn=?;', [1, order_sn], function (err, result) {
			if(err) console.log('err dbomavchmpool.validorder 2', err);
//			console.log('validorder result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 주문 취소
exports.cancelorder = function(order_sn, user_id, state, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err dbomavchmpool.cancelorder 1', err);
		conn.query('DELETE FROM orderlist WHERE order_sn=? AND order_user_id=? AND order_valid=?;', [order_sn, user_id, state], function (err, result) {
			if (err) console.log('err dbomavchmpool.cancelorder 2', err);
//			console.log('cancelorder result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 요구사항 수정
exports.updatereqorder = function(order_sn, userreq, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err dbomavchmpool.updatereqorder 1', err);
		conn.query('UPDATE orderlist SET order_req=? WHERE order_sn=? AND order_state=0;', [userreq, order_sn], function (err, result) {
			if (err) console.log('err dbomavchmpool.updatereqorder 2', err);
//			console.log('cancelorder result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 결제 안 된 주문 삭제
exports.delinvalidorder = function (order_sn, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err dbomavchmpool.delinvalidorder 1', err);
		conn.query('DELETE FROM orderlist WHERE order_valid=? AND order_sn=?;', [0, order_sn], function (err, result) {
			if (err) console.log('err dbomavchmpool.delinvalidorder 2', err);
//			console.log('delinvalidorder result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 결제 안 된 주문의 일련번호 얻기
exports.showinvalidorder = function (callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.showinvalidorder 1, err');
		conn.query("SELECT order_sn, order_photo, order_thumb FROM orderlist WHERE order_valid=? AND order_ordertime < SUBTIME(now(), '00:10:00.000000')", [0], function (err, results) {
			if (err) console.log('err dbomavchmpool.showinvalidorder 2', err);
//			console.log('showinvalidorder results', results);
			callback(err, results);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 작업 완료된 주문의 일련번호 얻기
exports.showcompleteorder = function (callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.showcompleteorder 1, err');
		conn.query("SELECT order_sn, order_photo, order_thumb FROM orderlist WHERE order_valid=? order_check=? AND order_finishtime < SUBTIME(now(), INTERVAL 5 DAY)", [1, 1], function (err, results) {
			if (err) console.log('err dbomavchmpool.showcompleteorder 2', err);
//			console.log('showcompleteorder results', results);
			callback(err, results);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};