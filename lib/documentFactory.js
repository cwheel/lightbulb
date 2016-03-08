var r = require('rethinkdb');
var q = require('q');

var Document = require('./document.js');
var DocumentSet = require('./documentSet.js');

/* Document Factory
====================
The naming of this is a bit disingenuous as the constructor below technically doesn’t build DocumentFactories.
When a user ‘creates a model’, they simply are given an instance of a DocumentFactory for the chosen parameters.
However, they still do ‘create the model’, hence the first four errors referencing Model.
*/

module.exports = function(name, params, relationships, con, args) {
	var readyCallback;

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
	
	//Return a DocumentFactory for later use
	var factory = function(values) {
		return new Document(name, params, values, factory.relationships, con, args);
	};

	//Keep track of any relationships that are added
	if (!relationships) {
		factory.relationships = {};
	} else {
		factory.relationships = relationships;
	}

	//Keep the factory name handy, mainly used for configuring model relationships
	factory.modelName = name;

	//Configure the callback for when this DocumentFactory is ready
	//Useful if the DocumentFactory is needed as soon as possible
	factory.ready = function(callback) {
		readyCallback = callback;
	};

	//Construct the table if need be
    r.db(args.db).tableList().contains(name).do(function(exists) {
	    return r.branch(exists, true, r.db(args.db).tableCreate(name, {primaryKey: 'id'}));
  	}).run(con, function() {
  		//If a callback was defined
  		if (readyCallback) {
  			readyCallback();
  		}
  	});

  	factory.get = function(id) {
  		var def = q.defer();

  		//Fetch the JSON structure
  		factory.getJSON(id).then(function(fetched) {
  			//Feed the JSON into a new Document and resolve with the parsed object
  			def.resolve(new Document(name, params, fetched, factory.relationships, con, args));
  		});

  		return def.promise;
  	};

	factory.getJSON = function(id) {
		var def = q.defer();
		var r_keys = Object.keys(factory.relationships);

		//Fetch the requested document
		r.db(args.db).table(name).get(id).run(con, function(err, saved) {
			//The model has at least one relationship
			if (r_keys.length > 0) {
				var subGetPromises = [];
				var subGetDefs = [];

				//Loop through all relation keys for the object
				for (var i = 0; i < r_keys.length; i++) {
					//If we're dealing with a has many relation
					if (factory.relationships[r_keys[i]].type == "hasMany") {
						//Loop over each entry in the hasMany relation
						for (var j = 0; j < saved[r_keys[i]].length; j++) {
							var subDef = q.defer();
							var relation = r_keys[i];

							//Keep track of the promise
							subGetPromises.push(subDef.promise);
							subGetDefs.push(subDef);

							//Fetch the associated document
							factory.relationships[r_keys[i]].model.getJSON(saved[r_keys[i]][j]).then(function(subSaved) {
								//Look at the id's in what we're supposed to be replacing
								for (var k = 0; k < saved[relation].length; k++) {
									//Find what position matches the object we have
									if (saved[relation][k] == subSaved.id) {
										//Replace the object, merging the documents
									 	saved[relation][k] = subSaved;
									 	
									 	//We're all set with this document
									 	subGetDefs[k].resolve();	
									}
								}
							});
						}
					}
				}

				//Once we finished fetching all the associated documents
				q.all(subGetPromises).then(function() {
					def.resolve(saved);//new Document(name, params, saved, factory.relationships, con, args)
				});
			} else {
				//The document had no relations, return it as is
				def.resolve(saved);
			}
		});
		
		//Hand back a promise
		return def.promise;
	};

	//Get all matching a filter
	factory.find = function(filter) {
		var def = q.defer();

		if (!filter) {
			throw new Error("Filter cannot be undefined");
		}

		//Run the Rethink filter query
		r.db(args.db).table(name).filter(filter).run(con, function(err, saved) {
			var set = new DocumentSet(name, con, args);

			//Iterate over each row and add it to the set
			saved.each(function(err, row) {
				if (!row || err) {
					def.resolve(undefined);
				}

		    	set.appendDocument(new Document(name, params, row, {}, con, args));
		    }, function() {
		    	//When finised, resolve with the document set
		    	def.resolve(set);
		    });
		});

		//Hand back a promise
		return def.promise;
	};

	//Get one instance of this Document that matches the filter
	factory.findOne = function(filter) {
		var def = q.defer();

		//Invoke the factories find function witht eh filter
		factory.find(filter).then(function(results) {
			//Make sure there were results and take the first one
			if (!results) {
				def.resolve(undefined);
			} else if (results.length > 0) {
				def.resolve(results[0]);
			} else {
				def.resolve(undefined);
			}
		});

		//Hand back a promise
		return def.promise;
	};

	//Add a new has many relationship to the model
	factory.hasMany = function(model, key) {
		if (!model) {
			throw new Error("'" + model.name + "' is not a valid model, cannot add relationship to model '" + this.name + "'");
		}

		if (!key) {
			throw new Error("'" + key + "' is not a valid relationship key, cannot add relationship to model '" + this.name + "'");
		}

		factory.relationships[key] = {model: model, type: "hasMany"};
	}

	//Add a new has one relationship to the model
	factory.hasOne = function(model, key) {
		if (!model) {
			throw new Error("'" + model.name + "' is not a valid model, cannot add relationship to model '" + this.name + "'");
		}

		if (!key) {
			throw new Error("'" + key + "' is not a valid relationship key, cannot add relationship to model '" + this.name + "'");
		}
		
		factory.relationships[key] = {model: model, type: "hasOne"};
	}

	//Return the actual factory
	return factory;
}