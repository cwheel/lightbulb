r = require('rethinkdb');

var con;

r.connect( {host: 'localhost', port: 28015}, function(err, connection) {
    if (err) throw err;
    con = connection;
})

module.exports = {
	
};