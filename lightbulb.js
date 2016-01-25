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

function Model() {
	var modelParams;
	var name;

	this.setParams = function(newParams) {
		modelParams = newParams;
	};

	this.setName = function(newName) {
		name = newName;
	};
}

function createModel(name, params) {
	//var m = new Model();

	return function (values) {
		var n = name;
		console.log(n);
		console.log(values);
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