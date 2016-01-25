var assert = require('assert');
var lightbulb = require('./lightbulb');

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
				var cons = lightbulb.createModel("Test", {test: String});
				
				if (typeof cons != "function") {
					throw new Error("Should return a model constructor");
				}
			}, Error);
		});
	});

	describe('#Model.Prototype', function () {
		var testModel;

		before(function() {
		   testModel = lightbulb.createModel("Test", {test: String});
		});

		it('should return a Model object when the constructor is called', function () {
			assert.doesNotThrow(function() {
				var inst = new testModel({test: "Value"});
				
				if (typeof inst != "object") {
					throw new Error("Should return a model object");
				}
			}, Error);
		});
	});
});