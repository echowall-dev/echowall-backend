'use strict';

let appPros = require('../app-properties');
let accountDomain = appPros.hostDomain + 'account/';

module.exports = function(Account) {
  Account.observe('before save', (ctx, next) => {
    if (ctx.instance) {
      if (ctx.instance.url === null) {
        ctx.instance.url = accountDomain + ctx.instance.uuid;
      }
    } else {
      if (ctx.data.url === null) {
        ctx.data.url = accountDomain + ctx.data.uuid;
      }
    }
    next();
  });

  Account.validatesUniquenessOf('username');
  Account.validatesUniquenessOf('url');
};
