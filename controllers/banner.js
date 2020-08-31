var banner = require('../models/banner');

// 앱 배너 리스트 가져오기
exports.getBanner = function (req, res) {
	// console.log(req);
	try {
		// 배너 리스트 가져오기
		banner.showbanner(function (err, results) {
			if (err) {
				console.error(err);
				res.json({ result: 'fail', msg: err });
			} else {
				res.json({ result: 'success', banner1: results[0], banner2: results[1], banner3: results[2], banner4: results[3], banner5: results[4] });
			}
		});
	} catch (err) {
		console.error(err);
	}
};