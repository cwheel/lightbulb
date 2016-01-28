var r = require('rethinkdb');
var q = require('q');

module.exports = function(name, params, values, con, args) {
	var documentFactory;

	this.validate = function(inValues, update) {
		//Validate the given values by ensuring they are the specified type
		var keys = Object.keys(inValues);

		for (var i = 0; i < keys.length; i++) {
			//Make sure the key is in our document (Exclude id as it is not always present, i.e prior to a save)
			if (params[keys[i]] == undefined && keys[i] != "id") {
				throw new Error("Given key '" + keys[i] + "' is undefined in document '" + name + "'")
			} else {
				//Make sure the types match
				if (typeof inValues[keys[i]] != params[keys[i]] && keys[i] != "id") {
					throw new Error("Value given for key '" + keys[i] + "' is '" + typeof keys[i] + "'. Expected type '" + params[keys[i]] + "' in documnet '" + name + "'")
				}
			}

			if (update) {
				this[keys[i]] = inValues[keys[i]];
			}
		}
	};

	//Save this document
	this.save = function() {
		var updated = {};
		var p_keys = Object.keys(params);
		var def = q.defer();

		//Grab all the values from their this.<key> location incase someone updated them
		for (var i = 0; i < p_keys.length; i++) {
			updated[p_keys[i]] = this[p_keys[i]];
		}

		//Validate the updated values
		this.validate(updated, false);

		//Function to run after updating or inserting
		var finished = function(err, status) {
			if (status == undefined || err) {
				if (err) {
					throw err;
				} else {
					throw new Error("Save on model '" + name + "' failed. Rethink returned 'undefined'.");
				}
			} else if (status.skipped == 1){
				throw new Error("Update on model '" + name + "' was skipped (id was likely invalid).");
			} else {
				//Check if we saved or updated
				var id = status.generated_keys ? status.generated_keys[0] : status.changes[0].new_val.id;

				//Fetch the document we just saved (or updated) and return
				documentFactory.get(id).then(function(saved) {
					if (saved == undefined) {
						def.resolve(saved);
					} else {
						def.resolve(saved);
					}
				});
			}
		};

		//Update or insert
		if (this.id) {
			r.db(args.db).table(name).get(this.id).update(updated, {returnChanges: true}).run(con, finished);
		} else {
			r.db(args.db).table(name).insert(updated).run(con, finished);
		}

		//Hand back a promise
		return def.promise;
	};

	//Remove this document
	this.remove = function() {
		var def = q.defer();

		//Make sure this document has an id
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

	//Validate the document upon its construction
	this.validate(values, true);

	//Get a document factory
	documentFactory = require('./documentFactory.js')(name, params, con, args);
}