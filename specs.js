"use strict";

var xcss = require('xcss');
var aggregate = require('stream-aggregate-promise');
var inline = require('./index');
var kew = require('kew');

describe('xcss-inline-woff', function() {

  it('works', function(done) {
    var src = {
      id: 'main.css',
      sourcePromise: kew.resolve([
          '@import "font-awesome/css/font-awesome.css";',
          '',
          'body { color: red; }'
        ].join('\n'))
    }

    aggregate(xcss(src, {transform: inline})).then(function(bundle) {
    }).then(done, done);
  });

});
