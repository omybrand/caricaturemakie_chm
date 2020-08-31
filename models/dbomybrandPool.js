var mysql = require('mysql'); // mysql 모듈 사용

var pool;
//Cafe24
var root = process.cwd();  //Returns the current working directory of the process.  http://nodejs.org/api/process.html#process_process_cwd
//console.log('root:', root);
//console.log('조건문 참 거짓 : ', root === "C:\\Users\\JONGHYO\\workspace-nodejs\\omybrand");
if( root === "C:\\Users\\JONGHYO\\workspace-nodejs\\omav_chm_v1.1.0" ){
	//local
	pool = mysql.createPool({ // DB 연결 Pool 사용
		host : 'localhost',
		port : 3306,
		user : 'root',
		password : '1234',
		database : 'omybrand',
		charset : 'utf8_general_ci',
		connectionLimit: 10
	});
}else{
	// 가비아
	pool = mysql.createPool({
		host : 'localhost',
		port : 3306,
		user : 'root',
		password : '11dhakqmTJQ',
		database : 'omybrand',
		charset : 'utf8_general_ci',
		connectionLimit: 1000
	});
}

// 커넥션 연결
exports.getConnection = function (callback){
	pool.getConnection(function (err, conn){
		if (err){
			console.log('error', err.code);
			if (err.code === 'PROTOCOL_CONNECTION_LOST') {
				console.log('err.code === PROTOCOL_CONNECTION_LOST');
			} else {
				console.log('err.code !== PROTOCOL_CONNECTION_LOST:', err.code);
			}
			return callback(err);
		}
		callback(err, conn);
	});
};


/*******************
회원정보관리
*********************/

// 회원 일련번호 체크
exports.checksn = function (callback) {
	pool.getConnection(function (err, conn) {
		if(err) console.error('err dbomybrandpool.checksn 1', err);
		conn.query('SELECT user_sn FROM user ORDER BY user_sn DESC LIMIT 1', [], function (err, results) {
			if(err) console.error('err dbomybrandpool.checksn 2', err);
			callback(err, results);
		});
		conn.release(); //이걸 안하면 반납이 안됨
	});
}

// 아이디 중복 체크
exports.checkid = function (data, callback) {
	pool.getConnection(function (err, conn) {
		if(err) console.error('err dbomybrandpool.checkid 1', err);
		conn.query('SELECT COUNT(*) cnt FROM user WHERE user_id=?', data, function (err, result) {
			if(err) console.error('err dbomybrandpool.checkid 2', err);
			callback(err, result[0]);
		});
		conn.release(); //이걸 안하면 반납이 안됨
	});
};

// 가입하기
exports.join = function (datas, callback) {
	// 캐릭터 마키 서비스 시 이용
	/*
	pool.getConnection(function (err, conn) {
		if(err) console.error('err dbpool.join 1', err);
		conn.query('INSERT INTO userinfo(user_id, user_pwd, user_gender, user_email, user_phone, user_sns) VALUES(?,?,?,?,?,?)', data, function (err, results) {
			if(err) console.error('err dbpool.join 2', err);
			callback(err, results);
		});
		conn.release(); //이걸 안하면 반납이 안됨
	});*/

	pool.getConnection(function (err, conn) {
		if(err) console.error('err dbomybrandpool.join 1', err);

		console.log('datas', datas);
		conn.query('INSERT INTO user (user_sn, user_id, user_pwd, user_mileage, user_cash) VALUES (?, ?, ?, 0, 0);', datas, function (err, result) {
			if (err) console.error('err dbomybrandpool.join 2', err);
			callback(err, result);
		});
		conn.release(); //이걸 안하면 반납이 안됨
	});
};

// 로그인하기
exports.login = function(id, pwd, callback) {
	pool.getConnection(function (err, conn) {
		if(err) console.error('err dbomybrandpool.login 1 ', err);
		conn.query('SELECT count(*) cnt FROM user WHERE user_id=?', [id], function (err, result) {
			if(err) console.error('err dbomybrandpool.login 2 ', err);
			console.log(result[0].cnt);
			if(result[0].cnt == 0) {
				callback(err, {result : 'fail', msg : 'id'});
			} else {
				conn.query('SELECT count(*) cnt FROM user WHERE user_id=? AND user_pwd=?', [id, pwd], function (err, result) {
					console.log(result[0].cnt);
					if (result[0].cnt == 0) {
						callback(err, { result : "fail", msg : "pwd" });
					}
					else
					{
						callback(err, { result : "success", msg: '' });
					}
				});
			}
		});
		conn.release();
	});
};

// 유저 일련번호 얻기
exports.getsn = function(id, callback) {
	pool.getConnection(function (err, conn) {
		if(err) console.error('err dbomybrandpool.getsn 1 ', err);
		conn.query('SELECT user_sn FROM user WHERE user_id=?', [id], function (err, result) {
			if(err) console.error('err dbomybrandpool.getsn 2 ', err);
			console.log(result);
			callback(err, result);
		});
		conn.release();
	});
};

// 탈퇴하기
exports.secess = function (id, callback) {
	pool.getConnection(function (err, conn) {
		if(err) console.error('err dbomybrandpool.secess 1 ', err);
		conn.query('DELETE FROM user WHERE user_id=?', id, function (err, result) {
			if(err) console.error('err dbomybrandpool.secess 2 ', err);
			if(result.affectedRows == 0) {
				callback(err, { result: 'fail', msg: 'Wrong user_id' });
			} else {
				callback(err, { result: "success", msg: '' });
			}
		});
		conn.release();
	});
};


// 비밀번호 변경 키 저장
//exports.registerkey = function ()
