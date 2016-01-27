var lightbulb = require('./lib/lightbulb')({db: 't'});

lightbulb.onConnected(function() {
	var cons = lightbulb.createModel("Test", {test: lightbulb.types.String});

	cons.ready(function() {
		var a = new cons({test: "Hello World"});

		a.save().then(function(saved) {
			console.log(saved);

			saved.test = "hi";
			saved.id = "4723423";

			saved.save().then(function(c) {
				console.log(c);
				c.remove();
			})
		});
	});
});