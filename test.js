var assert = require('assert');
var lightbulb = require('./lib/lightbulb')({db: 'test'});
var DocumentSet = require('./lib/documentSet');

var Apple, Orange, Ship, Container, Item;
var getId = "0da15f76-c831-4ee6-af47-a0f894d77c79";

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
						run();
					});
				});
			});
		});
	});
});

describe('Setup', function() {
	describe('#connection()', function () {
		it('should return a valid connection after initalization', function () {
			assert.notEqual(undefined, lightbulb.connection());
		});
	});

	describe('#types', function () {
		it('should return a dictionary of acceptable model key types', function () {
			assert.notEqual(undefined, lightbulb.types);
		});

		it('should have a String type', function () {
			assert.equal("string", lightbulb.types.String);
		});

		it('should have a Number type', function () {
			assert.equal("number", lightbulb.types.Number);
		});

		it('should have an Object type', function () {
			assert.equal("object", lightbulb.types.Object);
		});

		it('should have an Array type', function () {
			assert.equal("array", lightbulb.types.Array);
		});
	});
});

describe('Document Factory (Create)', function() {
	describe('#createModel()', function () {
		it('should throw an error when created with nothing', function () {
			assert.throws(function() {
				lightbulb.createModel();
			}, Error);
		});

		it('should throw an error when created with anything but a string name', function () {
			assert.throws(function() {
				lightbulb.createModel({test: "value"});
			}, Error);
		});

		it('should throw an error when created without a params structure', function () {
			assert.throws(function() {
				lightbulb.createModel("Test");
			}, Error);
		});

		it('should return a constructor for Document', function () {
			assert.doesNotThrow(function() {
				var cons = lightbulb.createModel("ModelTest", {test: lightbulb.types.String});

				cons.ready(function() {
					if (typeof cons != "function") {
						throw new Error("Should return a document constructor");
					}
				});
			}, Error);
		});
	});
	
	describe('#hasMany()', function () {
		it('should throw an error when given an undefined model', function () {
			assert.throws(function() {
				Ship.hasMany(undefined, "containers");
			}, Error);
		});

		it('should throw an error when given anything but a string for the relation key', function () {
			assert.throws(function() {
				Ship.hasMany(Container, undefined);
			}, Error);

			assert.throws(function() {
				Ship.hasMany(Container, 9);
			}, Error);
		});

		it('should throw an error when given an empty string for the relation key', function () {
			assert.throws(function() {
				Ship.hasMany(Container, "");
			}, Error);
		});

		it('should maintain a valid relation object when given a relation', function () {
			Ship.hasMany(Container, "containers");
			Container.hasMany(Item, "items");

			assert.equal("hasMany", Ship.relationships["containers"].type);
			assert.equal("hasMany", Container.relationships["items"].type);

			assert.equal(Container, Ship.relationships["containers"].model);
			assert.equal(Item, Container.relationships["items"].model);
		});
	});
});

