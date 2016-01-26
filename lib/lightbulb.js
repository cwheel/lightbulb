var r = require('rethinkdb');
var Model = require('./model.js');
var types = require('./types.js');

//DB Connection
var con;

//Function to call should when we connect
var connectedFunction;

//Arguments
var args = {
	host: 'localhost',
	port: 28015,
	db: 'lightbulb'
}

module.exports = function(in_args) {
	//Copy the pertinent arguments
	var arg_keys = Object.keys(in_args);

	for (var i = 0; i < arg_keys.length; i++) {
		if (args[arg_keys[i]] != undefined) {
			args[arg_keys[i]] = arg_keys[i];
		}
	}

	//Connect to Rethink
	r.connect({host: args.host, port: args.port}, function(err, connection) {
	    if (err) throw err;
	    con = connection;

	    //Create a new database if one doesn't exist
	    r.dbList().contains(args.db).do(function(exists) {
		    return r.branch(exists, true, r.dbCreate(args.db));
	  	}).run(con);

	    if (connectedFunction != undefined) {
	    	connectedFunction();
	    }
	});

	//Return a pre-built constructor for the new model
	function createModel(name, params) {
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
		return function (values) {
			return new Model(name, params, values, r);
		}
	}

	return {
		connection: function() {
			return con;
		},
		connected: connectedFunction,
		onConnected: function(func) {
			connectedFunction = func;
		},
		createModel: createModel,
		Model: Model,
		types: types
	}
};