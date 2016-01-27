var r = require('rethinkdb');
var q = require('q');

module.exports = function(name, params, values, con, args) {
	var modelFactory;

	this.validate = function(update) {
		//Validate the given values by ensuring they are the specified type
		var keys = Object.keys(values);

		for (var i = 0; i < keys.length; i++) {
			//Make sure the key is in our model (Exclude id as it is not always present, i.e prior to a save)
			if (params[keys[i]] == undefined && keys[i] != "id") {
				throw new Error("Given key '" + keys[i] + "' is undefined in model '" + name + "'")
			} else {
				//Make sure the types match
				if (typeof values[keys[i]] != params[keys[i]] && keys[i] != "id") {
					throw new Error("Value given for key '" + keys[i] + "' is '" + typeof keys[i] + "'. Expected type '" + params[keys[i]] + "' in model '" + name + "'")
				}
			}

			if (update) {
				this[keys[i]] = values[keys[i]];
			}
		}
	};

	//Save this model
	this.save = function() {
		this.validate(false);

		var updated = {};
		var p_keys = Object.keys(params);
		var def = q.defer();

		//Grab all the values from their this.<key> location incase someone updated them
		for (var i = 0; i < p_keys.length; i++) {
			updated[p_keys[i]] = this[p_keys[i]];
		}

		//Check if we should be updating (i.e. this Model is from a .get())
		var upsert = this.id != undefined;

		//Save the model
		r.db(args.db).table(name).insert(updated).run(con, function(err, status) {
			if (status == undefined || err) {
				def.reject(status);
			} else {
				//Fetch the model we just saved and return
				modelFactory.get(status.generated_keys[0]).then(function(saved) {
					if (saved == undefined) {
						def.resolve(saved);
					} else {
						def.resolve(saved);
					}
				});
			}
		});

		//Hand back a promise
		return def.promise;
	};

	//Remove this model
	this.remove = function() {
		var def = q.defer();

		//Make sure this Model has an id
		if (!this.id) {
			throw new Error("Cannot remove model '" + name + "' as it has not been saved yet");
		}

		r.db(args.db).table(name).get(this.id).delete({returnChanges: true}).run(con, function(err, del) {
			if (!del || err) {
				def.resolve(false);
			} else {
				def.resolve(true);
			}
		});

		//Hand back a promise
		return def.promise;
	}

	//Validate the model upon its construction
	this.validate(true);

	//Get a model factory
	modelFactory = require('./modelFactory.js')(name, params, con, args);
}