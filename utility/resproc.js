var crypto = require('crypto');

// 복호화
exports.resdataproc = function (data, callback) {
	try {
		var key = '11dhakqmTJQJ';
		var deoutput;
		var decipher = crypto.createDecipher('aes-256-cbc', key);
		decipher.setAutoPadding(true);
		decipher.update(data, 'base64', 'utf8');
		deoutput = decipher.final('utf8');
		callback(null, deoutput);
    } catch (e) {
        if(e) console.error('e', e);
        callback(e);
    }
};