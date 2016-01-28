var r = require('rethinkdb');
var q = require('q');

var Document = require('./document.js');

module.exports = function(name, con, args) {
	this.length = 0;

	//Add a new entry to the set
	this.append = function(name, params, row, con, args) {
		this.length++;
		this[this.length - 1] = new Document(name, params, row, con, args);
	};

	//Add an existing document
	this.appendDocument = function(doc) {
		this.length++;
		this[this.length - 1] = doc;
	};

	//Iterate over the documents
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