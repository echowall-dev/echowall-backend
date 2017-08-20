'use strict';

module.exports = function(Account) {
  Account.validatesUniquenessOf('username');
  Account.validatesUniquenessOf('url');
};
