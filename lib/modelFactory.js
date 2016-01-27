var r = require('rethinkdb');
var q = require('q');

var Model = require('./model.js');

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
	
	//Return a constructor for later use
	var cons = function(values) {
		return new Model(name, params, values, con, args);
	};

	//Configure the callback for when this model is ready
	//Useful if the model is needed as soon as possible
	cons.ready = function(callback) {
		readyCallback = callback;
	};

	//Construct the table if need be
    r.db(args.db).tableList().contains(name).do(function(exists) {
	    return r.branch(exists, true, r.db(args.db).tableCreate(name, {primaryKey: 'id'}));
  	}).run(con, function() {
  		
  		//If a callback was defined
  		if (readyCallback) {
  			readyCallback();
  		}
  	});

	//Retrieve an instance of this model
	cons.get = function(id) {
		var def = q.defer();

		r.db(args.db).table(name).get(id).run(con, function(err, saved) {
			if (!saved || err) {
				def.resolve(undefined);
			} else {
				def.resolve(new Model(name, params, saved, con, args));
			}
		});
		
		//Hand back a promise
		return def.promise;
	};

	//Get one instance of this model that matches the query
	cons.findOne = function(query) {
		var def = q.defer();

		r.db(args.db).table(name).filter(query).run(con, function(err, saved) {
			saved.next(function(err, row) {
				if (!row) {
					def.resolve(undefined);
				} else {
					def.resolve(new Model(name, params, row, con, args));
				}
			});
		});

		//Hand back a promise
		return def.promise;
	};

	return cons;
}