var r = require('rethinkdb');
var modelFactory = require('./modelFactory.js');
var types = require('./types.js');



module.exports = function(in_args) {
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

	//Copy the pertinent arguments
	if (in_args != undefined && in_args != null) {
		var arg_keys = Object.keys(in_args);

		for (var i = 0; i < arg_keys.length; i++) {
			if (args[arg_keys[i]] != undefined) {
				args[arg_keys[i]] = in_args[arg_keys[i]];
			}
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

	//Return the publicy accessible functions
	return {
		connection: function() {
			return con;
		},
		connected: connectedFunction,
		onConnected: function(func) {
			connectedFunction = func;
		},
		createModel: function(name, params) {
			return modelFactory(name, params, con, args);
		},
		types: types
	}
};