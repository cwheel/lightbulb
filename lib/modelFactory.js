var r = require('rethinkdb');
var Model = require('./model.js');

module.exports = function(name, params, con, args) {
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

	//Construct the table if need be
    r.db(args.db).tableList().contains(name).do(function(exists) {
	    return r.branch(exists, true, r.db(args.db).tableCreate(name, {primaryKey: 'id'}));
  	}).run(con);

	//Return a constructor for later use
	var cons = function(values) {
		return new Model(name, params, values, con, args);
	};

	//Retrieve an instance of this model
	cons.get = function() {
		
	};

	return cons;
}