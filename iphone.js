angular.module("frameApp", [])

.controller("FrameController", ["$scope", function ($scope) {
	$scope.colors = [
		{
			"identifier": "white",
			"name":       "White",
			"color":      "ffffff"
		},
		{
			"identifier": "gold",
			"name":       "Gold",
			"color":      "cbb6a0"
		},
		{
			"identifier": "rose-gold",
			"name":       "Rose Gold",
			"color":      "deaca5"
		}
	];
	
	$scope.devices = [
		{
			"identifier": "iphone-5",
			"name":       "iPhone 5"
		},
		{
			"identifier": "iphone-6s",
			"name":       "iPhone 6S"
		}
	];
	
	$scope.backgrounds = [
		{
			"identifier": "transparent",
			"name":       "Transparent"
		},
		{
			"identifier": "photo",
			"name":       "Photo"
		}
	];
	
	$scope.deviceCounts = [
		{
			"name": "1",
			"min": 1,
			"max": 1
		},
		{
			"name": "2",
			"min": 2,
			"max": 2
		},
		{
			"name": "3",
			"min": 3,
			"max": 3
		},
		{
			"name": "4+",
			"min": 4,
		}
	];
	
	$scope.search = {
		device:     null,
		color:      null,
		background: null,
		number:     null
	};
	
	$scope.frames = loadedFrames;
	$scope.searchFrames = $scope.frames;
	
	$scope.$watch("search", function () {
		$scope.updateSearch();
	}, true);
	
	$scope.updateSearch = function () {
		var filtered = [];
		
		$scope.frames.forEach(function (frame) {
			var okay = true;
			
			if ($scope.search.device != null) {
				var found = false;
				
				frame.devices.forEach(function (device) {
					if (device.device == $scope.search.device.identifier) {
						found = true;
					}
				});
				
				if (found == false) {
					okay = false;
				}
			}
			
			if ($scope.search.color != null) {
				var found = false;
				
				frame.devices.forEach(function (device) {
					if (device.color == $scope.search.color.identifier) {
						found = true;
					}
				});
				
				if (found == false) {
					okay = false;
				}
			}
			
			if ($scope.search.background != null) {
				if ($scope.search.background.identifier != frame.background) {
					okay = false;
				}
			}
			
			if ($scope.search.number != null) {
				var count = frame.devices.length;
				
				if ("min" in $scope.search.number && count < $scope.search.number.min) {
					okay = false;
				}
				
				if ("max" in $scope.search.number && count > $scope.search.number.max) {
					okay = false;
				}
			}
			
			if (okay) {
				filtered.push(frame);
			}
		});
		
		filtered.sort(function (a, b) {
			var aDevice = a.devices.splice();
			aDevice.sort();
			aDevice = aDevice[0];
			
			var bDevice = b.devices.splice();
			bDevice.sort();
			bDevice = bDevice[0];
			
			if (aDevice != bDevice) {
				return aDevice.localeCompare(bDevice);
			}
			
			if (a.background != b.background) {
				if (a.background == "transparent") {
					return -1;
				} else {
					return 1;
				}
			}
			
			return 0;
		});
		
		$scope.searchFrames = filtered;
	};
	
	$scope.selectedFrame = null;
	
	$scope.placeholders = {};
	$scope.files = {};
	
	$scope.drop = function (index) {
		return function (file) {
			$scope.files[index] = file;
			
			var reader = new FileReader();
			
			reader.onload = function () {
				$scope.placeholders[index] = reader.result;
				
				$scope.$apply();
			};
			
			reader.readAsDataURL(file);
		};
	};
	
	$scope.setSelectedFrame = function (frame) {
		$scope.selectedFrame = frame;
		
		$scope.resizePreview();
	};
	
	$scope.resizePreview = function () {
		if (!$scope.selectedFrame) {
			return;
		}
		
		var preview = document.getElementById("preview");
		var frame = document.getElementById("frame");
		
		var aWidth = preview.offsetWidth - 40;
		var aHeight = preview.offsetHeight - 40;
		
		var scale = Math.min(aWidth / $scope.selectedFrame.width, aHeight / $scope.selectedFrame.height);
		
		var offsetX = (aWidth / 2) - ($scope.selectedFrame.width / 2);
		var offsetY = (aHeight / 2) - ($scope.selectedFrame.height / 2);
		
		preview.style.transform = "scale(" + scale + ") translate(" + offsetX + "px, " + offsetY + "px)";
	};
	
	$scope.resizePreview();
	
	$scope.matrix = function (element) {
		return transform2d(element.width, element.height, element.points[0][0], element.points[0][1], element.points[1][0], element.points[1][1], element.points[2][0], element.points[2][1], element.points[3][0], element.points[3][1]);
	};
	
	$scope.download = function () {
		var form = new FormData();
		
		form.append("identifier", $scope.selectedFrame.identifier);
		
		$scope.selectedFrame.elements.forEach(function (element) {
			if (element.type == "placeholder" && element.index in $scope.placeholders && element.index in $scope.files) {
				form.append("image_" + element.index, $scope.files[element.index], $scope.files[element.index].name);
			}
		});
		
		var request = new XMLHttpRequest();
		
		request.open("POST", "download.php", true);
		
		request.onload = function () {
			if (request.status == 200) {
				// alert(request.responseText);
				
				if (request.responseText.substr(0, 5) == "data:") {
					document.getElementById("output_image").src = request.responseText;
				} else {
					alert(request.responseText);
				}
			} else {
				alert("An error occurred.\n\n" + request.responseText);
			}
		}
		
		request.send(form);
		
		// document.location = "download.php?html=" + encodeURIComponent(document.getElementById("preview").innerHTML) + "&width=" + $scope.selectedFrame.width + "&height=" + $scope.selectedFrame.height;
	}
}])

