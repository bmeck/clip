var optimist = require('optimist');
var reconf = require('reconf');
var router = require('./router');
var prompt = require('prompt');
var cliff = require('cliff');
var winston = require('winston');
var isatty = require('tty').isatty;
var hasOwnProperty = Object.prototype.hasOwnProperty;

function clip() {
  if (!this instanceof clip) {
    return new clip();
  }
  this.routers = [];
  this.middleware = [];
  this.usages = [];
  return this;
}
clip.prototype.configure = function configure(name, handler) {
  this.middleware.push(function(cmd,tty,next) {
    if(cmd.env.NODE_ENV === name) {
      handler(cmd,tty,next)
    }
  })
}
clip.prototype.params = function params (name, handler) {
  var names = [].concat(name)
  this.middleware.push(function(cmd,tty,next) {
    for(var i = 0; i < names.length; i++) {
      var name = names[i];
      if(hasOwnProperty.call(cmd.params,name)) {
        handler(cmd,tty,next)
        return
      }
    }
    next();
  })
}
clip.prototype.flag = function flag (name, handler) {
  var names = [].concat(name)
  this.middleware.push(function(cmd,tty,next) {
    for(var i = 0; i < names.length; i++) {
      var name = names[i];
      if(hasOwnProperty.call(cmd.flags,name)) {
        handler(cmd,tty,next)
        return;
      }
    }
    next();
  })
}
clip.prototype.config = function config (file,options) {
  options = options || {};
  var flags = options.flags || [];
  var defaults = options.defaults || {};
  var overrides = options.overrides || undefined;
  this.use(function configuration(cmd,tty,next) {
    var filename = file;
    for(var i = 0; i < flags.length; i++) {
      var flagname = flags[i];
      var value = cmd.flags[flagname];
      if (value) {
        filename = value;
        break;
      }
    }
    var config = reconf(filename, overrides, defaults);
    config.load();
    cmd.config = config;
    next();
  })
}
clip.prototype.run = function run(cli, cb) {
  var argv;
  if (cli && cli !== process) {
    argv = optimist(cli.argv || [], cli.cwd);
    argv.$0 = process.$0;
  }
  else {
    argv = optimist.argv;
    cli = process;
    if (!cb) {
      cb = function() {
        process.exit(tty.statusCode);
      }
    }
  }
  var cmd = {};
  cmd.env = cli.env;
  cmd.flags = argv;
  if(!isatty(0)) {
    cmd.stream = process.openStdin();
  }
  cmd.url = '/' + argv._.map(function encode(component) {
    return encodeURIComponent(component)
  }).join('/');
  var tty = new TTYHelper();
  this.handle(cmd, tty, cb);
}
clip.prototype.cli = function cli(routes, handler) {
  if(!handler) {
    handler = routes;
    routes = '';
  }
  if(typeof routes === 'object' && routes.length) {
    for(var i = 0; i < routes.length; i++) {
      this.cli(routes[i],handler);
    }
  }
  else {
    if(routes[0] !== '/') {
      routes = '/' + routes;
    }
    this.routers.push({
      matcher: router(routes),
      handler: handler
    });
  }
}
clip.prototype.usage = function usage(routes, handler) {
  if(!handler) {
    handler = routes;
    routes = '';
  }
  if(typeof routes === 'object' && routes.length) {
    for(var i = 0; i < routes.length; i++) {
      this.usage(routes[i],handler);
    }
  }
  else {
    if(routes[0] !== '/') {
      routes = '/' + routes;
    }
    this.usages.push({
      matcher: router(routes),
      handler: handler
    });
  }
}
clip.prototype.use = function use(middleware) {
  this.middleware.push(middleware);
}
function noop() {}
clip.prototype.handle = function handle(cmd,tty,cb) {
  if (typeof cmd === 'string') {
    cmd = {
      url: cmd,
      params: optimist.argv
    };
  }
  cmd.flags = cmd.flags || {}
  var routers = cmd.flags.h || cmd.flags.help ? this.usages : this.routers
  for(var i = 0; i < routers.length; i++) {
    var route = routers[i],
      match = route.matcher(cmd.url);
    if (match) {
      //matching route, fire off all the middleware
      cmd.params = match;
      tty = tty || new CLIResponse();
      if (this.middleware.length) {
        var i = 1, $this = this;
        this.middleware[0](cmd,tty,function next() {
          var l = $this.middleware.length;
          if (i === l) {
            route.handler(cmd,tty,cb||noop);
          }
          else if (i < l) {
            $this.middleware[i++](cmd,tty,next);
          }
        })
      }
      else {
        route.handler(cmd,tty,cb||noop);
      }
      return;
    }
  }
  if(!cmd.flags.h) {
    if(cmd.url.length > 1 && cmd.url.slice(-1) == '/') {
      cmd.url = cmd.url.slice(0,-1);
      this.handle(cmd, tty, cb);
    }
    else {
      cmd.flags.h = true;
      tty.end(404);
      this.handle(cmd, tty, cb);
    }
  }
  else if(cmd.url && cmd.url !== '/') {
    cmd.url = cmd.url[0] + cmd.url.slice(1).replace(/([\/]|^)[^\/]*$/,'');
    this.handle(cmd, tty, cb);
  }
}

function TTYHelper() {
  this.statusCode = 0;
  for(var key in cliff) {
    var value = cliff[key];
    if(typeof value === 'function') {
      this[key] = value.bind(cliff);
    }
  }
}
TTYHelper.prototype = winston;
TTYHelper.prototype.end = function end(statusCode) {
  this.statusCode = statusCode
}
TTYHelper.prototype.prompt = prompt;

module.exports = clip;
