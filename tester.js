var lightbulb = require('./lightbulb');


var cons = lightbulb.createModel("Test", {test: lightbulb.types.String});
var a = new cons({test: ""});
