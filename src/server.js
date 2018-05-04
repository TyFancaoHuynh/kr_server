let express = require('express');
let bodyparser = require('body-parser');
var connection = require('./connection');
var routes = require('./routes');

var app = express();
app.use(bodyparser.json({ limit: '50mb' }));
app.use(bodyparser.urlencoded({ limit: '50mb', extended: false, parameterLimit: 1000000 }));
// app.use(morgan('dev'));

connection.init();
routes.configure(app);
var server = app.listen(3000, function () {
  console.log('Server listening on port ' + server.address().port);
});
