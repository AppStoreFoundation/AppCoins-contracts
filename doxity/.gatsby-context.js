'use strict';

/*  weak */
// This file is auto-written and used by Gatsby to require
// files from your pages directory.
module.exports = function (callback) {
  var context = require.context('./pages', true, /(coffee|cjsx|jsx|js|markdown|md|ipynb|html|json|yaml|toml)$/); // eslint-disable-line
  if (module.hot) {
    module.hot.accept(context.id, function () {
      context = require.context('./pages', true, /(coffee|cjsx|jsx|js|markdown|md|ipynb|html|json|yaml|toml)$/); // eslint-disable-line
      return callback(context);
    });
  }
  return callback(context);
};