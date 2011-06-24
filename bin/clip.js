#!/usr/local/bin/node
//Hehe using ourselves...

var fs = require('fs');
var path = require('path');
var clip = require('../');
var app = new clip();

try {
  fs.statSync('./package.json');
}
catch (e) {
  fs.writeFile('./package.json','');
}

app.config('package.json');
app.cli('/create', function(req,res,next) {
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
  fs.writeFileSync(path.join('./bin/',name),fs.readFileSync(path.join(__dirname,'../example/standard.js')));
  req.config.set('dependencies:clip','0.1.x');
  req.config.set('bin:'+name,'./bin/'+name);
  var keywords = [].concat(req.config.get('keywords') || []);
  if(keywords.indexOf('CLI') === -1) {
    keywords.push('CLI')
  }
  req.config.set('keywords',keywords)
  req.config.save();
  res.info('Created new executable "'+name+'"')
});
app.usage('/create',function(req,res,next) {
  res.info('');
  res.info('clip create');
  res.info('');
  res.info('  adds a default executab le to ./bin and updates package.json');
  res.end(404);
});
app.run();
