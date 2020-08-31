function TodoCtrl($scope) {
	// 할일 배열
	$scope.todos = [
		
	];
	
	$scope.todoYear = '';
	$scope.todoContent = '';
	
	// 할일 추가
	$scope.addTodo = function() {
		console.log($scope.todoYear != '');
		console.log($scope.todoContent != '');
		if($scope.todoYear != '' && $scope.todoContent != '') {
			$scope.todos.push({year:$scope.todoYear, content:$scope.todoContent, done:false});
			$scope.todoYear = '';
			$scope.todoContent = '';
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