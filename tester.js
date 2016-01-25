var lightbulb = require('./lightbulb');


var cons = lightbulb.createModel("Test", {test: lightbulb.type.String});
var a = new cons({test: 7});

console.log(typeof 8);
