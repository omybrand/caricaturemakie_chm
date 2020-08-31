var config  = require('../config/config');

// 예약 정보 불러오기(작가)
exports.getartistreserveinfo = function(reserve_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err reserve.getartistreserveinfo 1', err);
		conn.query("SELECT reserve_sn, artist_name, style_name, reserve_photo1, reserve_photo2, reserve_photo3, reserve_select, reserve_size, reserve_pcount, reserve_req, reserve_addpay, reserve_reason, reserve_reject, reserve_state, DATE_FORMAT(reserve_wanttime, '%Y-%m-%d') AS reserve_wanttime, DATE_FORMAT(reserve_time1, '%Y-%m-%d') AS reserve_time1, DATE_FORMAT(reserve_time2, '%Y-%m-%d') AS reserve_time2, DATE_FORMAT(reserve_time3, '%Y-%m-%d') AS reserve_time3 FROM reserve r, style s, artist a WHERE r.reserve_sn=? AND r.reserve_style_sn=s.style_sn AND r.reserve_artist_sn=a.artist_sn ORDER BY reserve_sn DESC", [reserve_sn], function (err, results) {
				if(err) console.log('err reserve.getartistreserveinfo 2', err);
				// console.log('getartistreserveinfo results', results);
				callback(err, results);
		}); //query limit
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});//pool
};


// 예약 수락 내역 불러오기(작가)
exports.getagreeartistlist = function(artist_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err reserve.getagreeartistlist 1', err);
		conn.query("SELECT reserve_sn, style_name, reserve_select, reserve_size, reserve_pcount FROM reserve r, style s WHERE r.reserve_artist_sn=? AND r.reserve_style_sn=s.style_sn AND r.reserve_state=1 AND r.reserve_reject <> 1 AND r.reserve_reject <> 3 ORDER BY reserve_sn DESC", [artist_sn], function (err, results) {
				if(err) console.log('err reserve.getagreeartistlist 2', err);
				// console.log('getartistlist results', results);
				callback(err, results);
		}); //query limit
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});//pool
};

// 예약 요청 내역 불러오기(작가)
exports.getartistlist = function(artist_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err reserve.getartistlist 1', err);
		conn.query("SELECT reserve_sn, style_name, reserve_select, reserve_size, reserve_pcount FROM reserve r, style s WHERE r.reserve_artist_sn=? AND r.reserve_style_sn=s.style_sn AND r.reserve_state=0 ORDER BY reserve_sn DESC", [artist_sn], function (err, results) {
				if(err) console.log('err reserve.getartistlist 2', err);
				// console.log('getartistlist results', results);
				callback(err, results);
		}); //query limit
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});//pool
};


// 예약 내역 불러오기(사용자)
exports.getmylist = function (user_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err reserve.getmylist 1', err);
		conn.query("SELECT reserve_sn, style_name, reserve_state, reserve_reject FROM reserve r, style s WHERE reserve_user_sn=? AND reserve_style_sn=style_sn ORDER BY reserve_sn DESC", [user_sn], function (err, results) {
				if(err) console.log('err reserve.getmylist 2', err);
				// console.log('getmylist results', results);
				var datas = results;
				callback(err, datas);
		}); //query limit
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});//pool
};


// 예약 정보 불러오기(사용자)
exports.getreservationinfo = function (reserve_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err reserve.getreservationinfo 1', err);
		conn.query("SELECT reserve_sn, reserve_user_sn, reserve_artist_sn, reserve_style_sn, style_name, style_cover, reserve_photo1, reserve_photo2, reserve_photo3, reserve_req, reserve_select, reserve_size, reserve_pcount, reserve_price, reserve_state, reserve_addpay, DATE_FORMAT(reserve_wanttime, '%Y-%m-%d') AS reserve_wanttime, DATE_FORMAT(reserve_gettime, '%Y-%m-%d') AS reserve_gettime, DATE_FORMAT(reserve_finishtime, '%Y-%m-%d') AS reserve_finishtime, DATE_FORMAT(reserve_time1, '%Y-%m-%d') AS reserve_time1, DATE_FORMAT(reserve_time2, '%Y-%m-%d') AS reserve_time2, DATE_FORMAT(reserve_time3, '%Y-%m-%d') AS reserve_time3, reserve_reject, reserve_reason FROM reserve r, style s WHERE reserve_sn=? AND r.reserve_style_sn=s.style_sn;", [reserve_sn], function (err, results) {
				if(err) console.log('err reserve.getreservationinfo 2', err);
				// console.log('getmylist results', results);
				callback(err, results);
		}); //query limit
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});//pool
};


