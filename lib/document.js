var r = require('rethinkdb');
var q = require('q');

var util = require('./util');
var DocumentSet = require('./documentSet');

module.exports = function(name, params, values, relationships, con, args) {
	var documentFactory;

	//Check if the given key is one added by a relationship
	function isRelationship(key) {
		return Object.keys(relationships).indexOf(key) != -1;
	}

	this.validate = function(inValues, update) {
		//Validate the given values by ensuring they are the specified type
		var keys = Object.keys(inValues);

		for (var i = 0; i < keys.length; i++) {
			//Make sure the key is in our document (Exclude id as it is not always present, i.e prior to a save)
			if (params[keys[i]] == undefined && keys[i] != "id" && !isRelationship(keys[i])) {
				throw new Error("Given key '" + keys[i] + "' is undefined in document '" + name + "'")
			} else {
				//Make sure the types match
				if (typeof inValues[keys[i]] != params[keys[i]] && keys[i] != "id" && !isRelationship(keys[i])) {
					throw new Error("Value given for key '" + keys[i] + "' is '" + typeof inValues[keys[i]] + "'. Expected type '" + params[keys[i]] + "' in document '" + name + "'");
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
		var r_keys = Object.keys(relationships);
		var saveDef = q.defer();

		var savePromises = [];

		//Grab all the values from their this.<key> location incase someone updated them
		for (var i = 0; i < r_keys.length; i++) {
			//If we found a model
			if (typeof this[r_keys[i]] == "object") {
				//Temporary promise
				var def = q.defer();

				//If we found a set
				if (this[r_keys[i]].appendDocument) {
					var newIds = [];

					//Multi-promise solution, def is resolved way too many times
					//ID's need to be kv based to ensure they are synced later, not now
					//At the moment the array is not full of them

					//If the set we're saving is empty
					if (this[r_keys[i]].length == 0) {
						def = undefined;
					}

					//Look at each document in the set
					this[r_keys[i]].forEach(function(doc) {
						//Save and save the defered promise
						doc.save().then(function(saved) {
							newIds.push(saved.id);
							def.resolve();
						});
					});

					//Replace the document set with
					this[r_keys[i]] = newIds;
				} else {
					//Save and save the defered promise
					this[r_keys[i]].save().then(function(saved) {
						this[r_keys[i]] = saved.id;
						def.resolve();
					});
				}

				//Keep track of the defered
				if (def) savePromises.push(def.promise);
			}
		}

		//Grab all the values from their this.<key> location incase someone updated them
		for (var i = 0; i < p_keys.length; i++) {
			updated[p_keys[i]] = this[p_keys[i]];
		}

		var commit = function(_this) {
			//Validate the updated values
			_this.validate(updated, false);

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
							saveDef.resolve(saved);
						} else {
							saveDef.resolve(saved);
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
		};

		//Wait for the promises to complete if there are any, otherwise just finalize the save
		if (savePromises.length > 0) {
			q.all(savePromises).then(function() {
				commit(this);
			});
		} else {
			commit(this);
		}

		//Hand back a promise
		return saveDef.promise;
	};

	//Remove this document
	this.remove = function() {
		var def = q.defer();

		//Make sure this document has an id
		if (!this.id) {
			throw new Error("Cannot remove model '" + name + "' as it has not been saved yet");
		}

		//Delete the matching id
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

	//Make sure that the relationships have keys
	var relKeys = Object.keys(relationships);

	for (var i = 0; i < relKeys.length; i++) {
		if (relationships[relKeys[i]].type == "hasMany") {
			this[relKeys[i]] = new DocumentSet(name, con, args);
		} else if (relationships[relKeys[i]].type == "hasOne") {
			this[relKeys[i]] = new relationships[relKeys[i]].model({});
		}
	}

	//Get a document factory
	documentFactory = require('./documentFactory')(name, params, relationships, con, args);
}