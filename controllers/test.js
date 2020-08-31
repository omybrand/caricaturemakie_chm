// var nodemailer = require('nodemailer');
// var smtpTransport = require('nodemailer-smtp-transport');
// var htmlToText = require('nodemailer-html-to-text').htmlToText;

// var data = 'DXpPb05Ctw9pmkaFqkmuuQ==8/d/84odAGuHMqoIOb8wUg==';

// var data = 'C6vPj54z2z/jiPLXkGNbog==gUwn+o51Q1t7EH4l1a4XHQ==';

// var data = 'ymto6wHbuCpVml6gv0SQ7A==gUwn+o51Q1t7EH4l1a4XHQ==';

// var data = 'Dn2PC4u4oC5uTi32uqPGTg==0xExgx1ZG4D9IkEQ5S0FTw==';

// var data = 'B1SrQLcWm+RH9EW7SB7M6g==nN3IrIqSwx6hEz1EPr4J7w==';

// var data = 'U0+e/3MBAlCAwZIHPZEwTw==hoCof5G8aA9UvjTdZUvNEw==';

// var data = 'EOqoKV8EK89nURrYujezsg==KleAllo54+MVbYzPdr0t9A==';

// var data = 'QIqxLXqUKVtt3kcZVXkoOQ==KleAllo54+MVbYzPdr0t9A==';

// var data = 'meXUAII1SIMCt8jo/1AWRA==7C8JVaGEwnLsQkfph2Ej2Q==';

// var data = '7dDDeNNzd2UYTwpEqsJROA==tbfwDjW2WViZBKjLoRuXjg==';

// var data = '7dDDeNNzd2UYTwpEqsJROA==p4deQgSGr9dOYyAyf/xffw==';

// var data = '2d5Vjs5el3Hv616zCsQFKA==rg+yVCTulqBDewFCzYCL6A==';

// var data = '1aJ8v9H90OsXUo+fCUSSwQ==0xExgx1ZG4D9IkEQ5S0FTw==';

// var data = 'UgMDZa05exgsg7LLv+XXOg==0xExgx1ZG4D9IkEQ5S0FTw==';

// var data = '7ZR3S5ZCWOOo8o28346x2g==BCpkVINA7pUb2qHXuK5xgg==';

// var data = 'sMNU10VOT46MLqnbFh0QLA==BCpkVINA7pUb2qHXuK5xgg==';

// var data = '0+7zJEptjfDEmjvwD9f3uw==KleAllo54+MVbYzPdr0t9A==';

// var data = 'GJomj0DsUPeI1Hr71o1erg==KleAllo54+MVbYzPdr0t9A==';

// var data = 'ILcEoRixzwy5LjeIEI3AvQ==QPMKPIzSUyr/4fipmMMs1A==';

// var data = 'rd4NWT/gp/7BAlSi5UCRHQ==mjGvxFSutgiJ9mqmcZ+cyg==';

// var data = 'SXi0ZxmHI1aLrDr35POx3A==4LAOPAe3D+FsAIkV5RhonQ==';

// var data = 'QkNgsnzkcUi0Wbh6Om5m7g==rg+yVCTulqBDewFCzYCL6A==';

// var data = 'tcV4hEgQYKN4UMICZGTw6A==4LAOPAe3D+FsAIkV5RhonQ==';

// var data = 'GdcXUIAErOeDo+DklOKyyw==wFiph6shHKUyTUBbCPaBEQ==';

var data = 'woongg2@omybrand.com';

var security = require('../utility/security');

// security.security_decodata(data, function (decodata) {
// 	console.log(decodata);
// });

security.security_encodata(data, function (encodata) {
	console.log(encodata);
});

// var transport = nodemailer.createTransport(smtpTransport({
// 	host: 'localhost'
// }));

// transport.use('compile', htmlToText());

// var content = '<div id="frame"><a href="https://www.omybrand.com/chm/manage">관리자 페이지</a></div>';

// var mailOptions = {
// 	from: '<omavmail@omybrand.com>',
// 	to: data,
// 	subject: '[캐리커쳐 마키] 관리자 페이지에서 문의사항을 확인해주세요.',
// 	html: content
// };

// // console.log('mail 옵션 설정 완료!');
// transport.sendMail(mailOptions, function (err, response){
// 	if (err){
// 		console.error(err);
// 		// res.json({ result : 'fail', msg : err });
// 	} else {
// 		// console.log("Message sent : " + response.message);
// 		// res.json({ result : 'success' });
// 	}
// 	transport.close();
// });