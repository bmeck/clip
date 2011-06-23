var optimist = require('optimist');
var reconf = require('reconf');
var router = require('./router');
function clip() {
  if (!this instanceof clip) {
    return new clip();
  }
  this.routers = [];
  this.middleware = [];
  this.usages = [];
  return this;
}
clip.prototype.mixin = function mixin(prefix,exports) {
  if(!exports) {
    exports = prefix;
    prefix = '';
  }
  for(var method in exports) {
    var handler = exports[method]
    var signature = prefix + '/' + method
    if(typeof handler === 'function' || typeof handler.handler === 'function') {
      this.cli(signature, handler.handler || handler)
    }
    if(handler.usage) {
      this.usage(signature, handler.usage)
    }
    if(handler.mixin) {
      this.mixin(signature, handler.mixin)
    }
  }
}
clip.prototype.config = function config(file,options) {
  var switches = options.switches || [];
  var defaults = options.defaults || {};
  var overrides = options.overrides || undefined;
  this.use(function configuration(req,res,next) {
    var filename = file;
    for(var i = 0; i < switches.length; i++) {
      var switchname = switches[i];
      var value = req.switches[switchname];
      if (value) {
        filename = value;
        break;
      }
    }
    var config = reconf(filename, overrides, defaults);
    config.load();
    req.config = config;
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
        process.exit(res.statusCode);
      }
    }
  }
  var req = {
    env: cli.env,
    switches: argv,
    url: '/' + argv._.map(function encode(component) {
      return encodeURIComponent(component)
    }).join('/')
  };
  var res = new CLIResponse();
  this.handle(req, res, cb);
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
clip.prototype.handle = function handle(req,res,cb) {
  if (typeof req === 'string') {
    req = {
      url: req,
      params: optimist.argv
    };
  }
  req.switches = req.switches || {}
  var routers = req.switches.h || req.switches.help ? this.usages : this.routers
  for(var i = 0; i < routers.length; i++) {
    var route = routers[i], match;
    if (match = route.matcher(req.url)) {
      //matching route, fire off all the middlewares
      req.params = match;
      res = res || new CLIResponse();
      if (this.middleware) {
        var i = 1, $this = this;
        this.middleware[0](req,res,function next() {
          var l = $this.middleware.length;
          if (i === l) {
            route.handler(req,res,cb||noop);
          }
          else if (i < l) {
            $this.middleware[i++](req,res,next);
          }
        })
      }
      else {
        route.handler(req,res,cb||noop);
      }
      return;
    }
  }
  if(!req.switches.h) {
    req.switches.h = true;
    res.end(404);
    this.handle(req, res, cb);
  }
  else if(req.url) {
    req.url = req.url.replace(/([\/]|^)[^\/]*$/,'');
    this.handle(req, res, cb);
  }
}

function CLIResponse() {
  this.statusCode = 0;
}
CLIResponse.prototype.end = function end(statusCode) {
  this.statusCode = statusCode
}

module.exports = clip;
