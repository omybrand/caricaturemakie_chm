var support = require('../models/support');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var htmlToText = require('nodemailer-html-to-text').htmlToText;

// 앱 고객센터
// 자신의 문의 내역 리스트
exports.showMylist = function (req, res) {
	try {
		var user_sn = req.body.user_sn;
		// 자신의 문의 내역 리스트 얻기
		support.showmycontact(user_sn, function (err, results) {
			if (err) {
				console.error(err);
				res.json({ result: 'fail', msg: err})
			} else {
				res.json({ result: 'success', datas: results });
			}
		});
	} catch (err) {
		console.error(err);
	}
};


// 문의 추가
exports.sendContact = function (req, res) {
	try {
		var user_sn = req.body.user_sn;
		var contact_content = req.body.content;
		var data = [user_sn, contact_content];

		// 문의하기
		support.addcontact(data, function (err, results) {
			if (err) {
				console.error(err);
				res.json({ result: 'fail', msg: err });
			} else {
				var transport = nodemailer.createTransport(smtpTransport({
					host: 'localhost'
				}));

				transport.use('compile', htmlToText());

				var content = '<div id="frame"><a href="https://www.omybrand.com/chm/manage">관리자 페이지</a></div>';

				var mailOptions = {
					from: '<omavmail@omybrand.com>',
					to: 'my@omybrand.com',
					subject: '[캐리커쳐 마키] 관리자 페이지에서 문의사항을 확인해주세요.',
					html: content
				};

				// console.log('mail 옵션 설정 완료!');
				// 메일 보내기
				transport.sendMail(mailOptions, function (err, response){
					if (err){
						console.error(err);
						res.json({ result : 'fail', msg : err });
					} else {
						// console.log("Message sent : " + response.message);
						res.json({ result : 'success' });
					}
					transport.close();
				});
			}
		});
	} catch (err) {
		console.error(err);
	}
};


// 자주 하는 질문
exports.faqList = function (req, res) {
	try {
		res.render("app_faq");
	} catch (err) {
		console.error(err);
	}
};