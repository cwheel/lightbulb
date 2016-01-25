r = require('rethinkdb');

//DB Connection
var con;

//Function to call should when we connect
var connectedFunction;

r.connect( {host: 'localhost', port: 28015}, function(err, connection) {
    if (err) throw err;
    con = connection;

    if (connectedFunction != undefined) {
    	connectedFunction();
    }
});

function Model(name, params, values) {
	this.modelParams = params;
	this.modelValues = values;
	this.name = name;

	
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
	Model: Model
};