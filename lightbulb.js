r = require('rethinkdb');

//DB Connection
var con;

//Function to call should when we connect
var connectedFunction;

//Data types for models
var type = {
	String : "string",
	Object : "object",
	Number: "number"
}

var db_name = "lightbulb";

r.connect( {host: 'localhost', port: 28015}, function(err, connection) {
    if (err) throw err;
    con = connection;

    r.dbList().contains(db_name).do(function (exists) {
    	return r.branch(exists, {created: 0}, r.dbCreate(db_name));
    });

    if (connectedFunction != undefined) {
    	connectedFunction();
    }
});

function Model(name, params, values) {
	this.params = params;
	this.values = values;
	this.name = name;

	this.validate = function(update) {
		//Validate the given values by ensuring they are the specified type
		var keys = Object.keys(this.values);

		for (var i = 0; i < keys.length; i++) {
			//Make sure the key is in our model
			if (this.params[keys[i]] == undefined) {
				throw new Error("Given key '" + keys[i] + "' is undefined in model '" + this.name + "'")
			} else {
				//Make sure the types match
				if (typeof this.values[keys[i]] != this.params[keys[i]]) {
					throw new Error("Value given for key '" + keys[i] + "' is '" + typeof keys[i] + "'. Expected type '" + this.params[keys[i]] + "' in model '" + this.name + "'")
				}
			}

			if (update) {
				this[keys[i]] = this.values[keys[i]];
			}
		}
	}

	this.validate(true);
}

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
		return new Model(name, params, values);
	}
}

module.exports = {
	connection: function() {
		return con;
	},
	connected: connectedFunction,
	onConnected: function(func) {
		connectedFunction = func;
	},
	createModel: createModel,
	Model: Model,
	type: type
};