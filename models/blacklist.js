var config  = require('../config/config');

/*******************
	블랙리스트관리
*********************/

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