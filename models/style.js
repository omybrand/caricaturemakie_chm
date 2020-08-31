var config  = require('../config/config');

/**
 * 스타일 관련
 */

 // 스타일 리스트(작가용)
 exports.getartiststylelist = function (artist_sn, callback) {
  	try {
  		config.dbomavchmPool.acquire(function (err, conn) {
  			if(err) console.error('err style.getartiststylelist 1', err);
  			// console.log('data', data);
  			conn.query('SELECT style_sn, artist_sn, style_name, style_cover FROM style WHERE artist_sn=?;', [artist_sn], function (err, results) {
  				if (err) console.error('err style.getartiststylelist 2', err);
  				callback(err, results);
  			});
  			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
  		});
  	} catch (err) {
  		console.error('error:', err);
  	}
 };



// 스타일 전체 리스트
exports.showstylelist = function (callback) {
 	try {
 		config.dbomavchmPool.acquire(function (err, conn) {
 			if(err) console.error('err style.showstylelist 1', err);
 			// console.log('data', data);
 			conn.query('SELECT style_sn, s.artist_sn AS artist_sn, style_name, style_category, style_cover, style_digital, style_discount, style_onesketch, style_onepointcolor, style_onecolor, style_onefullsketch, style_onefullpointcolor, style_onefullcolor, style_disonesketch, style_disonepointcolor, style_disonecolor, style_disonefullsketch, style_disonefullpointcolor, style_disonefullcolor, artist_able, artist_weekend FROM style s, artist a WHERE s.artist_sn=a.artist_sn AND artist_longtime=0 ORDER BY style_sn DESC;', [], function (err, results) {
 				if (err) console.error('err style.showstylelist 2', err);
 				callback(err, results);
 			});
 			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
 		});
 	} catch (err) {
 		console.error('error:', err);
 	}
};

// 스타일 리스트(장르만)
exports.showstylelist1 = function (category1, callback) {
 	try {
 		config.dbomavchmPool.acquire(function (err, conn) {
 			if(err) console.error('err style.showstylelist1 1', err);
 			// console.log('data', data);
 			conn.query("SELECT style_sn, s.artist_sn AS artist_sn, style_name, style_category, style_cover, style_digital, style_discount, style_onesketch, style_onepointcolor, style_onecolor, style_onefullsketch, style_onefullpointcolor, style_onefullcolor, style_disonesketch, style_disonepointcolor, style_disonecolor, style_disonefullsketch, style_disonefullpointcolor, style_disonefullcolor, artist_able, artist_weekend FROM style s, artist a WHERE s.artist_sn=a.artist_sn AND FLOOR(style_category / 10)=? AND artist_longtime=0 ORDER BY style_sn DESC;", [category1], function (err, results) {
 				if (err) console.error('err style.showstylelist1 2', err);
 				// console.log(results);
 				callback(err, results);
 			});
 			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
 		});
 	} catch (err) {
 		console.error('error:', err);
 	}
};

// 스타일 리스트(디지털만)
exports.showstylelist2 = function (digital, callback) {
 	try {
 		config.dbomavchmPool.acquire(function (err, conn) {
 			if(err) console.error('err style.showstylelist2 1', err);
 			// console.log('data', data);
 			conn.query("SELECT style_sn, s.artist_sn AS artist_sn, style_name, style_category, style_cover, style_digital, style_discount, style_onesketch, style_onepointcolor, style_onecolor, style_onefullsketch, style_onefullpointcolor, style_onefullcolor, style_disonesketch, style_disonepointcolor, style_disonecolor, style_disonefullsketch, style_disonefullpointcolor, style_disonefullcolor, artist_able, artist_weekend FROM style s, artist a WHERE s.artist_sn=a.artist_sn AND style_digital=? AND artist_longtime=0 ORDER BY style_sn DESC;", [digital], function (err, results) {
 				if (err) console.error('err style.showstylelist2 2', err);
 				callback(err, results);
 			});
 			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
 		});
 	} catch (err) {
 		console.error('error:', err);
 	}
};

// 스타일 리스트(용도만)
exports.showstylelist3 = function (category2, callback) {
 	try {
 		config.dbomavchmPool.acquire(function (err, conn) {
 			if(err) console.error('err style.showstylelist3 1', err);
 			// console.log('data', data);
 			conn.query("SELECT style_sn, s.artist_sn AS artist_sn, style_name, style_category, style_cover, style_digital, style_discount, style_onesketch, style_onepointcolor, style_onecolor, style_onefullsketch, style_onefullpointcolor, style_onefullcolor, style_disonesketch, style_disonepointcolor, style_disonecolor, style_disonefullsketch, style_disonefullpointcolor, style_disonefullcolor, artist_able, artist_weekend FROM style s, artist a WHERE s.artist_sn=a.artist_sn AND style_category % 10=? AND artist_longtime=0 ORDER BY style_sn DESC;", [category2], function (err, results) {
 				if (err) console.error('err style.showstylelist3 2', err);
 				callback(err, results);
 			});
 			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
 		});
 	} catch (err) {
 		console.error('error:', err);
 	}
};

