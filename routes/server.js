//서버 동작 여부를 체크한다.
exports.checkServer = function(req, res){
	try
	{//예외처리로 묶어주기
		res.json({code:'200'});
	//Try Catch
	} catch (err){
		if (err){
			console.log(__filename + ' checkServer err', err);
		}
	}
};

exports.checkDB = function(req, res){
	try
	{//예외처리로 묶어주기
		var dbPool = require('../models/dbPool.js');
		dbPool.getConnection(function (err, conn) {
			if (err){ //DB 연결 에러 err 발생했기에 conn 객체가 없다. conn.release() 사용시 에러 발생
				console.log('pool 에러', err);
				return res.json({code:'500', errorMessage: 'DB연결 에러입니다.'});
			}
			//DB 연결 성공
			conn.query('SELECT count(*) cnt FROM user',
					[], function (err, result) {
				if (err){ //SELECT에러
					console.log('err', err);
					conn.release();
					return res.json({code:'400', errorMessage: 'SELECT문 에러입니다. 키와 값을 확인해주세요.'});
				}
				//SELECT성공
				if (result != null && result.length == 1) {
					var cnt = result[0].cnt;
					console.log('cnt', cnt);
					var datas = {cnt:cnt, code:'200'};
					res.json(datas);
				}
				if (conn !== null) { conn.release(); }//DB연결 풀 해제
			}); //SELECT문
		}); //pool.getConnection
	//Try Catch
	} catch(err){
		if(err){ console.log(__filename + ' checkDB err', err); }
	}
};