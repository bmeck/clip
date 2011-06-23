#!/usr/local/bin/node

var clip = require('../');
var app = new clip();

app.config('.haibuconf',{
  switches: ['c', 'conf']
});
app.use(function(req,res,next){
  console.log('Using config file '+req.config.store.file);
  next();
});

app.usage(function usage(req,res) {
  console.log('')
  console.log('app')
  console.log('  example CLI app for configuration files.')
  console.log('  Please refer to documentation of commands using `-h` or `--help`.')
  console.log('')
  console.log('commands')
  console.log('  app config')
  console.log('')
})

app.usage('/config',function config(req,res) {
  console.log('')
  console.log('app config')
  console.log('  Actions related to the app configuration file.')
  console.log('')
  console.log('notes')
  console.log('  The configuration will be found recursively up the file system.')
  console.log('  If no configuration file is found the HOME folder will be used.')
  console.log('  A default configuration file will be created if none exist.')
  console.log('')
  console.log('commands')
  console.log('  app config get' + ' <id>')
  console.log('  app config set' + ' <id> <value>')
  console.log('')
  console.log('options')
  console.log('  -c --conf [.appconf]     The file to use as our configuration')
  console.log('')
})

app.cli('/config/get/:id',function configGet(req,res) {
  console.log(req.params.id + ' = ' + (''+req.config.get(req.params.id)));
});
app.usage('/config/get',function configGetUsage(req,res) {
  console.log('')
  console.log('app config get' + ' <id>')
  console.log('  Gets the value of a property in the app configuration')
  console.log('  See `app config -h` for more details')
  console.log('')
  console.log('params')
  console.log('  id - nconf compatible name of the property')
});

app.cli('/config/set/:id/:value',function configSet(req,res) {
  req.config.set(req.params.id,req.params.value);
  req.config.save();
});
app.usage('/config/set',function configSetUsage(req,res) {
  console.log('')
  console.log('app config set' + ' <id> <value>')
  console.log('  Sets the value of a property in the app configuration')
  console.log('  See `app config -h` for more details')
  console.log('')
  console.log('params')
  console.log('  id - nconf compatible name of the property')
  console.log('  value - json compatible value of the property')
});

app.run();
