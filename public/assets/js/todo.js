function TodoCtrl($scope, $http) {
	// 약력 배열
	$scope.todos = [];
	$scope.deltodos = [];

	// $scope.todos.push({ year: '2014', month: '11', content: 'sample', done: false });

	$scope.todoYear = '';
	$scope.todoMonth = '';
	$scope.todoContent = '';

	$http.post('/chm/manage/artist/history/get', { artist_sn: document.form1.artist_sn.value }).success(function (data) {
		console.log(data);
		for (var i in data.data) {
			$scope.todos.push({ sn: data.data[i].artist_info_sn, year: data.data[i].artist_info_year, month: data.data[i].artist_info_month, content: data.data[i].artist_info_content, done: false });
		}
		// console.log($scope.todos);
	}).error(function (data) {
		console.log('error : ', error);
	});

	// 약력 추가
	$scope.addTodo = function() {
		// console.log($scope.todos);
		if($scope.todoYear != '' && $scope.todoMonth != '' && $scope.todoContent != '') {
			$scope.todos.push({ sn: 0, year: $scope.todoYear, month: $scope.todoMonth, content: $scope.todoContent, done: false });
			$scope.todoYear = '';
			$scope.todoMonth = '';
			$scope.todoContent = '';
			// console.log($scope.todos);
			// console.log($scope.deltodos);
		} else {
			alert("세 가지 모두 입력해주세요");
		}
	};

	// 약력 로컬 삭제
	$scope.remove = function() {
		var oldTodos = $scope.todos;
		$scope.todos = [];
		angular.forEach(oldTodos, function(todo) {
			if(!todo.done) {
				$scope.todos.push(todo);
			} else if (todo.done && todo.sn != 0) {
				$scope.deltodos.push(todo.sn);
			} else {
			}
		});
		// console.log($scope.todos);
		// console.log($scope.deltodos);
	};

	// 약력 서버에 업데이트하기
	$scope.updateserver = function() {
		// console.log($scope.todos);
		// console.log($scope.deltodos);
		$http.post('/chm/manage/artist/history/update', { artist_sn: document.form1.artist_sn.value, artist_history: $scope.todos, artist_del: $scope.deltodos }).success(function (data) {
			if (data.result == 'success') {
				alert("약력이 변경되었습니다.");
				location.replace("/chm/manage/artist/info?sn=" + document.form1.artist_sn.value);
			} else {
				alert("약력 변경이 실패했습니다. 관리자에게 문의해주세요.");
				location.replace("/chm/manage/artist/info?sn=" + document.form1.artist_sn.value);
			}
		}).error(function (data) {
			console.log('error : ', error);
		});
	};
}// TodoCtrl