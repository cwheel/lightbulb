var lightbulb = require('./lib/lightbulb')({db: 'tester'});

lightbulb.onConnected(function() {
	var planet = lightbulb.createModel("Planet", {name: lightbulb.types.String, gravity: lightbulb.types.Number});
	var star = lightbulb.createModel("Star", {name: lightbulb.types.String, color: lightbulb.types.String});

	planet.hasMany(star, "stars");

	planet.ready(function() {
		var earth = new planet({name: "Earth", gravity: 9.8});
		var sun = new star({name: "Sun", color: "yellow"});

		earth.save().then(function(saved) {
			console.log("=> Returned", saved);
			saved.stars.appendDocument(sun);

			console.log("=> Modified", saved);

			saved.save(function(saved2) {
				console.log("=> Relation Added", saved2);
			});
		});
	});
});