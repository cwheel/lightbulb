var lightbulb = require('./lib/lightbulb')({db: 't'});

lightbulb.onConnected(function() {
	var cons = lightbulb.createModel("Test", {test: lightbulb.types.String});

	cons.ready(function() {
		var a = new cons({test: "Hello World"});
		console.log(typeof a);

		a.save().then(function(saved) {
			console.log(saved);

			var id = saved.id;

			cons.findOne({test: "Hello World"}).then(function(testObj) {
				console.log(testObj);

				testObj.remove();
			});

		});
	});
});