describe('Document', function() {
	describe('#prototype', function () {
		it('should return a Document object when the constructor is called', function () {
			assert.doesNotThrow(function() {
				var inst = new Apple({color: "red"});
				
				if (typeof inst != "object") {
					throw new Error("Should return a document");
				}
			}, Error);
		});

		it('should throw an exception when given values for non-existant keys', function () {
			assert.throws(function() {
				var inst = new Apple({taste: "sweet"});
			}, Error);

			assert.throws(function() {
				var inst = new Apple({color: "red", taste: "sweet"});
			}, Error);
		});

		it('should throw an exception when given values with incorrect types for their keys', function () {
			assert.throws(function() {
				var inst = new Orange({weight: "6"});
			}, Error);

			assert.throws(function() {
				var inst = new Orange({origin: "Florida", weight: "6"});
			}, Error);
		});

		it('should be able to retrieve values given from keys', function () {
			var inst = new Apple({color: "red", type: "Fuji"});
			
			assert.equal("red", inst.color);
			assert.equal("Fuji", inst.type);
		});

		it('should be able to set values by key', function () {
			var inst = new Apple({color: "red", type: "Fuji"});
			
			inst.color = "green";
			assert.equal("green", inst.color);

			inst.type = "Granny Smith";
			assert.equal("Granny Smith", inst.type);
		});
	});

	describe('#save()', function () {
		it('should return the document with an id', function () {
			var inst = new Apple({color: "red", type: "Fuji"});

			return inst.save().then(function(saved) {
				assert.notEqual(undefined, saved);
				assert.notEqual(undefined, saved.id);
			});
		});
		
		it('should save all related documents with dual levels', function () {
			var icecap = new Ship({name: "Ice Cap", color: "White"});
			var c1 = new Container({owner: "Fruit Sales Inc.", color: "Red"});
			var c2 = new Container({owner: "Fruit Sales Inc.", color: "Orange"});

			return icecap.save().then(function(savedShip) {
				savedShip.containers.appendDocument(c1);
				savedShip.containers.appendDocument(c2);

				return savedShip.save().then(function(containerizedShip) {
					assert.notEqual(undefined, containerizedShip);
					assert.notEqual(undefined, containerizedShip.id);
					assert.equal("Ice Cap", containerizedShip.name);
					assert.equal(2, containerizedShip.containers.length);
					assert.equal("Fruit Sales Inc.", containerizedShip.containers[0].owner);
					assert.equal("Fruit Sales Inc.", containerizedShip.containers[1].owner);
				});
			});
		});

		it('should save all related documents with many levels', function () {
			var icecap = new Ship({name: "Ice Cap", color: "White"});
			var c1 = new Container({owner: "Fruit Sales Inc.", color: "Red"});
			var c2 = new Container({owner: "Fruit Sales Inc.", color: "Orange"});
			var peachBox = new Item({name: "Box of Peaches", shape: "Rectangle"});

			return icecap.save().then(function(savedShip) {
				savedShip.containers.appendDocument(c1);
				savedShip.containers.appendDocument(c2);

				return savedShip.save().then(function(containerizedShip) {
					containerizedShip.containers[0].items.appendDocument(peachBox);
					containerizedShip.containers[1].items.appendDocument(peachBox);

					return containerizedShip.save().then(function(peachShip) {
						assert.notEqual(undefined, peachShip);
						assert.notEqual(undefined, peachShip.id);
						assert.equal("Ice Cap", peachShip.name);
						assert.equal(2, peachShip.containers.length);
						assert.equal("Fruit Sales Inc.", peachShip.containers[0].owner);
						assert.equal("Fruit Sales Inc.", peachShip.containers[1].owner);
						assert.equal("Box of Peaches", peachShip.containers[0].items[0].name);
						assert.equal("Box of Peaches", peachShip.containers[1].items[0].name);
					});
				});
			});
		});

		it('should save all related documents with many levels in a non-hierarchical fashion', function () {
			var icecap = new Ship({name: "Ice Cap", color: "White"});
			var c1 = new Container({owner: "Fruit Sales Inc.", color: "Red"});
			var c2 = new Container({owner: "Fruit Sales Inc.", color: "Orange"});
			var peachBox = new Item({name: "Box of Peaches", shape: "Rectangle"});
			
			icecap.containers.appendDocument(c1);
			icecap.containers.appendDocument(c2);
			icecap.containers[0].items.appendDocument(peachBox);
			icecap.containers[1].items.appendDocument(peachBox);

			return icecap.save().then(function(savedShip) {
				assert.notEqual(undefined, savedShip);
				assert.notEqual(undefined, savedShip.id);
				assert.equal("Ice Cap", savedShip.name);
				assert.equal(2, savedShip.containers.length);
				assert.equal("Fruit Sales Inc.", savedShip.containers[0].owner);
				assert.equal("Fruit Sales Inc.", savedShip.containers[1].owner);
			});
		});

		it('should throw an error when told to save invalid values', function () {
			assert.throws(function() {
				var inst = new Apple({color: "red", type: "Fuji"});

				inst.color = 6;

				inst.save().then(function(saved) {});
			}, Error);
		});

		it('should update a document if the document has an id', function () {
			var inst = new Apple({color: "red", type: "Fuji"});

			return inst.save().then(function(saved) {
				saved.color = "yellow";

				saved.save().then(function(nextSaved) {
					assert.equal("yellow", nextSaved);
					assert.equal(saved.id, nextSaved.id);
				})
			});
		});
	});

	describe('#remove()', function () {
		var inst1, inst2;

		before(function(done) {
			var o1 = new Orange({weight: 1.5, origin: "Chile"});
			var o2 = new Orange({weight: 3, origin: "California"});

			o1.save().then(function(saved) {
				inst1 = saved;

				o2.save().then(function(saved) {
					inst2 = saved;

					done();
				});
			});
		});

		it('should actually remove the document', function () {
			return inst1.remove(function(removed) {
				inst1.get(removed.id).then(function(fetched) {
					assert.equal(undefined, fetched);
				});
			});
		});

		it('should return correct document upon removal', function () {
			return inst2.remove(function(removed) {
				assert.equal(3, removed.weight);
				assert.equal("California", removed.origin);
			});
		});
	});
});

