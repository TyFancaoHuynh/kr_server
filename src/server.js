let express = require('express');
let bodyparser = require('body-parser');
var connection = require('./connection');
var routes = require('./routes');
var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);

var app = express();
app.use(bodyparser.json({ limit: '50mb' }));
app.use(bodyparser.urlencoded({ limit: '50mb', extended: false, parameterLimit: 1000000 }));
app.set("view engine","ejs");
app.set("views","./views");
app.use(express.static(__dirname + '/views/'));
// app.use(morgan('dev'));

connection.init();
routes.configure(app);
var server = app.listen(3001, function () {
  console.log('Server listening on port ' + server.address().port);
});
