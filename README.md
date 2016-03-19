#lightbulb
![Build Status](https://api.travis-ci.org/cwheel/lightbulb.svg?branch=master)

An intuitive, lightweight data modeling system for RethinkDB loosely based on Mongoose and Thinky.

###lightbulb
#####([args])
Constructor for lightbulb, takes in optional arguments `db`, `port` and `host`. Returns an instance of lightbulb.

#####connection()
Returns the current RethinkDB connection.

#####onConnected(callback)
Call the specified function when a connection is established with the database.

#####createModel(modelName, modelStructure)
Create a new model with the name `modelName` and the model structure `modelStructure`. The model structure consists of keys with types as values.

#####types
A dictionary of supported model key types. Currently `String`, `Object`, `Array` and `Number` are supported.

###Document
#####save()
Save the current document as well as any modified associated documents. Returns a promise which resolved the saved document.

#####remove()
Remove this document from the database. Returns a promise which resolves to `true` if the document was able to be removed, `false` if otherwise.

###Document Model
#####ready(callback)
Call the specified function when model setup is complete and the model is ready to use.

#####get(id)
Fetch the document associated with the given `id`. Returns a promise which resolves to the fetched document.

#####getAll(id)
Fetch the document associated with the given `id` and all documents associated with it through and previously established relations. Returns a promise which resolves to the fetched document.

#####find(filter)
Fetch all documents matching a given filter. A filter for all cars that are red might look like: `{color: 'red'}`.

#####findAll(filter)
Fetch all documents matching a given filter, also fetching all related documents. A filter for all cars that are red might look like: `{color: 'red'}`.

#####findOne(filter)
Fetch the first document matching a given filter. A filter for all cars that are red might look like: `{color: 'red'}`.

#####findOneAll(filter)
Fetch the first document matching a given filter and also fetch documents related to the first found. A filter for all cars that are red might look like: `{color: 'red'}`.

#####hasMany(model, key)
Establish a has-many relationship between two models. The `key` attribute indicates which key the relation will stem from.

###Document Set
#####appendDocument(document)
Append the given document to the document set. This document will be placed into the i'th location `length`.

#####forEach(callback)
Iterate over the set by calling `callback` on each document (Iterates in the order of insertion).

#####remove()
Remove all documents in the given set.

#####update()
Save all changes to any document in the set.

#####length
The number of documents stored in the set