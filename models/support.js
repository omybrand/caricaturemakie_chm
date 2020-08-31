var config  = require('../config/config');

// 문의내역 정보 보기
exports.showmycontact = function (user_sn, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err support.showmycontact 1', err);
			// console.log('data', data);
			conn.query("SELECT contact_sn, contact_content, DATE_FORMAT(contact_time, '%Y-%m-%d') AS contact_time, contact_return, contact_success FROM contact WHERE contact_user_sn=?;", [user_sn], function (err, results) {
				if (err) console.error('err support.showmycontact 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 문의하기
exports.addcontact = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err support.addcontact 1', err);
			// console.log('data', data);
			conn.query("INSERT INTO contact(contact_user_sn, contact_content, contact_success, contact_time) VALUES (?,?,0,NOW());", data, function (err, results) {
				if (err) console.error('err support.addcontact 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};