// 스타일 리스트(장르 & 디지털)
exports.showstylelist12 = function (category1, digital, callback) {
 	try {
 		config.dbomavchmPool.acquire(function (err, conn) {
 			if(err) console.error('err style.showstylelist12 1', err);
 			// console.log('data', data);
 			conn.query("SELECT style_sn, s.artist_sn AS artist_sn, style_name, style_category, style_cover, style_digital, style_discount, style_onesketch, style_onepointcolor, style_onecolor, style_onefullsketch, style_onefullpointcolor, style_onefullcolor, style_disonesketch, style_disonepointcolor, style_disonecolor, style_disonefullsketch, style_disonefullpointcolor, style_disonefullcolor, artist_able, artist_weekend FROM style s, artist a WHERE s.artist_sn=a.artist_sn AND FLOOR(style_category / 10)=? AND style_digital=? AND artist_longtime=0 ORDER BY style_sn DESC;", [category1, digital], function (err, results) {
 				if (err) console.error('err style.showstylelist12 2', err);
 				callback(err, results);
 			});
 			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
 		});
 	} catch (err) {
 		console.error('error:', err);
 	}
};

// 스타일 리스트(용도 & 디지털)
exports.showstylelist23 = function (category2, digital, callback) {
 	try {
 		config.dbomavchmPool.acquire(function (err, conn) {
 			if(err) console.error('err style.showstylelist23 1', err);
 			// console.log('data', data);
 			conn.query("SELECT style_sn, s.artist_sn AS artist_sn, style_name, style_category, style_cover, style_digital, style_discount, style_onesketch, style_onepointcolor, style_onecolor, style_onefullsketch, style_onefullpointcolor, style_onefullcolor, style_disonesketch, style_disonepointcolor, style_disonecolor, style_disonefullsketch, style_disonefullpointcolor, style_disonefullcolor, artist_able, artist_weekend FROM style s, artist a WHERE s.artist_sn=a.artist_sn AND style_category % 10=? AND style_digital=? AND artist_longtime=0 ORDER BY style_sn DESC;", [category2, digital], function (err, results) {
 				if (err) console.error('err style.showstylelist23 2', err);
 				callback(err, results);
 			});
 			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
 		});
 	} catch (err) {
 		console.error('error:', err);
 	}
};

// 스타일 리스트(용도 & 장르)
exports.showstylelist13 = function (category1, category2, callback) {
 	try {
 		config.dbomavchmPool.acquire(function (err, conn) {
 			if(err) console.error('err style.showstylelist13 1', err);
 			// console.log('data', data);
 			conn.query("SELECT style_sn, s.artist_sn AS artist_sn, style_name, style_category, style_cover, style_digital, style_discount, style_onesketch, style_onepointcolor, style_onecolor, style_onefullsketch, style_onefullpointcolor, style_onefullcolor, style_disonesketch, style_disonepointcolor, style_disonecolor, style_disonefullsketch, style_disonefullpointcolor, style_disonefullcolor, artist_able, artist_weekend FROM style s, artist a WHERE s.artist_sn=a.artist_sn AND style_category=? AND artist_longtime=0 ORDER BY style_sn DESC;", [category1 * 10 + category2], function (err, results) {
 				if (err) console.error('err style.showstylelist13 2', err);
 				callback(err, results);
 			});
 			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
 		});
 	} catch (err) {
 		console.error('error:', err);
 	}
};

// 스타일 리스트(용도 & 장르 & 디지털)
exports.showstylelist123 = function (category1, category2, digital, callback) {
 	try {
 		config.dbomavchmPool.acquire(function (err, conn) {
 			if(err) console.error('err style.showstylelist123 1', err);
 			// console.log('data', data);
 			conn.query("SELECT style_sn, s.artist_sn AS artist_sn, style_name, style_category, style_cover, style_digital, style_discount, style_onesketch, style_onepointcolor, style_onecolor, style_onefullsketch, style_onefullpointcolor, style_onefullcolor, style_disonesketch, style_disonepointcolor, style_disonecolor, style_disonefullsketch, style_disonefullpointcolor, style_disonefullcolor, artist_able, artist_weekend FROM style s, artist a WHERE s.artist_sn=a.artist_sn AND style_category=? AND style_digital=? AND artist_longtime=0 ORDER BY style_sn DESC;", [category1 * 10 + category2, digital], function (err, results) {
 				if (err) console.error('err style.showstylelist123 2', err);
 				callback(err, results);
 			});
 			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
 		});
 	} catch (err) {
 		console.error('error:', err);
 	}
};


