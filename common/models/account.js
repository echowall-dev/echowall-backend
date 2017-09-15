'use strict';

let appPros = require('../app-properties');
let accountDomain = appPros.hostDomain + '/account';

module.exports = function(Account) {
  Account.validatesUniquenessOf('username');
};
