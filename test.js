var assert = require('assert');
var lightbulb = require('./lib/lightbulb')({db: 'test'});

lightbulb.onConnected(function() {
	run();
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

		it('should throw an error when created with anything but a string', function () {
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
				var cons = lightbulb.createModel("Test", {test: lightbulb.types.String});
				
				if (typeof cons != "function") {
					throw new Error("Should return a model constructor");
				}
			}, Error);
		});
	});

	describe('#Model Prototype', function () {
		var testModel;

		before(function() {
		   testModel = lightbulb.createModel("Test", {test: lightbulb.types.String, test2: lightbulb.types.Number});
		});

		it('should return a Model object when the constructor is called', function () {
			assert.doesNotThrow(function() {
				var inst = new testModel({test: "Value"});
				
				if (typeof inst != "object") {
					throw new Error("Should return a model object");
				}
			}, Error);
		});

		it('should throw an exception when given values for non-existant keys', function () {
			assert.throws(function() {
				var inst = new testModel({apple: "Value"});
			}, Error);

			assert.throws(function() {
				var inst = new testModel({test: "Value", apple: "Value"});
			}, Error);
		});

		it('should throw an exception when given values with incorrect types for their keys', function () {
			assert.throws(function() {
				var inst = new testModel({test: 6});
			}, Error);

			assert.throws(function() {
				var inst = new testModel({test: "hello", test2: "hello"});
			}, Error);
		});

		it('should be able to retrieve values given from keys', function () {
			var inst = new testModel({test: "hello", test2: 6});
			
			assert.equal("hello", inst.test);
			assert.equal(6, inst.test2);
		});

		it('should be able to set values by key', function () {
			var inst = new testModel({test: "hello", test2: 6});
			
			inst.test = "goodbye";
			assert.equal("goodbye", inst.test);

			inst.test2 = 12;
			assert.equal(12, inst.test2);
		});
	});
});