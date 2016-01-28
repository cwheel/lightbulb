var r = require('rethinkdb');
var q = require('q');

var Document = require('./document.js');
var DocumentSet = require('./documentSet.js');

/* Document Factory
====================
The naming of this is a bit disingenuous as the constructor below technically doesn’t build DocumentFactories.
When a user ‘creates a model’, they simply are given an instance of a DocumentFactory for the chosen parameters.
However, they still do ‘create the model’, hence the first four errors referencing Model.
*/

module.exports = function(name, params, con, args) {
	var readyCallback;

	if (name == undefined) {
		throw new Error("Models must be created with a name");
	}

	if (typeof name != "string") {
		throw new Error("Names must be a string");
	}

	if (params == undefined) {
		throw new Error("Models must be created with parameters");
	}

	if (!(params instanceof Object)) {
		throw new Error("Parameters must be an object");
	}
	
	//Return a DocumentFactory for later use
	var factory = function(values) {
		return new Document(name, params, values, con, args);
	};

	//Configure the callback for when this DocumentFactory is ready
	//Useful if the DocumentFactory is needed as soon as possible
	factory.ready = function(callback) {
		readyCallback = callback;
	};

	//factorytruct the table if need be
    r.db(args.db).tableList().contains(name).do(function(exists) {
	    return r.branch(exists, true, r.db(args.db).tableCreate(name, {primaryKey: 'id'}));
  	}).run(con, function() {
  		
  		//If a callback was defined
  		if (readyCallback) {
  			readyCallback();
  		}
  	});

	//Retrieve an instance of this Document
	factory.get = function(id) {
		var def = q.defer();

		r.db(args.db).table(name).get(id).run(con, function(err, saved) {
			if (!saved || err) {
				def.resolve(undefined);
			} else {
				def.resolve(new Document(name, params, saved, con, args));
			}
		});
		
		//Hand back a promise
		return def.promise;
	};

	//Get all matching a filter
	factory.find = function(filter) {
		var def = q.defer();

		if (!filter) {
			throw new Error("Filter cannot be undefined");
		}

		r.db(args.db).table(name).filter(filter).run(con, function(err, saved) {
			var set = new DocumentSet(name, con, args);

			saved.each(function(err, row) {
				if (!row || err) {
					def.resolve(undefined);
				}

		    	set.append(name, params, row, con, args);
		    }, function() {
		    	def.resolve(set);
		    });
		});

		//Hand back a promise
		return def.promise;
	};

	//Get one instance of this Document that matches the filter
	factory.findOne = function(filter) {
		var def = q.defer();

		factory.find(filter).then(function(results) {
			if (!results) {
				def.resolve(undefined);
			} else if (results.length > 0) {
				def.resolve(results[0]);
			} else {
				def.resolve(undefined);
			}
		});

		//Hand back a promise
		return def.promise;
	};

	//Return the actual factory
	return factory;
}