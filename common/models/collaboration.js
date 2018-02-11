'use strict';

const app = require('../../server/server');

module.exports = function(Collaboration) {
  Collaboration.observe('after save', (ctx, next) => {
    if (ctx.isNewInstance) {
      const { Account, Post } = app.models;

      Account.findById(ctx.instance.collaboratorId, (err, oldAccount) => {
        if (err) next(err);
        oldAccount.updateAttributes({
          postCollaborateCount: oldAccount.postCollaborateCount + 1
        }, (err, newAccount) => {
          if (err) next(err);
        });
      });

      Post.findById(ctx.instance.postId, (err, oldPost) => {
        if (err) next(err);
        oldPost.updateAttributes({
          collaboratorCount: oldPost.collaboratorCount + 1
        }, (err, newPost) => {
          if (err) next(err);
        });
      });
    }
  });
};
