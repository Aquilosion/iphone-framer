<?php

// print_r($_POST);
// print_r(array_keys($_FILES));

$frame = $_POST['identifier'];
$json = json_decode(file_get_contents("frames/$frame/index.json"));

$fi = escapeshellarg($frame);

$okay = true;

$command = "convert";

$count = 0;
foreach ($json->elements as $element) {
	switch ($element->type) {
	case "image": {
		$command .= " frames/$fi/$element->image";
	} break;
	
	case "placeholder": {
		if (isset($_FILES['image_' . $element->index]['tmp_name'])) {
			$file = $_FILES['image_' . $element->index]['tmp_name'];
			
			list ($width, $height) = getimagesize($file);
			
			$command .= " \( $file -virtual-pixel transparent -background transparent -extent 3861x2574 -distort Perspective '0,0 {$element->points[0][0]},{$element->points[0][1]} $width,0 {$element->points[1][0]},{$element->points[1][1]} 0,$height {$element->points[2][0]},{$element->points[2][1]} $width,$height {$element->points[3][0]},{$element->points[3][1]}' \)";
		} else {
			$okay = false;
		}
	} break;
	}
	
	if ($count > 0) {
		$command .= " -composite";
	}
	
	++$count;
}

if ($okay) {
	$image = `$command png:-`;
	
	// echo("$command");
	
	echo("data:image/png;base64," . base64_encode($image));
} else {
	echo("Failed to generate image, input not okay!");
}











exit;

$width = intval($_GET['width']);
$height = intval($_GET['height']);

$base = (empty($_SERVER['HTTPS']) ? "http" : "https") . "://" . $_SERVER['SERVER_NAME'] . dirname($_SERVER['REQUEST_URI']) . "/";
$url = escapeshellarg("data:text/html;charset=utf-8;base64," . base64_encode('<base href="' . $base . '"><link href="preview.css" rel="stylesheet"><link href="screenshot.css" rel="stylesheet"><div id="preview">' . $_GET['html'] . "</div>"));

$image = `phantomjs screenshot.js $width $height $url`;
$decode = base64_decode($image);

if ($decode !== false) {
	header("Content-type: image/png");
	// header("Content-Disposition: attachment; filename=render.png");
	echo($decode);
}