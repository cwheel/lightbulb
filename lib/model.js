var r = require('rethinkdb');

module.exports = function(name, params, values, con, args) {
	this.params = params;
	this.values = values;
	this.name = name;
	this.con = con;

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
	};

	//Save this model
	this.save = function() {

	};

	//Validate the model upon its construction
	this.validate(true);
}