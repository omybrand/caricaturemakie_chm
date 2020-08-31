var config  = require('../config/config');

/**
 * 작가정보 관련 DB 기능
 **/

 // 특정 작가 상세 정보
 exports.getartistinfo = function (artist_sn, callback) { //리스트 풀
 	config.dbomavchmPool.acquire(function (err, conn) {
 		if (err) console.log('err artist.getartistinfo 1', err);
 		conn.query('SELECT artist_sn, artist_name, artist_photo, artist_ment, artist_able, artist_weekend FROM artist WHERE artist_sn=?', [artist_sn], function (err, results) {
 			if (err) console.log('err artist.getartistinfo 2', err);
 //			console.log('showartistlist results', results);
 			var datas = results;
 			callback(err, datas);
 		});//query limit
 		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
 	});//pool
 };


 // 작가 공지사항
 exports.artistnoticelist = function (callback) {
 	config.dbomavchmPool.acquire(function (err, conn) {
 		if (err) console.log('err artist.artistnoticelist 1', err);
 		conn.query("SELECT notice_a_sn AS sn, notice_a_title AS title, DATE_FORMAT(notice_a_date, '%Y-%m-%d') AS notice_date, notice_a_content AS content FROM notice_a ORDER BY notice_a_date DESC", [], function (err, results) {
 				if(err) console.log('err artist.artistnoticelist 2', err);
 //				console.log('artistnoticelist results', results);
 				var datas = results;
 				callback(err, datas);
 		});//query limit
 		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
 	});//pool
 };


// 작가 전체 정보
exports.showartistlist = function (callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err artist.showartistlist 1', err);
		conn.query('SELECT artist_sn, artist_name, artist_photo, artist_able FROM artist', [], function (err, results) {
			if (err) console.log('err artist.showartistlist 2', err);
//			console.log('showartistlist results', results);
			var datas = results;
			callback(err, datas);
		});//query limit
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});//pool
};


// 특정 작가 상세 정보
exports.showartistinfo = function (artist_sn, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err artist.showartistinfo 1', err);
		conn.query('SELECT artist_sn, artist_name, artist_photo, artist_ment, artist_able FROM artist WHERE artist_sn=?', [artist_sn], function (err, results) {
			if (err) console.log('err artist.showartistinfo 2', err);
//			console.log('showartistlist results', results);
			var datas = results;
			callback(err, datas);
		});//query limit
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});//pool
};


// 작가 포트폴리오 정보 얻기
exports.showartistports = function (artistsn, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err artist.showartistport 1', err);
		conn.query('SELECT artist_port FROM artist a, artist_port ap WHERE a.artist_sn=ap.artist_sn AND a.artist_sn=?', [artistsn], function (err, results) {
			if (err) console.log('err artist.showartistport 2', err);
//			console.log('showartistinfo results', results);
			var datas = results;
			callback(err, datas);
		});//query limit
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});//pool
};


// 주문할 때 작가 상세 정보
exports.showorderartistinfo = function (artistsn, callback) { //리스트 풀
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err artist.showorderartistinfo 1', err);
		conn.query('SELECT artist_sn, artist_id, artist_name, artist_ment, artist_photo, artist_port1, artist_port2, artist_port3, artist_port4, artist_port5, artist_port6, artist_able FROM artist WHERE artist_sn=?', [artistsn], function (err, results) {
			if (err) console.log('err artist.showorderartistinfo 2', err);
			// console.log('showorderartistinfo results', results);
			var datas = results;
			callback(err, datas);
		});//query limit
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});//pool
};


// 작가 일련번호 체크
exports.checkartistsn = function (callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.error('err artist.checkartistsn 1', err);
		conn.query('SELECT artist_sn FROM artist ORDER BY artist_sn DESC LIMIT 1', [], function (err, result) {
			if (err) console.error('err artist.checkartistsn 2', err);
//			console.log(result);
			callback(err, result);
		});
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});
}


// 아이디 중복 체크
exports.checkartistid = function (data, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.error('err artist.checkartistid 1', err);
		conn.query('SELECT COUNT(*) cnt FROM artist WHERE artist_id=?', data, function (err, result) {
			if (err) console.error('err artist.checkartistid 2', err);
			callback(err, result[0]);
		});
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});
};


// 작가 정보 수정하기 (작가용)
exports.updateinfo = function (artist_sn, data, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.error('err artist.updateinfo 1', err);
		// console.log('data', data);
		conn.query('UPDATE artist SET artist_weekend=?, artist_ment=?, artist_able=? WHERE artist_sn=?;', data, function (err, result) {
			if (err) console.error('err artist.updateinfo 2', err);
			callback(err, result);
		});
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});
};


// 작가 로그인
exports.login = function (id, pwd, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.error('err artist.login 1 ', err);
		conn.query('SELECT count(*) cnt FROM artist WHERE artist_id=?', [id], function (err, result) {
			if (err) console.error('err artist.login 2 ', err);
			// console.log(result[0].cnt);
			if(result[0].cnt == 0) {
				callback(err, {result : 'fail', msg : 'id'});
			} else {
				conn.query('SELECT count(*) cnt FROM artist WHERE artist_id=? AND artist_pwd=?', [id, pwd], function (err, result) {
					// console.log(result[0].cnt);
					if (result[0].cnt == 0) {
						callback(err, { result : "fail", msg : "pwd" });
					}
					else
					{
						conn.query('SELECT artist_sn, artist_name FROM artist WHERE artist_id=? AND artist_pwd=?', [id, pwd], function (err, result) {
							callback(err, { result : "success", artist_sn: result[0].artist_sn, artist_name: result[0].artist_name });
						});
					}
				});
			}
		});
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});
};