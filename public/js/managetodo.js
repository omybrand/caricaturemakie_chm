var myTodo = angular.module('myTodo', []);

function mainController($scope, $http) {
	$scope.formData = { order_sn : 'chmo00000001' };

	$http.post('/chm/orderlist/checklist', $scope.formData).success(function (data) {
//		console.log(data);
		$scope.todos = data.data;
		console.log($scope.todos);
	}).error(function (data) {
		console.log('error', error);
	});
//
//	$scope.updateTodo = function () {
//		// console.log('formData : ', $scope.formData);
//		$scope.formData.order_sn = order_sn;
//		$http.get('/chm/orderlist/changecheck', $scope.formData).success(function (data) {
//			// console.log('formData : ', $scope.formData);
//			$scope.todos = data.data;
//		}).error(function (data) {
//			console.log('error', error);
//		});
//	};
}