.directive("aqResize", function ($window) {
	return function ($scope, $element) {
		var w = angular.element($window);
		
		w.bind('resize', function () {
			$scope.resizePreview();
		});
	}
})

.directive("aqDrop", function () {
	var controller = function ($scope, $element, $attrs) {
		$element.bind("dragover", function (event) {
			event.preventDefault();
			return false;
		});
		
		$element.bind("dragenter", function (event) {
			$element[0].setAttribute("data-drop", "true");
			
			event.preventDefault();
			return false;
		});
		
		$element.bind("dragleave", function (event) {
			$element[0].setAttribute("data-drop", "false");
			
			event.preventDefault();
			return false;
		});
		
		$element.bind("drop", function (event) {
			$element[0].setAttribute("data-drop", "false");
			
			event.preventDefault();
			
			if (event.dataTransfer.files.length > 0) {
				var file = event.dataTransfer.files.item(0);
				
				$scope.aqDrop($scope)(file);
			}
			
			return false;
		});
	};
	
	return {
		controller: controller,
		scope: {
			aqDrop: "&"
		}
	};
});

function adj(m) { // Compute the adjugate of m
	return [
		m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
		m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
		m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]
	];
}

function multmm(a, b) { // multiply two matrices
	var c = Array(9);
	for (var i = 0; i != 3; ++i) {
		for (var j = 0; j != 3; ++j) {
			var cij = 0;
			for (var k = 0; k != 3; ++k) {
				cij += a[3 * i + k] * b[3 * k + j];
			}
			c[3 * i + j] = cij;
		}
	}
	return c;
}

function multmv(m, v) { // multiply matrix and vector
	return [
		m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
		m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
		m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
	];
}

function pdbg(m, v) {
	var r = multmv(m, v);
	return r + " (" + r[0] / r[2] + ", " + r[1] / r[2] + ")";
}

function basisToPoints(x1, y1, x2, y2, x3, y3, x4, y4) {
	var m = [
		x1, x2, x3,
		y1, y2, y3,
		1, 1, 1
	];
	var v = multmv(adj(m), [x4, y4, 1]);
	return multmm(m, [
		v[0], 0, 0,
		0, v[1], 0,
		0, 0, v[2]
	]);
}

function general2DProjection(
	x1s, y1s, x1d, y1d,
	x2s, y2s, x2d, y2d,
	x3s, y3s, x3d, y3d,
	x4s, y4s, x4d, y4d
) {
	var s = basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
	var d = basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
	return multmm(d, adj(s));
}

function project(m, x, y) {
	var v = multmv(m, [x, y, 1]);
	return [v[0] / v[2], v[1] / v[2]];
}

function transform2d(w, h, x1, y1, x2, y2, x3, y3, x4, y4) {
	var t = general2DProjection(0, 0, x1, y1, w, 0, x2, y2, 0, h, x3, y3, w, h, x4, y4);
	for (i = 0; i != 9; ++i) t[i] = t[i] / t[8];
	t = [t[0], t[3], 0, t[6],
		t[1], t[4], 0, t[7],
		0, 0, 1, 0,
		t[2], t[5], 0, t[8]
	];
	t = "matrix3d(" + t.join(", ") + ")";
	
	return t;
}