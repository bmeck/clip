Clip is a port of most of the features of Express to CLI programming.

Many times we want to have complex use cases that are hard to express and routing along Express and Sugarskull seem to be an apt way of doing this.
Another thing that we want to do in CLI programming often is use configuration files, flags, and parameters.

# Requests

req.env = process.env
req.flags = optimist.argv
req.config = nconf
req.prompt = prompt

res = winston + cliff

# URLs

Urls are partitioned with '/' with a starting '/' at all times, they are url encoded, and accept ':param' and '*'

## require('clip')() -> app
## app.config

Determines where to find the config property for requests, uses reconf

## app.flag(flag, handler)

Uses a middleware if a flag is set, uses optimist

## app.cli(path||[path0,...],handler)

Executes a handler if the path is matched

## app.param

CLI parameter preconditions ala express

```javascript
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

app.cli(['/hello','/helloworld'], function(req,res,next) {
  res.info('hello world!');
});

var utils = require('util');
app.cli(['/info','/dump'], function(req,res,next) {
  res.data(utils.inspect(req));
});

app.run();
```