// 예약하기
exports.makereservation = function (data, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err reserve.makereservation 1', err);
		conn.query('INSERT INTO reserve (reserve_user_sn, reserve_artist_sn, reserve_style_sn, reserve_photo1, reserve_req, reserve_select, reserve_size, reserve_pcount, reserve_price, reserve_state, reserve_wanttime, reserve_gettime, reserve_reject) VALUES (?,?,?,?,?,?,?,?,?,0,?,now(),0)', data, function (err, result) {
			if(err) console.log('err reserve.makereservation 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 방금 예약한 예약 번호 알아내기
exports.getreservationsn = function (user_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err reserve.getreservationsn 1', err);
		conn.query('SELECT reserve_sn FROM reserve WHERE reserve_user_sn=? ORDER BY reserve_gettime DESC LIMIT 1;', [user_sn], function (err, results) {
			if(err) console.log('err reserve.getreservationsn 2', err);
			// console.log('addorder result', result);
			callback(err, results);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};

// 예약 사진 경로 업데이트
exports.updatephoto = function (datas, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err reserve.updatephoto 1', err);
		conn.query('UPDATE reserve SET reserve_photo1=?, reserve_photo2=?, reserve_photo3=? WHERE reserve_sn=?;', datas, function (err, result) {
			if(err) console.log('err reserve.updatephoto 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		}); //query limit
		config.dbomavchmPool.release(conn);
	}); //pool
};

// 예약 삭제
exports.cancelreservation = function (data, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err reserve.cancelreservation 1', err);
		conn.query('DELETE FROM reserve WHERE reserve_sn=? AND reserve_user_sn=?;', data, function (err, result) {
			if(err) console.log('err reserve.cancelreservation 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};

// 예약 수락하기
exports.okreservation = function (data, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err reserve.okreservation 1', err);
		conn.query('UPDATE reserve SET reserve_state=1, reserve_reject=0, reserve_finishtime=NOW(), reserve_reason=?, reserve_addpay=?, reserve_time1=?, reserve_time2=?, reserve_time3=? WHERE reserve_sn=?;', data, function (err, result) {
			if(err) console.log('err reserve.okreservation 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};

// 예약 변경하기
exports.changereservation = function (data, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err reserve.changereservation 1', err);
		conn.query('UPDATE reserve SET reserve_state=1, reserve_reject=?, reserve_finishtime=NOW(), reserve_pcount=?, reserve_reason=?, reserve_addpay=?, reserve_time1=?, reserve_time2=?, reserve_time3=? WHERE reserve_sn=?;', data, function (err, result) {
			if(err) console.log('err reserve.changereservation 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};

// 예약 거절하기
exports.rejectreservation = function (data, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err reserve.rejectreservation 1', err);
		conn.query('UPDATE reserve SET reserve_state=1, reserve_reject=?, reserve_finishtime=NOW(), reserve_reason=? WHERE reserve_sn=?;', data, function (err, result) {
			if(err) console.log('err reserve.rejectreservation 2', err);
			// console.log('rejectreservation result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 작가 이메일 얻기
exports.getartistemail = function (reserve_sn, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err reserve.getartistemail 1', err);
		conn.query('SELECT artist_id FROM reserve r, artist a WHERE r.reserve_artist_sn=a.artist_sn AND reserve_sn=?;', [reserve_sn], function (err, result) {
			if(err) console.log('err reserve.getartistemail 2', err);
			console.log('getartistemail result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};

// 사용자 GCM ID 얻기
exports.getusergcm = function (reserve_sn, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err reserve.getusergcm 1', err);
		conn.query('SELECT user_registID FROM reserve r, user u WHERE r.reserve_user_sn=u.user_sn AND reserve_sn=?;', [reserve_sn], function (err, result) {
			if(err) console.log('err reserve.getusergcm 2', err);
			console.log('getusergcm result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};


// 예약 거절 후 7일이 지난 리스트 뽑기
exports.showrejectreserve = function (callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.showinvalidorder 1, err');
		conn.query("SELECT reserve_sn, reserve_photo1, reserve_photo2, reserve_photo3 FROM reserve WHERE reserve_state=1 AND (reserve_reject=2 OR reserve_reject=4) AND reserve_finishtime < DATE_SUB(now(), INTERVAL 7 DAY);", [0], function (err, results) {
			if (err) console.log('err dbomavchmpool.showinvalidorder 2', err);
			// console.log('showinvalidorder results', results);
			callback(err, results);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};

// 예약 수락 또는 변경 요청 후 2일이 지난 리스트 뽑기
exports.shownotpayreserve = function (callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err dbomavchmpool.showinvalidorder 1, err');
		conn.query("SELECT reserve_sn, reserve_photo1, reserve_photo2, reserve_photo3 FROM reserve WHERE reserve_state=1 AND (reserve_reject=0 OR reserve_reject=1 OR reserve_reject=3) AND reserve_finishtime < DATE_SUB(now(), INTERVAL 3 DAY);", [0], function (err, results) {
			if (err) console.log('err dbomavchmpool.showinvalidorder 2', err);
			// console.log('showinvalidorder results', results);
			callback(err, results);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};

// 예약 삭제(관리자용)
exports.delreservation = function (reserve_sn, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.log('err reserve.delreservation 1', err);
		conn.query('DELETE FROM reserve WHERE reserve_sn=?;', [reserve_sn], function (err, result) {
			if(err) console.log('err reserve.delreservation 2', err);
			// console.log('addorder result', result);
			callback(err, result);
		});//query limit
		config.dbomavchmPool.release(conn);
	});//pool
};