describe('Document Factory (Fetch)', function() {
	var id, deepId;

	before(function(done) {
		var inst = new Orange({weight: 1.5, origin: "Chile"});

		inst.save().then(function(saved) {
			id = saved.id;

			var pw = new Ship({name: "Polar Wind", color: "Blue"});
			var c1 = new Container({owner: "Fruit Sales Inc.", color: "Green"});
			var c2 = new Container({owner: "Fruit Sales Inc.", color: "Red"});
			var peachBox = new Item({name: "Box of Peaches", shape: "Rectangle"});
			
			pw.containers.appendDocument(c1);
			pw.containers.appendDocument(c2);
			pw.containers[0].items.appendDocument(peachBox);
			pw.containers[1].items.appendDocument(peachBox);

			return pw.save().then(function(savedShip) {
				deepId = savedShip.id;
				done();
			});
		});
	});

	describe('#get()', function() {
		it('should fetch a document given an id', function () {
			return Orange.get(id).then(function(doc) {
				assert.notEqual(undefined, doc);
			});
		});

		it('should fetch the specified document given an id', function () {
			return Orange.get(id).then(function(doc) {
				assert.equal(1.5, doc.weight);
				assert.equal("Chile", doc.origin);
				assert.equal(id, doc.id);
			});
		});

		it('should return undefined if the id is invalid', function () {
			return Orange.get('not-an-id').then(function(doc) {
				assert.equal(undefined, doc);
			});
		});

		it('should not fetch associated documents', function () {
			return Ship.get(deepId).then(function(doc) {
				assert.throws(function() {
					doc.containers[0].owner
				}, Error);

				assert.throws(function() {
					doc.containers[0].owner
				}, Error);

				assert.equal(deepId, doc.id);
			});
		});
	});

	describe('#getAll()', function() {
		var id;

		before(function(done) {
			var pw = new Ship({name: "Polar Wind", color: "Blue"});
			var c1 = new Container({owner: "Fruit Sales Inc.", color: "Green"});
			var c2 = new Container({owner: "Fruit Sales Inc.", color: "Red"});
			var peachBox = new Item({name: "Box of Peaches", shape: "Rectangle"});
			
			pw.containers.appendDocument(c1);
			pw.containers.appendDocument(c2);
			pw.containers[0].items.appendDocument(peachBox);
			pw.containers[1].items.appendDocument(peachBox);

			return pw.save().then(function(savedShip) {
				id = savedShip.id;
				done();
			});
		});

		it('should fetch a document given an id', function () {
			return Ship.getAll(id).then(function(doc) {
				assert.notEqual(undefined, doc);
			});
		});

		it('should return undefined if the id is invalid', function () {
			return Ship.getAll('not-an-id').then(function(doc) {
				assert.equal(undefined, doc);
			});
		});

	  	it('should fetch the specified document and related documents given an id', function () {
			return Ship.getAll(id).then(function(doc) {
				assert.notEqual(undefined, doc);
				assert.notEqual(undefined, doc.id);
				assert.equal("Polar Wind", doc.name);
				assert.equal(2, doc.containers.length);
				assert.equal("Fruit Sales Inc.", doc.containers[0].owner);
				assert.equal("Fruit Sales Inc.", doc.containers[1].owner);
			});
		});
	});

	describe('#find()', function() {
		before(function(done) {
			var inst = new Orange({weight: 2.3, origin: "Florida"});

			inst.save().then(function(saved) {
				done();
			});
		});

		it('should throw an error when given an undefined filter', function () {
			assert.throws(function() {
				Orange.find();
			});

			assert.throws(function() {
				Orange.find(undefined);
			});
		});
		
		it('should fetch a document set', function () {
			return Orange.find({origin: "Florida"}).then(function(set) {
				assert.notEqual(undefined, set);
			});
		});

		it('should fetch a document set matching the filter', function () {
			return Orange.find({origin: "Florida"}).then(function(set) {
				assert.equal("Florida", set[0].origin);
			});
		});

		it('should return empty set with invalid filter', function () {
			return Orange.find({weight: 25}).then(function(set) {
				assert.equal(0, set.length);
			});
		});
	});

	describe('#findAll()', function() {
		before(function(done) {
			var pw = new Ship({name: "Polar Wind", color: "Blue"});
			var c1 = new Container({owner: "Fruit Sales Inc.", color: "Green"});
			var c2 = new Container({owner: "Fruit Sales Inc.", color: "Red"});
			var peachBox = new Item({name: "Box of Peaches", shape: "Rectangle"});
			
			pw.containers.appendDocument(c1);
			pw.containers.appendDocument(c2);
			pw.containers[0].items.appendDocument(peachBox);
			pw.containers[1].items.appendDocument(peachBox);

			return pw.save().then(function(savedShip) {
				done();
			});
		});

		it('should throw an error when given an undefined filter', function () {
			assert.throws(function() {
				Ship.findAll();
			});

			assert.throws(function() {
				Ship.findAll(undefined);
			});
		});
		
		it('should fetch a document set', function () {
			return Ship.findAll({name: "Polar Wind"}).then(function(set) {
				assert.notEqual(undefined, set);
			});
		});

		it('should fetch a document set matching the filter', function () {
			return Ship.findAll({name: "Polar Wind"}).then(function(set) {
				assert.equal("Polar Wind", set[0].name);
				assert.equal(2, set[0].containers.length);
			});
		});

		it('should return empty set with invalid filter', function () {
			return Ship.findAll({name: "The Explorer"}).then(function(set) {
				assert.equal(0, set.length);
			});
		});
	});

	describe('#findOne()', function() {
		it('should fetch a document', function () {
			Orange.findOne({weight: 1.5}).then(function(doc) {
				assert.notEqual(undefined, doc);
			});
		});

		it('should fetch a document matching the filter', function () {
			Orange.findOne({weight: 1.5}).then(function(doc) {
				assert.equal(1.5, doc.weight);
				assert.equal("Chile", doc.origin);
			});
		});

		it('should return undefined with invalid filter', function () {
			Orange.findOne({weight: 25}).then(function(doc) {
				assert.equal(undefined, doc);
			});
		});
	});

	describe('#findOneAll()', function() {
		before(function(done) {
			var pw = new Ship({name: "Polar Wind", color: "Blue"});
			var c1 = new Container({owner: "Fruit Sales Inc.", color: "Green"});
			var c2 = new Container({owner: "Fruit Sales Inc.", color: "Red"});
			var peachBox = new Item({name: "Box of Peaches", shape: "Rectangle"});
			
			pw.containers.appendDocument(c1);
			pw.containers.appendDocument(c2);
			pw.containers[0].items.appendDocument(peachBox);
			pw.containers[1].items.appendDocument(peachBox);

			return pw.save().then(function(savedShip) {
				done();
			});
		});

		it('should throw an error when given an undefined filter', function () {
			assert.throws(function() {
				Ship.findOneAll();
			});

			assert.throws(function() {
				Ship.findOneAll(undefined);
			});
		});
		
		it('should fetch a document set', function () {
			return Ship.findOneAll({name: "Polar Wind"}).then(function(doc) {
				assert.notEqual(undefined, doc);
			});
		});

		it('should fetch a document set matching the filter', function () {
			return Ship.findOneAll({name: "Polar Wind"}).then(function(doc) {
				assert.equal("Polar Wind", doc.name);
				assert.equal(undefined, doc.appendDocument);
			});
		});

		it('should return empty set with invalid filter', function () {
			return Ship.findOneAll({name: "The Explorer"}).then(function(doc) {
				assert.equal(undefined, doc);
			});
		});
	});
});

