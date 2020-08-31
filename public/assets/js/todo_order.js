var myTodo = angular.module('myTodo', []);

function mainController($scope, $http) {
	$scope.formData = { mode: '0', yy: '', mm: '' };

	$http.get('/chm/manage/orderlist/getdate').success(function (data) {
		$scope.formData.yy = data.yy;
		$scope.formData.mm = data.mm;
		// console.log($scope.formData);

		$http.post('/chm/manage/orderlist/getalllist', $scope.formData).success(function (data) {
			$scope.todos = data.data;
			// console.log(data.data);
		}).error(function (data) {
			console.log('error : ', error);
		});

//		$scope.todos = data;
	}).error(function (data) {
		console.log('error : ', error);
	});



	$scope.findTodo = function () {
		if ($scope.formData)
		// console.log('formData : ', $scope.formData);
		$http.post('/chm/manage/orderlist/getalllist', $scope.formData).success(function (data) {
			console.log('formData : ', $scope.formData);
			$scope.todos = data.data;
		}).error(function (data) {
			console.log('error', error);
		});
	};
}