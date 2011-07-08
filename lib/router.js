var partsPattern = '([\\*])|(\\:\\w+)';
var slice = Array.prototype.slice;
module.exports = function router(str) {
  var matcher = new RegExp(partsPattern,'g'), match;
  var generator = '';
  var ids = {};
  var i = 1;
  var index = 0;
  while(match = matcher.exec(str)) {
    generator += str.slice(index,match.index).replace(/\W/g,'\\$&');
    index = matcher.lastIndex;
    if(match[1]) {
      //match anything
      generator += '(.*$|.*?)';
      i++;
    }
    else if(match[2]) {
      //match anything before a separator
      generator += '([^/]+)';
      ids[match[0].slice(1)] = i;
      i++;
    }
  }
  generator += str.slice(index).replace(/\W/g,'\\$&');
  generator = new RegExp('^' + generator + '$');
  return function getRouteParams(str) {
    var match = generator.exec(str);
    if(match) {
      var params = slice.call(match,1);
      for(var id in ids) {
        params[id] = decodeURIComponent(match[ids[id]])
      }
      return params;
    }
  };
}
