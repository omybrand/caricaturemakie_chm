var myTodo = angular.module('myTodo', []);

function mainController($scope, $http) {
	$scope.formData = { yy: '', mm: '' };

	$http.get('/chm/artist/getdate').success(function (data) {
		$scope.formData.yy = data.yy;
		$scope.formData.mm = data.mm;
		console.log($scope.formData);

		$http.post('/chm/artist/taskhistory', $scope.formData).success(function (data) {
			for (var i in data) {
				if (data[i].mode == 0) {
					data[i].modename = "상반신 스케치";
				} else if (data[i].mode == 1) {
					data[i].modename = "상반신 포인트컬러";
				} else if (data[i].mode == 2) {
					data[i].modename = "상반신 풀컬러";
				} else if (data[i].mode == 3) {
					data[i].modename = "전신 스케치";
				} else if (data[i].mode == 4) {
					data[i].modename = "전신 포인트컬러";
				} else if (data[i].mode == 5) {
					data[i].modename = "전신 풀컬러";
				}
			}
			$scope.todos = data;
		}).error(function (data) {
			console.log('error : ', error);
		});

//		$scope.todos = data;
	}).error(function (data) {
		console.log('error : ', error);
	});



	$scope.findTodo = function () {

		console.log('formData : ', $scope.formData);
		$http.post('/chm/artist/taskhistory', $scope.formData).success(function (data) {
			console.log('formData : ', $scope.formData);
			$scope.todos = data;
		}).error(function (data) {
			console.log('error', error);
		});
	};
}