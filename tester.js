var lightbulb = require('./lib/lightbulb')({db: 'test'});
var DocumentSet = require('./lib/documentSet.js');

var Apple, Orange, Ship, Container, Item, getId;

lightbulb.onConnected(function() {
	Apple = lightbulb.createModel("Apple", {color: lightbulb.types.String, type: lightbulb.types.String});

	Apple.ready(function() {
		Orange = lightbulb.createModel("Orange", {weight: lightbulb.types.Number, origin: lightbulb.types.String});
		
		Orange.ready(function() {
			Ship = lightbulb.createModel("Ship", {name: lightbulb.types.String, color: lightbulb.types.String});

			Ship.ready(function() {
				Container = lightbulb.createModel("Container", {owner: lightbulb.types.String, color: lightbulb.types.String});
			
				Container.ready(function() {
					Item = lightbulb.createModel("Item", {name: lightbulb.types.String, shape: lightbulb.types.String});

					Item.ready(function() {
						Ship.hasOne(Container, "container");

						var icecap = new Ship({name: "Ice Cap", color: "White"});
						var c1 = new Container({owner: "Fruit Sales Inc.", color: "Red"});

						icecap.container = c1;

						icecap.save().then(function(savedBoat) {
							console.log(savedBoat);
						});
					});
				});
			});
		});
	});
});