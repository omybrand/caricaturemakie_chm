var config  = require('../config/config');
var order_app = require('../models/order_app');
var artist = require('../models/artist');
var style = require('../models/style');
var async = require('async');
var security = require('../utility/security');
var util = require('../utility/util');
var log = require('../models/log');
var arp = require('node-arp');


// 스타일 전체 목록 보여주기
exports.getStylelist = function(req, res)  {
	try {
		async.waterfall([
			function (callback) {
				var category1 = req.body.category1 == undefined ? 0 : parseInt(req.body.category1);
				var category2 = req.body.category2 == undefined ? 0 : parseInt(req.body.category2);
				var digital = req.body.digital == undefined ? 2 : parseInt(req.body.digital);
				if (category1 == 0) {
					if (category2 == 0) {
						if (digital == 2) {
							// 스타일 전체 보여주기
							style.showstylelist(function (err, results) {
								if (err) console.error(err);
								callback(null, results);
							});
						} else {
							// 스타일 디지털/수작업만 반영해서 보여주기
							style.showstylelist2(digital, function (err, results) {
								if (err) console.error(err);
								callback(null, results);
							});
						}
					} else {
						if (digital == 2) {
							// 스타일 용도만 반영해서 보여주기
							style.showstylelist3(category2, function (err, results) {
								if (err) console.error(err);
								callback(null, results);
							});
						} else {
							// 스타일 디지털/수작업, 용도 반영해서 보여주기
							style.showstylelist23(category2, digital, function (err, results) {
								if (err) console.error(err);
								callback(null, results);
							});
						}
					}
				} else {
					if (category2 == 0) {
						if (digital == 2) {
							// 스타일 장르 반영해서 보여주기
							style.showstylelist1(category1, function (err, results) {
								if (err) console.error(err);
								callback(null, results);
							});
						} else {
							// 스타일 장르, 디지털/수작업 반영해서 보여주기
							style.showstylelist12(category1, digital, function (err, results) {
								if (err) console.error(err);
								callback(null, results);
							});
						}
					} else {
						if (digital == 2) {
							// 스타일 장르, 용도 반영해서 보여주기
							style.showstylelist13(category1, category2, function (err, results) {
								if (err) console.error(err);
								callback(null, results);
							});
						} else {
							// 스타일 장르, 디지털/수작업, 용도 반영해서 보여주기
							style.showstylelist123(category1, category2, digital, function (err, results) {
								if (err) console.error(err);
								callback(null, results);
							});
						}
					}
				}
				// style.showstylelist(function (err, results) {
				// 	callback(null, results);
				// });
			},
			function (arg1, callback) {
				var datas = [];
				if (arg1.length == undefined || arg1 == undefined) {
					var arg1 = [];
					callback(null, arg1, datas);
				} else {
					if (arg1.length > 0) {
						for (var i in arg1) {
							// console.log(i);
							// 해당 스타일 평점 계산하기
							style.getstylerate(arg1[i].style_sn, function (err, results) {
								if (err) console.error(err);
								datas.push(results[0].rate);
								if (datas.length == arg1.length) {
									callback(null, arg1, datas);
								}
							});
						}
					} else {
						callback(null, arg1, datas);
					}
				}
			},
			function (arg1, arg2, callback) {
				var datas = [];
				if (arg1.length == 0) {
					callback(null, arg1, arg2, datas);
				} else {
					for (var i in arg1) {
						// console.log(i);
						// 해당 스타일 주문 건수 얻기
						style.getordercount(arg1[i].style_sn, function (err, results) {
							if (err) console.error(err);
							datas.push(results[0].cnt);
							if (datas.length == arg1.length) {
								callback(null, arg1, arg2, datas);
							}
						});
					}
				}
			},
			function (arg1, arg2, arg3, callback) {
				var datas = [];
				if (arg1.length == 0) {
					callback(null, arg1, arg2, arg3, datas);
				} else {
					for (var i in arg1) {
						// console.log(i);
						// 해당 스타일 주문 완료 일자 구하기
						style.getfinaltime(arg1[i].artist_sn, function (err, results) {
							if (err) console.error(err);
							if (results[0] != undefined){
								datas.push(results[0].order_finishtime);
								if (datas.length == arg1.length) {
									callback(null, arg1, arg2, arg3, datas);
								}
							} else {
								datas.push(null);
								if (datas.length == arg1.length) {
									callback(null, arg1, arg2, arg3, datas);
								}
							}
						});
					}
				}
			}, function (arg1, arg2, arg3, arg4, callback) {
				if (arg1 == 0) {
					callback(null, arg1);
				} else {
					for (var i in arg1) {
						arg1[i].rate = arg2[i];
						arg1[i].ordercnt = arg3[i];
						arg1[i].finishtime = arg4[i];
					}
					callback(null, arg1);
				}
			}
		], function (err, results) {
			if(err){
				res.json({ result: "fail", msg: err });
			} else {
				res.json({ result: "success", data: results });
			}
		});
	} catch (err) {
		if (err) console.error('err', err);
	}
};


// 스타일 정보 보여주기
exports.getStyleinfo = function(req, res)  {
	try {
		var style_sn = req.body.style_sn;
		var artist_sn;
		// 스타일 정보 얻기
		style.showstyleinfo(style_sn, function (err, results) {
			if (err) {
				console.error(err);
				res.json({ result: "fail", msg: err });
			} else {
				try {
					if (results[0].artist_sn == undefined) {
						res.json({ result: "fail", msg: err });
						return;
					}
					artist_sn = results[0].artist_sn;
					// 스타일 포트폴리오 리스트 얻기
					style.showstyleportlist(style_sn, function (err, results2) {
						if (err) {
							console.error(err);
							res.json({ result: "fail", msg: err });
						} else {
							// 스타일 마지막 주문 완료 날짜 얻기
							style.getfinaltime(artist_sn, function (err, results3) {
								if (err) {
									console.error(err);
									res.json({ result: "fail", msg: err });
								} else {
									// 스타일 평점 얻기
									style.getstylerate(style_sn, function (err, results4) {
										if (err) {
											console.error(err);
											res.json({ result: "fail", msg: err });
										} else {
											// 스타일 주문 건수 얻기
											style.getordercount(style_sn, function (err, results5) {
												if (err) {
													console.error(err);
													res.json({ result: "fail", msg: err });
												} else {
													// console.log(results3[0].order_finishtime);
													// results[0].finishtime = '2015-01-01';

													if (results3.length == 1) {
														// 만약 주문 날짜가 있다면
														results[0].finishtime = results3[0].order_finishtime;
													} else {
														// 만약 주문 날짜가 없다면
														results[0].finishtime = '';
													}

													results[0].rate = results4[0].rate;
													results[0].cnt = results5[0].cnt;
													res.json({ result: "success", info: results[0], port: results2 });
												}
											});
										}
									});
								}
							});
						}
					});
				} catch (err) {
					if (err) console.error('err', err);
					res.json({ result: "fail", msg: err });
					return;
				}

			}
		});
	} catch (err) {
		if (err) console.error('err', err);
	}
};
