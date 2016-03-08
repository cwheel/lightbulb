var lightbulb = require('./lib/lightbulb')({db: 'tester'});
var DocumentSet = require('./lib/documentSet.js');
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

		var set, inst1, inst2, inst3;

			set = new DocumentSet("Orange", lightbulb.connection, lightbulb.args);

			inst1 = new star({name: "Sun1", color: "yellow"});
			inst2 = new star({name: "Sun2", color: "yellow"});
			inst3 = new star({name: "Sun3", color: "yellow"});

			inst1.save().then(function(saved1) {
				inst2.save().then(function(saved2) {
					inst3.save().then(function(saved3) {
						console.log(saved3)
					});
				});
			});

			set.appendDocument(inst1);
	});
});