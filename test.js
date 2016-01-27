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

describe('Model', function() {
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

	describe('#Model Prototype', function () {
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
});