var app_info = require('../models/app_info');

// 앱 정보 가져오기
exports.getAppInfo = function (req, res) {
	try {
		// 앱 정보 가져오기
		app_info.showappinfo(function (err, results) {
			if (err) {
				console.error(err);
				res.json({ result: 'fail', msg: err });
			} else {
				res.json({ result: 'success', data: results[0] });
			}
		});
	} catch (err) {
		console.error(err);
	}
};