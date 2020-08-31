var config  = require('../config/config');

// 앱 공지사항 리스트
exports.showlist = function (callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err manage.showlist 1', err);
			// console.log('data', data);
			conn.query("SELECT notice_sn, notice_title,  DATE_FORMAT(notice_date, '%Y-%m-%d') AS notice_date, notice_content FROM notice ORDER BY notice_date DESC;", [], function (err, results) {
				if (err) console.error('err manage.showlist 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};