'use strict';

const app = require('../../server/server');

module.exports = function(Collaboration) {
  Collaboration.observe('after save', (ctx, next) => {
    if (ctx.isNewInstance) {
      const { Account, Post } = app.models;
      Account.upsertWithWhere();
      Post.upsertWithWhere();
    }
  });
};
