Clip is a port of most of the featutty of Express to CLI programming.

Many times we want to have complex use cases that are hard to express and routing along Express and Sugarskull seem to be an apt way of doing this.
Another thing that we want to do in CLI programming often is use configuration files, flags, and parameters.

# Why

Sharing routes between express and cli, since most often they should look the same
Some basic things should be done for you.
Configuration files.

Help for commands should always use the same flags.

# No repl?

You can make a repl by posting urls, not too hard.
Most applications should not need internal repls.

# URLs

Urls are partitioned with '/' with a starting '/' at all times, they are url encoded, and accept ':param' and '*'

# Requests

Request follow the `cmd,tty,next` methodology except with `cmd,tty,next` since we are talking about command information, the terminal, and next stays the same.
In the future chaining CLI requests should be easier (ie a clean + build could be done through clip by calling the corresponding urls).

# Basic idea of handler arguments
```
cmd.env = process.env
cmd.flags = require('optimist').argv
cmd.config = require('nconf') + app.config(...)
cmd.prompt = require('prompt')
cmd.params = app.cli(':param') ...

tty = require('winston') + require('cliff')
```

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
// Recursively find an 'app.json' file with reconf and add it to cmd.config
app.config('app.json',{flags:['conf']});
// Dont print stuff to console if --silent is set
app.flag('silent',function(cmd,tty,next){
  tty.remove(tty.transports.Console);
  next();
});
// Always print out the app info (middleware)
app.use(function(cmd,tty,next){
  tty.info('App.js '+version);
  next();
});

app.usage(function(cmd,tty,next) {
  tty.info('commands: helloworld, info');
});

app.cli(['/hello','/helloworld'], function(cmd,tty,next) {
  tty.info('hello world!');
});

var utils = require('util');
app.cli(['/info','/dump'], function(cmd,tty,next) {
  tty.data(utils.inspect(cmd));
});

app.run();
```
