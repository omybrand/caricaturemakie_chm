var config  = require('../config/config');

/**
 * 상품정보 관련 DB 기능
 **/

// 상품 리스트 가져오기
exports.getlist = function (callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err goods.getlist 1', err);
		conn.query("SELECT * FROM goods ORDER BY goods_name ASC", [], function (err, results) {
			if(err) console.log('err goods.getlist 2', err);
			callback(err, results);
		});//query limit
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});//pool
};


// 해당 상품 옵션 리스트 가져오기
exports.getoptionlist = function (goods_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err goods.getoptionlist 1', err);
		conn.query("SELECT goods_option_sn, goods_option_name, goods_option_price, artist_sn FROM goods_option WHERE goods_sn=? ORDER BY goods_option_name ASC", [goods_sn], function (err, results) {
			if(err) console.log('err goods.getoptionlist 2', err);
			callback(err, results);
		});//query limit
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});//pool
};

// 해당 상품 포트폴리오 리스트 가져오기
exports.getportlist = function (goods_sn, callback) {
	config.dbomavchmPool.acquire(function (err, conn) {
		if (err) console.log('err goods.getportlist 1', err);
		conn.query("SELECT goods_port_sn, goods_port FROM goods_port WHERE goods_sn=? ORDER BY goods_port_sn ASC", [goods_sn], function (err, results) {
			if(err) console.log('err goods.getportlist 2', err);
			callback(err, results);
		});//query limit
		config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
	});//pool
};