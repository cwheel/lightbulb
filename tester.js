var lightbulb = require('./lightbulb');


var cons = lightbulb.createModel("Test", {test: String});
var a = new cons({test: "dffw"});
console.log(a.name);
