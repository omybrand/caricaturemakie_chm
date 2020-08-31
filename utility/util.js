// 일련번호 생성을 위해 0을 붙임
exports.leadingZeros = function (n, digits, callback) {
	var zero = '';
	n = n.toString();

	if (n.length < digits) {
		for (var i = 0; i < digits - n.length; i++){
			zero += '0';
		}
	}
	callback(zero + n);
};