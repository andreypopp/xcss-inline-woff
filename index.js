"use strict";

var fs = require('fs');
var path = require('path');
var kew = require('kew');

function readFile() {
  var promise = kew.defer()
  Array.prototype.push.call(arguments, promise.makeNodeResolver())
  fs.readFile.apply(null, arguments)
  return promise
}

var woffURI = /(url\(([^\)]*\.woff[^(url|format)\(]*)\))/;
var dataURI = /url\(data:/;

module.exports = function(style, ctx) {

  var rewrites = style.rules
    .map(function(r) {
      if (r.type === 'rule' && r.selectors[0] == '@font-face') {
        var rm = [];

        var tasks = r.declarations.map(function(d, idx) {
          var m = woffURI.exec(d.value);
          if (m) {
            return {
              declaration: d,
              filename: m[2]
                .replace(/\?.*/, '')
                .replace(/^'/, '')
                .replace(/'$/, '')
            };
          } else if (dataURI.exec(d.value)) {
            // do nothing
          } else if (d.property === 'src') {
            rm.push(idx);
          }
        }).filter(Boolean)[0];

        if (rm.length > 0) {
          rm.reverse();
          rm.forEach(function(idx) { r.declarations.splice(idx, 1); });
        }

        return tasks;
      }
    })
    .filter(Boolean)
    .map(function(task) {
      var source = task.declaration.position.source;
      var filename = path.resolve(path.dirname(source), task.filename)
      return readFile(filename, {encoding: 'base64'})
        .then(function(data) {
          task.declaration.value = (
            'url(data:application/woff;charset=utf-8;base64,' +
            data + ") format('woff')");
        });
    });

  return kew.all(rewrites).then(function() { return style; });
}
