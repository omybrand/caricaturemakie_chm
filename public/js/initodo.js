var myTodo = angular.module('myTodo', []);

function mainController($scope, $http) {
	$scope.formData = { artist_sn: 'chma00000001', style_sn: 'chms00000001', sn: 'chms00000001', modes: '0', pcnt: '1', goods_sn: 'chmg00000001', goods_count: '1'};
	
	$scope.formData.style_sn = $scope.formData.sn;
	
	document.getElementById("artist_sn").value = $scope.formData.artist_sn;
	document.getElementById("style_sn").value = $scope.formData.sn;
	document.getElementById("mode").value = $scope.formData.modes;
	document.getElementById("pcount").value = $scope.formData.pcnt;
	document.getElementById("goods_sn").value = $scope.formData.goods_sn;
	document.getElementById("goods_count").value = $scope.formData.goods_count;
	
	$http.post('/chm/artist/showartistinfo', $scope.formData).success(function (data) {
//		$scope.formData = data;
//		console.log($scope.formData);
//		$scope.pcnt = parseInt(document.getElementById("pcount").value);
//		console.log(data.output);
		$scope.todo = data.output;
		document.getElementById("artist_sn").value = data.output[0].artist_sn;
		$scope.formData.artist_sn = data.output[0].artist_sn;
		
//		console.log($scope.todo);
		$scope.setVal();
//		$scope.todos = data;
	}).error(function (data) {
		console.log('error : ', error);
	});
	
	$scope.findTodo = function () {
		$scope.formData.style_sn = $scope.formData.sn;
		document.getElementById("artist_sn").value = $scope.formData.artist_sn;
		document.getElementById("style_sn").value = $scope.formData.style_sn;
		document.getElementById("mode").value = $scope.formData.modes;
		document.getElementById("pcount").value = $scope.formData.pcnt;
		document.getElementById("goods_sn").value = $scope.formData.goods_sn;
		document.getElementById("goods_count").value = $scope.formData.goods_count;
//		console.log('formData : ', $scope.formData);
		$http.post('/chm/artist/showartistinfo', $scope.formData).success(function (data) {
//			console.log('formData : ', $scope.formData);
//			$scope.pcnt = parseInt(document.getElementById("pcount").value);
//			console.log(data.output);
			document.getElementById("artist_sn").value = data.output[0].artist_sn;
			$scope.formData.artist_sn = data.output[0].artist_sn;
			$scope.todo = data.output;
			console.log($scope.todo);
			$scope.setVal();
//			console.log($scope.todo);
		}).error(function (data) {
			console.log('error', error);
		});
	};
	
	$scope.setVal = function () {
		document.getElementById("artist_sn").value = $scope.formData.artist_sn;
		document.getElementById("style_sn").value = $scope.formData.sn;
		document.getElementById("mode").value = $scope.formData.modes;
		document.getElementById("pcount").value = $scope.formData.pcnt;
		document.getElementById("goods_sn").value = $scope.formData.goods_sn;
		document.getElementById("goods_count").value = $scope.formData.goods_count;
		$scope.pcnt = parseInt($scope.formData.pcnt);
//		console.log($scope.todo);
//		console.log($scope.formData.modes);
//		console.log($scope.formData.pcnt);
		if ($scope.formData.modes == "0") {
			$scope.bp = $scope.todo[0].artist_onesketch;
		}
		else if ($scope.formData.modes == "1") {
			$scope.bp = $scope.todo[0].artist_onepointcolor;
		}
		else if ($scope.formData.modes == "2") {
			$scope.bp = $scope.todo[0].artist_onecolor;
		}
		else if ($scope.formData.modes == "3") {
			$scope.bp = $scope.todo[0].artist_onefullsketch;
		}
		else if (document.getElementById("mode").value == "4") {
			$scope.bp = $scope.todo[0].artist_onefullpointcolor;
		}
		else if (document.getElementById("mode").value == "5") {
			$scope.bp = $scope.todo[0].artist_onefullcolor;
		}
		
		if ($scope.bp == 0) {
			alert("해당 모드는 작가가 지원하지 않습니다.");
			$scope.formData.sn = $scope.formData.style_sn;
			if ($scope.todo[0].artist_onesketch != 0) {
				$scope.formData.modes = "0";
				$scope.bp = $scope.todo[0].artist_onesketch;
				document.getElementById("mode").value = $scope.formData.modes;
			}
			else if ($scope.todo[0].artist_onepointcolor != 0) {
				$scope.formData.modes = "1";
				$scope.bp = $scope.todo[0].artist_onepointcolor;
				document.getElementById("mode").value = $scope.formData.modes;
			}
			else if ($scope.todo[0].artist_onecolor != 0) {
				$scope.formData.modes = "2";
				$scope.bp = $scope.todo[0].artist_onecolor;
				document.getElementById("mode").value = $scope.formData.modes;
			}
			else if ($scope.todo[0].artist_onefullsketch != 0) {
				$scope.formData.modes = "3";
				$scope.bp = $scope.todo[0].artist_onefullsketch;
				document.getElementById("mode").value = $scope.formData.modes;
			}
			else if ($scope.todo[0].artist_onefullpointcolor != 0) {
				$scope.formData.modes = "4";
				$scope.bp = $scope.todo[0].artist_onefullpointcolor;
				document.getElementById("mode").value = $scope.formData.modes;
			}
			else if ($scope.todo[0].artist_onefullcolor != 0) {
				$scope.formData.modes = "5";
				$scope.bp = $scope.todo[0].artist_onefullcolor;
				document.getElementById("mode").value = $scope.formData.modes;
			}
		}
		
		
		if ($scope.formData.goods_sn == "chmg00000001") {
			$scope.gprice = 10000;
		}
		else if ($scope.formData.goods_sn == "chmg00000002") {
			$scope.gprice = 20000;
		}
		
		$scope.gcnt = parseInt($scope.formData.goods_count);
			
//		$scope.sum = $scope.bp + ($scope.pcnt - 1) * ($scope.bp * (1 - ($scope.pcnt * 0.05)));
		$scope.sum = $scope.bp + ($scope.pcnt - 1) * ($scope.bp * (1 - ($scope.pcnt * 0.05))) + ($scope.gprice * $scope.formData.goods_count);
		
		var name;
		if ($scope.formData.modes == "0") {
			name = $scope.todo[0].style_name + " 상반신 스케치 " + $scope.pcnt + "명";
		}
		else if ($scope.formData.modes == "1") {
			name = $scope.todo[0].style_name + " 상반신 포인트컬러 " + $scope.pcnt + "명";
		}
		else if ($scope.formData.modes == "2") {
			name = $scope.todo[0].style_name + " 상반신 풀컬러 " + $scope.pcnt + "명";
		}
		else if ($scope.formData.modes == "3") {
			name = $scope.todo[0].style_name + " 전신 스케치 " + $scope.pcnt + "명";
		}
		else if ($scope.formData.modes == "4") {
			name = $scope.todo[0].style_name + " 전신 포인트컬러 " + $scope.pcnt + "명";
		}
		else if ($scope.formData.modes == "5") {
			name = $scope.todo[0].style_name + " 전신 풀컬러 " + $scope.pcnt + "명";
		}
		document.getElementById("goods_name").value = name;
		
//		console.log(goods_price);
		
//		document.getElementById("price").value = $scope.sum + goods_price * $scope.formData.goods_count;
		document.getElementById("price").value = $scope.sum;
	};
}