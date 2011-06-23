#!/usr/local/bin/node

var clip = require('../');
var app = new clip();

app.config('.appconf',{
  flags: ['c', 'conf']
});
app.use(function(req,res,next){
  res.info('Using config file '+req.config.store.file);
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
app.usage('/config/get',function configGetUsage(req,res) {
  res.info('')
  res.info('app config get' + ' <id>')
  res.info('  Gets the value of a property in the app configuration')
  res.info('  See `app config -h` for more details')
  res.info('')
  res.info('params')
  res.info('  id - nconf compatible name of the property')
});

app.cli('/config/set/:id/:value',function configSet(req,res) {
  req.config.set(req.params.id,req.params.value);
  req.config.save();
});
app.usage('/config/set',function configSetUsage(req,res) {
  res.info('')
  res.info('app config set' + ' <id> <value>')
  res.info('  Sets the value of a property in the app configuration')
  res.info('  See `app config -h` for more details')
  res.info('')
  res.info('params')
  res.info('  id - nconf compatible name of the property')
  res.info('  value - json compatible value of the property')
});

app.run();
