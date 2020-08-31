function TodoCtrl($scope) {
	// 할일 배열
	$scope.todos = [
		
	];
	$scope.todoOption = '';
	$scope.todoPrice = '';
	
	// 할일 추가
	$scope.addTodo = function() {
		console.log($scope.todoOption != '');
		console.log($scope.todoPrice != '');
		if($scope.todoOption != '' && $scope.todoPrice != '') {
			$scope.todos.push({option:$scope.todoOption, price:$scope.todoPrice, done:false});
			$scope.todoOption = '';
			$scope.todoPrice = '';
		} else {
			alert("두 가지 모두 입력해주세요");
		}
	};
	// 할일 정리 : 완료한 할일 지움.
	$scope.archive = function() {
		var oldTodos = $scope.todos;
		$scope.todos = [];
		angular.forEach(oldTodos, function(todo) {
			if(! todo.done) $scope.todos.push(todo);
		});
	};
}// TodoCtrl