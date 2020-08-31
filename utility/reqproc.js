var crypto = require('crypto');

// id 및 개인 정보 암호화
exports.reqdataproc = function (data, callback) {
    // console.log(data);
    try {
	var key = '11dhakqmTJQJ';
	var cipher = crypto.createCipher('aes-256-cbc', key);
    	var output;
    	cipher.setAutoPadding(true);
    	cipher.update(data, 'utf8', 'base64');
    	output = cipher.final('base64');
            // console.log(output);
    	callback(null, output);
    } catch (e) {
        if(e) console.error('e', e);
        callback(e);
    }
};

// 비밀번호 암호화
exports.reqpwdproc = function (data, callback) {
    // console.log(data);
    try {
	var shasum = crypto.createHash('sha512');
    	shasum.update(data);
    	var output = shasum.digest('hex');
        // console.log(output);
    	callback(null, output);
    } catch (e) {
        if(e) console.error('e', e);
        callback(e);
    }
};