// 3rd Party libs
var app = require('koa')();
var serve = require('koa-static');
var views = require('koa-render');
var router = require('koa-router')();
var routes = require('./routes/routes');
var socket = require('http').Server(app.callback());
var io = require('socket.io')(socket);
require('dotenv').config();
// My libs
var laravelRequests = require('./src/lib/laravelReq');

// Socket.io
app.io = io;
// Laravel Request Queue
app.use(laravelRequests());
//Use ejs view engine
app.use(views('./views', 'ejs'));
//Static paths
app.use(serve('./public'));
// Routes
app.use(routes.routes()).use(routes.allowedMethods());
// Listen Ports
app.listen(3000);
socket.listen(3001);
