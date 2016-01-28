var r = require('rethinkdb');
var q = require('q');

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
		}
	};

	//Remove all items in the set
	this.remove = function() {
		var def = q.defer();
		var ids = [];

		for (var i = 0; i < this.length; i++) {
			ids.push(this[i].id);
		}

		r.table(name).getAll(r.args(ids)).delete({returnChanges: true}).run(con, function(err, status) {
			console.log(err);
			if (err || !status) {
				def.resolve(false);
			} else {
				def.resolve(true);
			}
		});

		return def.promise;
	};

	//Update all items in the set
	this.update = function(query) {
		
	}
}