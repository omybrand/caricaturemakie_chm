var myTodo = angular.module('myTodo', []);

function mainController($scope, $http) {
	$scope.formData = { yy: '', mm: '' };
	$scope.sum = 0;
	$scope.cnt  = 0;

	$http.get('/chm/artist/getdate').success(function (data) {
		$scope.formData.yy = data.yy;
		$scope.formData.mm = data.mm;
		// console.log($scope.formData);

		$scope.sum = 0;

		$http.post('/chm/manage/carical/listap', $scope.formData).success(function (datas) {
			for (var i in datas) {
				if (datas[i].order_select == 0) {
					datas[i].mode = "상반신 스케치";
				} else if (datas[i].order_select == 1) {
					datas[i].mode = "상반신 포인트컬러";
				} else if (datas[i].order_select == 2) {
					datas[i].mode = "상반신 풀컬러";
				} else if (datas[i].order_select == 3) {
					datas[i].mode = "전신 스케치";
				} else if (datas[i].order_select == 4) {
					datas[i].mode = "전신 포인트컬러";
				} else if (datas[i].order_select == 5) {
					datas[i].mode = "전신 풀컬러";
				}

				if (datas[i].order_size == 0) {
					datas[i].o_size = "A4";
				} else if (datas[i].order_size == 1) {
					datas[i].o_size = "A2";
				} else if (datas[i].order_size == 2) {
					datas[i].o_size = "A1";
				} else if (datas[i].order_size == 3) {
					datas[i].o_size = "A0";
				}

				datas[i].price = datas[i].order_price + datas[i].order_addpay;
				$scope.sum += datas[i].price;
			}
			$scope.cnt = datas.length;
			$scope.todos = datas;

			$http.post('/chm/manage/carical/listom', $scope.formData).success(function (datas2) {
				for (var i in datas2) {
					if (datas2[i].order_select == 0) {
						datas2[i].mode = "상반신 스케치";
					} else if (datas2[i].order_select == 1) {
						datas2[i].mode = "상반신 포인트컬러";
					} else if (datas2[i].order_select == 2) {
						datas2[i].mode = "상반신 풀컬러";
					} else if (datas2[i].order_select == 3) {
						datas2[i].mode = "전신 스케치";
					} else if (datas2[i].order_select == 4) {
						datas2[i].mode = "전신 포인트컬러";
					} else if (datas2[i].order_select == 5) {
						datas2[i].mode = "전신 풀컬러";
					}

					if (datas2[i].order_size == 0) {
						datas2[i].o_size = "A4";
					} else if (datas2[i].order_size == 1) {
						datas2[i].o_size = "A2";
					} else if (datas2[i].order_size == 2) {
						datas2[i].o_size = "A1";
					} else if (datas2[i].order_size == 3) {
						datas2[i].o_size = "A0";
					}

					datas2[i].price = datas2[i].order_price + datas2[i].order_addpay;
					$scope.sum += datas2[i].price;
				}
				$scope.cnt += datas2.length;
				$scope.todos2 = datas2;

				$http.post('/chm/manage/carical/listco', $scope.formData).success(function (datas3) {
					for (var i in datas3) {
						if (datas3[i].order_select == 0) {
							datas3[i].mode = "상반신 스케치";
						} else if (datas3[i].order_select == 1) {
							datas3[i].mode = "상반신 포인트컬러";
						} else if (datas3[i].order_select == 2) {
							datas3[i].mode = "상반신 풀컬러";
						} else if (datas3[i].order_select == 3) {
							datas3[i].mode = "전신 스케치";
						} else if (datas3[i].order_select == 4) {
							datas3[i].mode = "전신 포인트컬러";
						} else if (datas3[i].order_select == 5) {
							datas3[i].mode = "전신 풀컬러";
						}

						if (datas3[i].order_size == 0) {
							datas3[i].o_size = "A4";
						} else if (datas3[i].order_size == 1) {
							datas3[i].o_size = "A2";
						} else if (datas3[i].order_size == 2) {
							datas3[i].o_size = "A1";
						} else if (datas3[i].order_size == 3) {
							datas3[i].o_size = "A0";
						}

						datas3[i].price = datas3[i].order_price + datas3[i].order_addpay;
						$scope.sum += datas3[i].price;
					}
					$scope.cnt += datas3.length;
					$scope.todos3 = datas3;
				}).error(function (err) {
					console.log('error : ', err);
				});
			}).error(function (err) {
				console.log('error : ', err);
			});
		}).error(function (err) {
			console.log('error : ', err);
		});

//		$scope.todos = data;
	}).error(function (err) {
		console.log('error : ', err);
	});



	$scope.findTodo = function () {

		$scope.sum = 0;

		$http.post('/chm/manage/carical/listap', $scope.formData).success(function (datas) {
			for (var i in datas) {
				if (datas[i].order_select == 0) {
					datas[i].mode = "상반신 스케치";
				} else if (datas[i].order_select == 1) {
					datas[i].mode = "상반신 포인트컬러";
				} else if (datas[i].order_select == 2) {
					datas[i].mode = "상반신 풀컬러";
				} else if (datas[i].order_select == 3) {
					datas[i].mode = "전신 스케치";
				} else if (datas[i].order_select == 4) {
					datas[i].mode = "전신 포인트컬러";
				} else if (datas[i].order_select == 5) {
					datas[i].mode = "전신 풀컬러";
				}

				if (datas[i].order_size == 0) {
					datas[i].o_size = "A4";
				} else if (datas[i].order_size == 1) {
					datas[i].o_size = "A2";
				} else if (datas[i].order_size == 2) {
					datas[i].o_size = "A1";
				} else if (datas[i].order_size == 3) {
					datas[i].o_size = "A0";
				}

				datas[i].price = datas[i].order_price + datas[i].order_addpay;
				$scope.sum += datas[i].price;
			}
			$scope.cnt = datas.length;
			$scope.todos = datas;

			$http.post('/chm/manage/carical/listom', $scope.formData).success(function (datas2) {
				for (var i in datas2) {
					if (datas2[i].order_select == 0) {
						datas2[i].mode = "상반신 스케치";
					} else if (datas2[i].order_select == 1) {
						datas2[i].mode = "상반신 포인트컬러";
					} else if (datas2[i].order_select == 2) {
						datas2[i].mode = "상반신 풀컬러";
					} else if (datas2[i].order_select == 3) {
						datas2[i].mode = "전신 스케치";
					} else if (datas2[i].order_select == 4) {
						datas2[i].mode = "전신 포인트컬러";
					} else if (datas2[i].order_select == 5) {
						datas2[i].mode = "전신 풀컬러";
					}

					if (datas2[i].order_size == 0) {
						datas2[i].o_size = "A4";
					} else if (datas2[i].order_size == 1) {
						datas2[i].o_size = "A2";
					} else if (datas2[i].order_size == 2) {
						datas2[i].o_size = "A1";
					} else if (datas2[i].order_size == 3) {
						datas2[i].o_size = "A0";
					}

					datas2[i].price = datas2[i].order_price + datas2[i].order_addpay;
					$scope.sum += datas2[i].price;
				}
				$scope.cnt += datas2.length;
				$scope.todos2 = datas2;

				$http.post('/chm/manage/carical/listco', $scope.formData).success(function (datas3) {
					for (var i in datas3) {
						if (datas3[i].order_select == 0) {
							datas3[i].mode = "상반신 스케치";
						} else if (datas3[i].order_select == 1) {
							datas3[i].mode = "상반신 포인트컬러";
						} else if (datas3[i].order_select == 2) {
							datas3[i].mode = "상반신 풀컬러";
						} else if (datas3[i].order_select == 3) {
							datas3[i].mode = "전신 스케치";
						} else if (datas3[i].order_select == 4) {
							datas3[i].mode = "전신 포인트컬러";
						} else if (datas3[i].order_select == 5) {
							datas3[i].mode = "전신 풀컬러";
						}

						if (datas3[i].order_size == 0) {
							datas3[i].o_size = "A4";
						} else if (datas3[i].order_size == 1) {
							datas3[i].o_size = "A2";
						} else if (datas3[i].order_size == 2) {
							datas3[i].o_size = "A1";
						} else if (datas3[i].order_size == 3) {
							datas3[i].o_size = "A0";
						}

						datas3[i].price = datas3[i].order_price + datas3[i].order_addpay;
						$scope.sum += datas3[i].price;
					}
					$scope.cnt += datas3.length;
					$scope.todos3 = datas3;
				}).error(function (err) {
					console.log('error : ', err);
				});
			}).error(function (err) {
				console.log('error : ', err);
			});
		}).error(function (err) {
			console.log('error : ', err);
		});
	};
}