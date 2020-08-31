var goods = require('../models/goods');

// 상품 리스트 가져오기 - 안 씀
exports.getGoodsList = function (req, res) {
	try {
		goods.getlist(function (err, results) {
			if (err) {
				console.error(err);
				res.json({ result: 'fail', msg: err });
			} else {
				res.json({ result: 'success', datas: results });
			}
		});
	} catch (err) {
		console.error(err);
	}
};


// 상품 옵션 및 포트폴리오 리스트 가져오기 - 안 씀
exports.getGoodsInfo = function (req, res) {
	try {
		var goods_sn = req.body.goods_sn;
		if (goods_sn == undefined) {
			res.json({ result: 'fail', msg: 'invalid' });
			return;
		}
		goods.getoptionlist(goods_sn, function (err, results) {
			if (err) {
				console.error(err);
				res.json({ result: 'fail', msg: err });
			} else {
				goods.getportlist(goods_sn, function (err, results2) {
					if (err) {
						console.error(err);
						res.json({ result: 'fail', msg: err });
					} else {
						res.json({ result: 'success', datas: results, datas2: results2 });
					}
				});
			}
		});
	} catch (err) {
		console.error(err);
	}
};