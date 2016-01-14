<!doctype html>

<html lang="en" ng-app="frameApp">
	<head>
		<title>iPhone Framer</title>
		
		<meta charset="utf-8">
		
		<link href="style.css" rel="stylesheet">
		<link href="preview.css" rel="stylesheet">
		
		<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.0-rc.2/angular.min.js"></script>
		
		<script>
			<?php
				$frames = [];
				
				foreach (scandir("frames") as $frame) {
					if (substr($frame, 0, 1) == ".") continue;
					
					$contents = file_get_contents("frames/$frame/index.json");
					$json = json_decode($contents);
					
					$json->identifier = $frame;
					
					$frames[] = $json;
				}
			?>
			
			var loadedFrames = <?= json_encode($frames) ?>;
		</script>
		
		<script src="iphone.js"></script>
	</head>
	
	<body ng-controller="FrameController" aq-resize>
		<div id="controls">
			<div class="fieldset">
				<div class="options">
					<button ng-click="download()">Download Render</button>
					<img id="output_image">
				</div>
				<div class="search">
					<div>
						<select ng-model="search.device" ng-options="device.name group by 'Devices' for device in devices">
							<option value="">Any Device</option>
						</select>
						<select ng-model="search.color" ng-options="color.name group by 'Colours' for color in colors">
							<option value="">Any Device Colour</option>
						</select>
					</div>
					<div>
						<select ng-model="search.number" ng-options="number.name for number in deviceCounts">
							<option value="">Any Number of Devices</option>
						</select>
						<select ng-model="search.background" ng-options="background.name group by 'Background Types' for background in backgrounds">
							<option value="">Any Background Type</option>
						</select>
					</div>
				</div>
				<div class="results">
					<ul>
						<li ng-repeat="frame in searchFrames">
							<button ng-click="setSelectedFrame(frame)" style="background-color: #{{frame.icon.color}}">
								<div ng-if="frame.icon.background" class="background" style="background-image: url(frames/{{frame.identifier}}/{{frame.icon.background}})"></div>
								<div ng-if="frame.icon.foreground" class="foreground" style="background-image: url(frames/{{frame.identifier}}/{{frame.icon.foreground}})"></div>
							</button>
						</li>
					</ul>
				</div>
			</div>
		</div>
		
		<div id="preview">
			<div id="frame" ng-if="selectedFrame" class="frame" style="width: {{selectedFrame.width}}px; height: {{selectedFrame.height}}px">
				<div class="element" ng-repeat="element in selectedFrame.elements" style="pointer-events: {{element.type == 'image' ? 'none' : 'auto'}}">
					<img ng-if="element.type == 'image'" class="image" ng-src="frames/{{selectedFrame.identifier}}/{{element.image}}">
					<div ng-if="element.type == 'placeholder'" class="placeholder" style="width: {{element.width}}px; height: {{element.height}}px; transform: {{matrix(element)}}" aq-drop="drop(element.index)">
						<img ng-if="placeholders[element.index]" ng-src="{{placeholders[element.index]}}" style="width: 100%; height: 100%">
					</div>
				</div>
			</div>
		</div>
	</body>
</html>