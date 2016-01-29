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

		//Grab the id of each item in this set
		for (var i = 0; i < this.length; i++) {
			if (!this[i].id) {
				throw new Error("Item does not have id, Set's must have objects with id's (i.e. fetched items).");
			}

			ids.push(this[i].id);
		}

		//Remove all items with the matching id's
		r.db(args.db).table(name).getAll(r.args(ids)).delete({returnChanges: true}).run(con, function(err, status) {
			if (err || !status) {
				def.resolve(false);
			} else {
				def.resolve(true);
			}
		});

		//Hand back a promise
		return def.promise;
	};

	//Update all items in the set
	this.update = function(update) {
		var def = q.defer();
		var ids = [];

		//Grab the id of each item in this set (and update internal references)
		for (var i = 0; i < this.length; i++) {
			if (!this[i].id) {
				throw new Error("Item does not have id, Set's must have objects with id's (i.e. fetched items).");
			}

			//Update any keys to reflect the requested update
			var updateKeys = Object.keys(update);
			for (var j = 0; j < updateKeys.length; j++) {
				this[i][updateKeys[i]] = update[updateKeys[i]];
			}

			ids.push(this[i].id);
		}
		
		//Make sure we have an update
		if (!update) {
			throw new Error("Update must not be undefined.");
		}

		//Remove all items with the matching id's
		r.db(args.db).table(name).getAll(r.args(ids)).update(update, {returnChanges: true}).run(con, function(err, updates) {
			if (err || !updates) {
				def.resolve(false);
			} else {
				def.resolve(true);
			}
		});

		//Hand back a promise
		return def.promise;
	}
}