$(document).ready(function(){
	$("#btnCheckServer").click(function(evt){
		$.post('/chm/checkServer', "{}", function(data){
			$("#result").html(JSON.stringify(data));
		});
	});
});

$(document).ready(function(){
	$("#btnCheckDB").click(function(evt){
		$.post('/chm/checkDB', "{}", function(data){
			$("#result").html(JSON.stringify(data));
		});
	});
});

$(document).ready(function(){
	$("#btnNotice").click(function(evt){
		$.post('/chm/support/notice', "{}", function(data){
			$("#result").html(JSON.stringify(data));
		});
	});
});

$(document).ready(function(){
	$("#btnTest").click(function(evt){
		$.post('/chm/test', "{}", function(data){
			$("#result").html(JSON.stringify(data));
		});
	});
});

$(document).ready(function(){
	$("#btnCheckallArtistinfo").click(function(evt){
		$.post('/chm/artist/showalllist', "{}", function(data){
			$("#result").html(JSON.stringify(data));
		});
	});
});

$(document).ready(function(){
	$("#btnCheckArtistinfo").click(function(evt){
		$.post('/chm/artist/showartistinfo', { artist_sn : $("#artist_sn").val() }, function(data){
			$("#result").html(JSON.stringify(data));
		});
	});
});

$(document).ready(function(){
	$("#btnCheckOrderalllist").click(function(evt){
		$.post('/chm/orderlist/showalllist', "{}", function(data){
			$("#result").html(JSON.stringify(data));
		});
	});
});

$(document).ready(function(){
	$("#btnCheckOrdermylist").click(function(evt){
		$.post('/chm/orderlist/showmylist', { userid : $("#userid").val() }, function(data){
			$("#result").html(JSON.stringify(data));
		});
	});
});

$(document).ready(function(){
	$("#btnCheckOrderartistlist").click(function(evt){
		$.post('/chm/orderlist/showartistlist', { artistsn : $("#artistsn").val() }, function(data){
			$("#result").html(JSON.stringify(data));
		});
	});
});

$(document).ready(function(){
	$("#btnCheckCrypto").click(function(evt){
		$.post('/chm/testcrypto/testreqproc', { a: $("#cryptoa").val(), b: $("#cryptob").val() }, function(data){
			$("#result").html(JSON.stringify(data));
		});
	});
});

$(document).ready(function(){
	$("#btnCheckDecrypto").click(function(evt){
		$.post('/chm/testcrypto/testresproc', { a: $("#decryptoa").val(), b: $("#decryptob").val() }, function(data){
			$("#result").html(JSON.stringify(data));
		});
	});
});

$(document).ready(function() {
	$('#upload').ajaxForm({
                // 반환할 데이터의 타입. 'json'으로 하면 IE 에서만 제대로 동작하고 크롬, FF에서는 응답을 수신하지
                // 못하는 문제점을 발견하였다. dataType을 정의하지 않을 경우 기본 값은 null 이다.
                dataType : 'text', 
		beforeSerialize: function() {
			// form을 직렬화하기전 엘레먼트의 속성을 수정할 수도 있다.
//			$('#data').attr('value', '야호');
		},
		beforeSubmit : function() {
			$('#result').html('uploading...');
		},
		success : function(data) {
			// 크롬, FF에서 반환되는 데이터(String)에는 pre 태그가 쌓여있으므로
			// 정규식으로 태그 제거. IE의 경우 정상적으로 값이 반환된다.
			data = data.replace(/[<][^>]*[>]/gi, '');
			
			// JSON 객체로 변환
			var jData = JSON.parse(data);
			
			$('#result').html('Success - ' + jData.result);
		}
	});
});