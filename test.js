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
	describe('#createModel()', function () {
		it('should throw an error when created with nothing', function () {
			assert.throws(function() {
				lightbulb.createModel()
			}, Error);
		});

		it('should throw an error when created with one parameter', function () {
			assert.throws(function() {
				lightbulb.createModel("Test")
			}, Error);
		});

	});

	var a = lightbulb.createModel("Test", {test: String});
	a({b: 'c'});
});