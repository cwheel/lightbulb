var Model = require('./model.js');

module.exports = function(name, con, args) {
	this.length = 0;

	//Add a new entry to the set
	this.append = function(name, params, row, con, args) {
		this.length++;
		this[this.length - 1] = new Model(name, params, row, con, args);
	};

	//Add an existing model
	this.appendModel = function(model) {
		this.length++;
		this[this.length - 1] = model;
	};

	//Iterate over the models
	this.forEach = function(callback) {
		for (var i = 0; i < this.length; i++) {
			callback(this[i]);
		};
	};

	//Remove all items in the set
	this.removeAll = function() {

	};

	//Update all items in the set
	this.updateAll = function(query) {

	}
}