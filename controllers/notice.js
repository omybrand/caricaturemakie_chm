var notice = require('../models/notice');

// 앱 공지사항 리스트 가져오기
exports.getNoticelist = function (req, res) {
	try {
		notice.showlist(function (err, results) {
			if (err) {
				console.error(err);
				res.json({ result: 'fail', msg: err });
			} else {
				res.json({ result: 'success', data: results });
			}
		});
	} catch (err) {
		console.error(err);
	}
};