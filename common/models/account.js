'use strict';

module.exports = function(Account) {
  Account.validatesUniquenessOf('url');
};
