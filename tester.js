var lightbulb = require('./lib/lightbulb')({db: 'tester'});

lightbulb.onConnected(function() {
	var planet = lightbulb.createModel("Planet", {name: lightbulb.types.String, gravity: lightbulb.types.Number});
	var star = lightbulb.createModel("Star", {name: lightbulb.types.String, color: lightbulb.types.String});
	var spacecraft = lightbulb.createModel("Spacecraft", {name: lightbulb.types.String, year: lightbulb.types.String});

	planet.hasMany(star, "stars");
	star.hasMany(spacecraft, "spacecraft");

	planet.ready(function() {
		/*planet.get('deb26274-c39c-4949-bbf8-ab3635721e36').then(function(earth) {
			console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++")
            console.log("EARTH", earth);
            console.log("Ships", earth.stars[1].spacecraft);
        });*/
        
        var earth = new planet({name: "Earth", gravity: 9.8});
		var sun = new star({name: "Sun", color: "yellow"});
		var moon = new star({name: "Moon", color: "white"});

		var lander = new spacecraft({name: "Lunar Lander", year: "1988"});
		var lander2 = new spacecraft({name: "Lunar Lander 2", year: "1989"});

		earth.save().then(function(saved) {
			saved.stars.appendDocument(sun);
			saved.stars.appendDocument(moon);

			saved.save().then(function(saved2) {
				console.log("STARS",saved2.stars)
				saved2.stars[0].spacecraft.appendDocument(lander);
				saved2.stars[0].spacecraft.appendDocument(lander2);
				console.log("STARS2",saved2.stars);

				saved2.save().then(function(saved3) {
					console.log("=> Child document added", saved3);
					console.log("=> Spacecraft on sun", saved3.stars[1]);

					planet.get(saved3.id).then(function(earth) {
			            console.log("=> Spacecraft on sun", earth.stars[1]);
			        });
				});
			});
		});
	});
});