describe('DocumentSet', function() {
	var set, inst1, inst2, inst3;

	before(function(done) {
		set = new DocumentSet("Orange", lightbulb.connection, lightbulb.args);

		inst1 = new Orange({weight: 1.6, origin: "Florida"});
		inst2 = new Orange({weight: 1.7, origin: "Florida"});
		inst3 = new Orange({weight: 1.8, origin: "Florida"});

		inst1.save().then(function(saved1) {
			inst2.save().then(function(saved2) {
				inst3.save().then(function(saved3) {
					done();
				});
			});
		});
	});

	describe('#appendDocument()', function() {
		it('should not throw error when called with documentFactory parameters', function () {
			assert.doesNotThrow(function() {
				set.appendDocument(inst1);
				set.appendDocument(inst2);
				set.appendDocument(inst3);
			});
		});
	});

	describe('#length', function() {
		it('should have length of three', function () {
			assert.equal(3, set.length);
		});
	});

	describe('#forEach()', function() {
		it('should make callback three times with valid objects', function () {
			var loops = 0;

			set.forEach(function(item) {
				assert.notEqual(undefined, item);
				assert.equal("Florida", item.origin);

				loops++;
			});

			assert.equal(3, loops);
		});
	});

	describe('#update()', function() {
		it('should throw an error using a non-fetched set', function () {
			assert.throws(function() {
				set.update({origin: "California"}).then(function(updated) {
					assert.equal(true, updated);
				});
			});
		});

		it('should modify all objects in set', function () {
			Orange.find({}).then(function(results) {
				results.update({origin: "California"}).then(function(updated) {
					assert.equal(true, updated);
				});
			});
		});

		it('should modify internal set objects', function () {
			Orange.find({}).then(function(results) {
				results.update({origin: "Chile"}).then(function(updated) {
					results.forEach(function(item) {
						assert.equals("Chile", item.origin);
					});
				});
			});
		});
	});

	describe('#remove()', function() {
		it('should throw an error using a non-fetched set', function () {
			assert.throws(function() {
				set.remove().then(function(updated) {
					assert.equal(true, updated);
				});
			});
		});

		it('should remove all objects in set', function () {
			Orange.find({}).then(function(results) {
				results.remove().then(function(updated) {
					assert.equal(true, updated);
				});
			});
		});

		it('should remove internal set objects', function () {
			var inst1 = new Orange({weight: 1.6, origin: "Florida"});
			var inst2 = new Orange({weight: 1.7, origin: "Florida"});
			var inst3 = new Orange({weight: 1.8, origin: "Florida"});

			inst1.save().then(function(saved1) {
				inst2.save().then(function(saved2) {
					inst3.save().then(function(saved3) {
						Orange.find({}).then(function(results) {
							results.remove().then(function(updated) {
								for (var i = 0; i < 3; i++) {
									assert.equal(undefined, results[i]);
								}
							});
						});
					});
				});
			});
		});
	});
});