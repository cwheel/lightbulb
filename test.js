var assert = require('assert');
var lightbulb = require('./lib/lightbulb')({db: 'test'});

var Apple, Orange;

lightbulb.onConnected(function() {
	Apple = lightbulb.createModel("Apple", {color: lightbulb.types.String, type: lightbulb.types.String});
		Apple.ready(function() {
			Orange = lightbulb.createModel("Orange", {weight: lightbulb.types.Number, origin: lightbulb.types.String});
			
			Orange.ready(function() {
				run();
			});
	});
});

describe('Setup', function() {
	describe('#connection()', function () {
		it('should return a valid connection after initalization', function () {
			assert.notEqual(undefined, lightbulb.connection());
		});
	});
});

describe('Model Factory (Create)', function() {
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

		it('should return a constructor for Model', function () {
			assert.doesNotThrow(function() {
				var cons = lightbulb.createModel("ModelTest", {test: lightbulb.types.String});

				cons.ready(function() {
					if (typeof cons != "function") {
						throw new Error("Should return a model constructor");
					}
				});
			}, Error);
		});
	});
});

describe('Model', function() {
	describe('#prototype', function () {
		it('should return a Model object when the constructor is called', function () {
			assert.doesNotThrow(function() {
				var inst = new Apple({color: "red"});
				
				if (typeof inst != "object") {
					throw new Error("Should return a model object");
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
		it('should return the object with an id', function () {
			var inst = new Apple({color: "red", type: "Fuji"});

			inst.save().then(function(saved) {
				assert.notEqual(undefined, saved);
				assert.notEqual(undefined, saved.id);
			});
		});

		it('should throw an error when told to save invalid values', function () {
			assert.throws(function() {
				var inst = new Apple({color: "red", type: "Fuji"});

				inst.color = 6;

				inst.save().then(function(saved) {});
			}, Error);
		});

		it('should update a model if the model has an id', function () {
			var inst = new Apple({color: "red", type: "Fuji"});

			inst.save().then(function(saved) {
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

		it('should actually remove the model', function () {
			inst1.remove(function(removed) {
				inst1.get(removed.id).then(function(fetched) {
					assert.equal(undefined, fetched);
				});
			});
		});

		it('should return correct model upon removal', function () {
			inst2.remove(function(removed) {
				assert.equal(3, removed.weight);
				assert.equal("California", removed.origin);
			});
		});
	});
});

describe('Model Factory (Fetch)', function() {
	var id;

	before(function(done) {
		var inst = new Orange({weight: 1.5, origin: "Chile"});

		inst.save().then(function(saved) {
			id = saved.id;
			done();
		});
	});

	describe('#get()', function() {
		it('should fetch a model given an id', function () {
			Orange.get(id).then(function(model) {
				assert.notEqual(undefined, model);
			});
		});

		it('should fetch the specified model given an id', function () {
			Orange.get(id).then(function(model) {
				assert.equal(1.5, model.weight);
				assert.equal("Chile", model.origin);
			});
		});

		it('should return undefined if the id is invalid', function () {
			Orange.get('not-an-id').then(function(model) {
				assert.equal(undefined, model);
			});
		});
	});

	describe('#findOne()', function() {
		it('should fetch a model', function () {
			Orange.findOne({weight: 1.5}).then(function(model) {
				assert.notEqual(undefined, model);
			});
		});

		it('should fetch a model matching the filter', function () {
			Orange.findOne({weight: 1.5}).then(function(model) {
				assert.equal(1.5, model.weight);
				assert.equal("Chile", model.origin);
			});
		});

		it('should return undefined with invalid filter', function () {
			Orange.findOne({weight: 25}).then(function(model) {
				assert.equal(undefined, model);
			});
		});
	});
});