// 해당 스타일 평점 구하기
exports.getstylerate = function (style_sn, callback) {
 	try {
 		config.dbomavchmPool.acquire(function (err, conn) {
 			if(err) console.error('err style.getstylerate 1', err);
 			// console.log('data', data);
 			conn.query('SELECT AVG(order_rate) AS rate FROM style s, orderlist o WHERE s.style_sn=o.order_style_sn AND o.order_valid=1 AND o.order_check=1 AND o.order_rate<=5 AND o.order_rate>0 AND o.order_style_sn=?;', [style_sn], function (err, results) {
 				if (err) console.error('err style.getstylerate 2', err);
 				callback(err, results);
 			});
 			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
 		});
 	} catch (err) {
 		console.error('error:', err);
 	}
};


// 구매 건수 구하기
exports.getordercount = function (style_sn, callback) {
 	try {
 		config.dbomavchmPool.acquire(function (err, conn) {
 			if(err) console.error('err style.getordercount 1', err);
 			// console.log('data', data);
 			conn.query('SELECT COUNT(style_sn) AS cnt FROM style s, orderlist o WHERE s.style_sn=o.order_style_sn AND o.order_valid=1 AND o.order_style_sn=?;', [style_sn], function (err, results) {
 				if (err) console.error('err style.getordercount 2', err);
 				callback(err, results);
 			});
 			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
 		});
 	} catch (err) {
 		console.error('error:', err);
 	}
};


// 예상 날짜 구하기
exports.getfinaltime = function (artist_sn, callback) {
 	try {
 		config.dbomavchmPool.acquire(function (err, conn) {
 			if(err) console.error('err style.getfinaltime 1', err);
 			// console.log('data', data);
 			conn.query("SELECT DATE_FORMAT(order_finishtime, '%Y-%m-%d') AS order_finishtime FROM orderlist o WHERE o.order_artist_sn=? AND order_finishtime >= NOW() ORDER BY order_finishtime DESC;", [artist_sn], function (err, results) {
 				// console.log(results);
 				if (err) console.error('err style.getfinaltime 2', err);
 				callback(err, results);
 			});
 			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
 		});
 	} catch (err) {
 		console.error('error:', err);
 	}
};


// 스타일 상세 정보
exports.showstyleinfo = function (style_sn, callback) { //리스트 풀
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err style.showstyleinfo 1', err);
			// console.log('data', data);
			conn.query('SELECT style_sn, s.artist_sn AS artist_sn, artist_name, artist_photo, artist_ment, style_name, style_category, style_cover, style_digital, style_description, style_discount, style_a0, style_a1, style_a2, style_add1p, style_add2p, style_add3p, style_onesketch, style_onepointcolor, style_onecolor, style_onefullsketch, style_onefullpointcolor, style_onefullcolor, style_disonesketch, style_disonepointcolor, style_disonecolor, style_disonefullsketch, style_disonefullpointcolor, style_disonefullcolor, artist_able FROM style s, artist a WHERE s.artist_sn=a.artist_sn AND style_sn=?;', [style_sn], function (err, results) {
				if (err) console.error('err style.showstyleinfo 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 스타일 포트폴리오 리스트
exports.showstyleportlist = function (style_sn, callback) { //리스트 풀
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err style.showstyleportlist 1', err);
			// console.log('data', data);
			conn.query('SELECT * FROM style_port WHERE style_sn=? ORDER BY style_port_sn;', [style_sn], function (err, results) {
				if (err) console.error('err style.showstyleportlist 2', err);
				callback(err, results);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};

// 스타일 정보 수정하기(작가용)
exports.updatestyleinfo = function (data, callback) {
	try {
		config.dbomavchmPool.acquire(function (err, conn) {
			if(err) console.error('err style.updatestyleinfo 1', err);
			// console.log('data', data);
			conn.query('UPDATE style SET style_name=?, style_onesketch=?, style_onepointcolor=?, style_onecolor=?, style_onefullsketch=?, style_onefullpointcolor=?, style_onefullcolor=?, style_description=?, style_discount=?, style_disonesketch=?, style_disonepointcolor=?, style_disonecolor=?, style_disonefullsketch=?, style_disonefullpointcolor=?, style_disonefullcolor=?, style_add1p=?, style_add2p=?, style_add3p=? WHERE style_sn=?;', data, function (err, result) {
				if (err) console.error('err style.updatestyleinfo 2', err);
				callback(err, result);
			});
			config.dbomavchmPool.release(conn); //이걸 안하면 반납이 안됨
		});
	} catch (err) {
		console.error('error:', err);
	}
};