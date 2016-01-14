var system = require("system");
var page = require("webpage").create();

page.viewportSize = {
	width: system.args[1],
	height: system.args[2]
};

page.open(system.args[3], function (status) {
	if (status === "success") {
		var base64 = page.renderBase64("PNG");
		console.log(base64);
	}
	
	phantom.exit();
});