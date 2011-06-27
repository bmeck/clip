#!/usr/local/bin/node
//Hehe using ourselves...

var fs = require('fs');
var path = require('path');
var clip = require('../');
var color = require('colors');
var app = new clip();

try {
  fs.statSync('./package.json');
}
catch (e) {
  console.log('   create : '.blue + 'package.json');
  fs.writeFile('./package.json','');
}

app.config('package.json');
app.cli('/', function(req,res,next) {

  try {
    fs.statSync('./bin/');
  }
  catch (e) {
    console.log('   create : '.blue + 'bin/');
    fs.mkdirSync('./bin/',0700);
  }

  var name = req.config.get('name') || 'app';
  var i = 0;
  for(;;) {
    try {
      fs.statSync(fs.realpathSync(path.join('./bin/',name)));
    }
    catch (e) {
      break;
    }
    name = name.replace(/[-]\d+$/,'') + '-' + (i++);
  }
  console.log('   create : '.blue + path.join('./bin/',name));
  fs.writeFileSync(path.join('./bin/',name),fs.readFileSync(path.join(__dirname,'../example/standard.js')));
  req.config.set('dependencies:clip','0.1.x');
  req.config.set('bin:'+name,'./bin/'+name);
  var keywords = [].concat(req.config.get('keywords') || []);
  if(keywords.indexOf('CLI') === -1) {
    keywords.push('CLI')
  }
  req.config.set('keywords',keywords)
  console.log('   edit   : '.green + 'package.json');
  req.config.save();
  res.info('Created new executable "'+name+'"')
});
app.usage('/',function(req,res,next) {
  res.info('');
  res.info('clip');
  res.info('');
  res.info('  adds a default executable to ./bin and updates or creates the package.json file');
  res.end(404);
});
app.run();
