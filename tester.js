var lightbulb = require('./lib/lightbulb')();

lightbulb.onConnected(function() {
	var cons = lightbulb.createModel("Test", {test: lightbulb.types.String});
	var a = new cons({test: ""});
	
	a.save();
	cons.get();
});