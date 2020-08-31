var config  = require('../config/config');

/*******************
		로그관리
*********************/

exports.userlog = function (info, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.error('err log.userlog 1', err);
		conn.query('INSERT INTO userlog(user_sn, service_code, service_success, fail_reason, user_ip, user_mac, logtime, fail_check) VALUES(?,?,?,?,?,?,now(),?)', info, function (err, result) {
			if (err) console.error('err log.userlog 2', err);
			callback(err, result);
		});
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});
};

exports.getfailcount = function (user_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if(err) console.error('err log.userlog 1', err);
		conn.query('SELECT SUM(fail_check) FROM userlog GROUP BY user_sn', user_sn, function (err, result) {
			if (err) console.error('err log.userlog 2', err);
			callback(err, result);
		});
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});
};