var lightbulb = require('./lib/lightbulb')({db: 'tester1'});
var DocumentSet = require('./lib/documentSet.js');
/*
lightbulb.onConnected(function() {
	var planet = lightbulb.createModel("Planet", {name: lightbulb.types.String, gravity: lightbulb.types.Number});
	var star = lightbulb.createModel("Star", {name: lightbulb.types.String, color: lightbulb.types.String});
	var spacecraft = lightbulb.createModel("Spacecraft", {name: lightbulb.types.String, year: lightbulb.types.String});

	planet.hasMany(star, "stars");
	star.hasMany(spacecraft, "spacecraft");

	planet.ready(function() {
		var start = process.hrtime();
		planet.getAll('2ca4c7c1-59e6-4f0a-ae82-110760c980bb').then(function(saved) {
			console.log(saved);
			var end = process.hrtime(start);
			var ms = (end[0]*1000) + (end[1]/1000000);
			console.log("Took " + ms + " ms in total");
		});
	});
});*/

var Apple, Orange, Ship, Container, Item, getId;

lightbulb.onConnected(function() {
	Apple = lightbulb.createModel("Apple", {color: lightbulb.types.String, type: lightbulb.types.String});

	Apple.ready(function() {
		Orange = lightbulb.createModel("Orange", {weight: lightbulb.types.Number, origin: lightbulb.types.String});
		
		Orange.ready(function() {
			Ship = lightbulb.createModel("Ship", {name: lightbulb.types.String, color: lightbulb.types.String});
			Container = lightbulb.createModel("Container", {owner: lightbulb.types.String, color: lightbulb.types.String});
			Item = lightbulb.createModel("Item", {name: lightbulb.types.String, shape: lightbulb.types.String});

			Ship.hasMany(Container, "containers");
			Container.hasMany(Item, "items");

			Ship.ready(function() {
				var icecap = new Ship({name: "Ice Cap", color: "White"});
				var c1 = new Container({owner: "Fruit Sales Inc.", color: "Red"});
				var c2 = new Container({owner: "Fruit Sales Inc.", color: "Orange"});
				var peachBox = new Item({name: "Box of Peaches", shape: "Rectangle"});
				
				icecap.containers.appendDocument(c1);
				icecap.containers.appendDocument(c2);
				icecap.containers[0].items.appendDocument(peachBox);
				icecap.containers[1].items.appendDocument(peachBox);

			 	icecap.save().then(function(savedShip) {
			 		console.log(savedShip);

					Ship.getAll(savedShip.id).then(function(saved) {
						console.log(saved);
					});
				});
			});
		});
	});


});