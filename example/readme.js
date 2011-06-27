#!/usr/local/bin/node

var clip = require('../');
var app = new clip();
var version = '0.0.1';
//
// SETUP
//
// Recursively find an 'app.json' file with reconf and add it to req.config
app.config('app.json',{flags:['conf']});
// Dont print stuff to console if --silent is set
app.flag('silent',function(req,res,next){
  res.remove(res.transports.Console);
  next();
});
// Always print out the app info (middleware)
app.use(function(req,res,next){
  res.info('App.js '+version);
  next();
});

app.usage(function(req,res,next) {
  res.info('commands: helloworld, info');
});

app.cli(['hello','/helloworld'], function(req,res,next) {
  res.info('hello world!');
});

var utils = require('util');
app.cli(['/info','/dump'], function(req,res,next) {
  res.data(utils.inspect(req));
});

app.run();
