#!/usr/local/bin/node

var clip = require('../');
var app = new clip();

app.config('.appconf',{
  flags: ['c', 'conf']
});
app.use(function(req,res,next){
  if(req.config.get('v') || req.config.get('verbose')) {
    req.verbose = true;
  }
  if(req.config.get('s') || req.config.get('silent')) {
    req.silent = true;
    res.remove(res.transports.Console);
  }
  if(req.verbose) {
    res.info('Using config file '+req.config.store.file);
  }
  next();
});

app.usage(function usage(req,res) {
  res.info('')
  res.info('app')
  res.info('  example CLI app for configuration files.')
  res.info('  Please refer to documentation of commands using `-h` or `--help`.')
  res.info('')
  res.info('commands')
  res.info('  app config')
  res.info('')
})

app.usage('/config',function config(req,res) {
  res.info('')
  res.info('app config')
  res.info('  Actions related to the app configuration file.')
  res.info('')
  res.info('notes')
  res.info('  The configuration will be found recursively up the file system.')
  res.info('  If no configuration file is found the HOME folder will be used.')
  res.info('  A default configuration file will be created if none exist.')
  res.info('')
  res.info('commands')
  res.info('  app config get' + ' <id>')
  res.info('  app config set' + ' <id> <value>')
  res.info('')
  res.info('options')
  res.info('  -c --conf [.appconf]     The file to use as our configuration')
  res.info('')
})

app.cli('/config/get/:id',function configGet(req,res) {
  res.info(req.params.id + ' = ' + (''+req.config.get(req.params.id)));
});
app.usage(['/config/get','/config/get/:id'],function configGetUsage(req,res) {
  res.help('')
  res.help('app config get' + ' <id>')
  res.help('  Gets the value of a property in the app configuration')
  res.help('  See `app config -h` for more details')
  res.help('')
  res.help('params')
  res.help('  id - nconf compatible name of the property')
  res.help('')
  if(!req.params.id) res.error('missing id');
});

app.cli('/config/set/:id/:value',function configSet(req,res) {
  req.config.set(req.params.id,req.params.value);
  req.config.save();
});
app.usage(['/config/set','/config/set/:id','/config/set/:id/:value'],function configSetUsage(req,res) {
  res.help('')
  res.help('app config set' + ' <id> <value>')
  res.help('  Sets the value of a property in the app configuration')
  res.help('  See `app config -h` for more details')
  res.help('')
  res.help('params')
  res.help('  id - nconf compatible name of the property')
  res.help('  value - json compatible value of the property')
  if(!req.params.id) res.error('Missing id');
  if(!req.params.value) res.error('Missing value');
});

if(require.main) {
  app.run();
}
module.exports = app;
