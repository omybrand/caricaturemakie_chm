var reqproc = require('./reqproc');
var resproc = require('./resproc');
var async = require('async');

// id 및 기타 개인 정보 암호화
exports.security_encodata = function (data, callback) {
	var len = data.length;
	// console.log(len);
	var tempdatas = [];
	if (len > 14) {
		for (var i = 0; i < Math.ceil(len / 14); i++) {
			// console.log(i);
			var stp = i * 14;
			var etp = (i + 1) * 14;
			if (etp > len) {
				etp = len;
			}
			tempdatas.push(data.substring(stp, etp));
			// console.log(data.substring(stp, etp));
		}
	}
	else {
		tempdatas.push(data);
	}

	var encodata = "";

	async.each(tempdatas, function (item, callback) {
		reqproc.reqdataproc(item, function (err, result) {
			// console.log(data);
			// console.log(result);
			encodata += result;
		});
		callback();
	});
	callback(encodata);
};

// 비밀번호 암호화
exports.security_pwdproc = function (pwd, callback) {
	// 비밀번호 해쉬
	reqproc.reqpwdproc(pwd, function (err, result) {
		var hashpwd = result;
		callback(hashpwd);
	});
};

// id 및 기타 개인 정보 복호화
exports.security_decodata = function (data, callback) {
	var len = data.length;
	// console.log(len);
	var tempdatas = [];
	if (len > 24) {
		for (var i = 0; i < Math.ceil(len / 24); i++) {
			// console.log(i);
			var stp = i * 24;
			var etp = (i + 1) * 24;
			if (etp > len) {
				etp = len;
			}
			tempdatas.push(data.substring(stp, etp));
			// console.log(data.substring(stp, etp));
		}
	}
	else {
		tempdatas.push(data);
	}

	var decodata = "";

	async.each(tempdatas, function (item, callback) {
		resproc.resdataproc(item, function (err, result) {
			// console.log(item);
			// console.log(result);
			decodata += result;
		});
		callback();
	});

	// console.log(decodata);
	callback(decodata);
};