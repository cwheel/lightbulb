var lightbulb = require('./lib/lightbulb')({db: 't'});

lightbulb.onConnected(function() {
	var cons = lightbulb.createModel("Test", {test: lightbulb.types.String});

	cons.ready(function() {
		var a = new cons({test: "Hello World"});

		a.save().then(function(saved) {
			cons.find("fsdfs").then(function(found) {
				found.remove().then(function(status) {
					console.log(status);
				});
			});
		});
	});
});