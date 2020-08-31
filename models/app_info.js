var config  = require('../config/config');

// 앱 정보 보여주기
exports.showappinfo = function (callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err app_info.showappinfo 1', err);
			// console.log('data', data);
			conn.query('SELECT * FROM app_info;', [], function (err, results) {
				if (err) console.error('err app_info.showappinfo 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};