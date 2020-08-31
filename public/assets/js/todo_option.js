function TodoCtrl($scope, $http) {
	// 약력 배열
	$scope.todos = [];
	$scope.deltodos = [];

	// $scope.todos.push({ year: '2014', month: '11', content: 'sample', done: false });

	$scope.todoOption = '';
	$scope.todoArtist = '0';
	$scope.todoPrice = '';

	$http.post('/chm/manage/goods/option/get', { goods_sn: document.form1.goods_sn.value }).success(function (data) {
		// console.log(data);
		for (var i in data.data) {
			$scope.todos.push({ sn: data.data[i].goods_option_sn, goods_option_name: data.data[i].goods_option_name, goods_option_price: data.data[i].goods_option_price, artist_sn: data.data[i].artist_sn, done: false });
		}
		// console.log($scope.todos);
	}).error(function (data) {
		console.log('error : ', error);
	});

	// 옵션 추가
	$scope.addTodo = function() {
		// console.log($scope.todos);
		if($scope.todoOption != '' && $scope.todoArtist != '' && $scope.todoPrice != '') {
			$scope.todos.push({ sn: 0, goods_option_name: $scope.todoOption, artist_sn: $scope.todoArtist, goods_option_price: $scope.todoPrice, done: false });
			$scope.todoOption = '';
			$scope.todoArtist = '0';
			$scope.todoPrice = '';
			// console.log($scope.todos);
			// console.log($scope.deltodos);
		} else {
			alert("세 가지 모두 입력해주세요");
		}
	};

	// 옵션 로컬 삭제
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

	// 옵션 서버에 업데이트하기
	$scope.updateserver = function() {
		// console.log($scope.todos);
		// console.log($scope.deltodos);
		$http.post('/chm/manage/goods/option/update', { goods_sn: document.form1.goods_sn.value, goods_option: $scope.todos, goods_option_del: $scope.deltodos }).success(function (data) {
			if (data.result == 'success') {
				alert("상품 옵션이 변경되었습니다.");
				location.replace("/chm/manage/goods/info?sn=" + document.form1.goods_sn.value);
			} else {
				alert("상품 옵션 변경이 실패했습니다. 관리자에게 문의해주세요.");
				location.replace("/chm/manage/goods/info?sn=" + document.form1.goods_sn.value);
			}
		}).error(function (data) {
			console.log('error : ', error);
		});
	};
}// TodoCtrl