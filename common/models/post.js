'use strict';

const app = require('../../server/server');

module.exports = function(Post) {
  const { Account, PostDouble } = app.models;

  // Create or update PostDouble instance after a post is created
  Post.observe('after save', (ctx, next) => {
    if (ctx.isNewInstance) {
      Account.findById(ctx.instance.creatorId, (err, oldAccount) => {
        if (err) next(err);
        oldAccount.updateAttributes({
          postCreateCount: oldAccount.postCreateCount + 1
        }, (err, newAccount) => {
          if (err) next(err);
        });
      });
    }

    PostDouble.upsertWithWhere({
      postId: ctx.instance.id
    }, {
      postId: ctx.instance.id,
      creatorId: ctx.instance.creatorId,
      privacy: ctx.instance.privacy,
      status: ctx.instance.status,
      createdAt: ctx.instance.createdAt,
      updatedAt: ctx.instance.updatedAt
    }, (err, newPostDouble) => {
      if (err) {
        return next(err);
      }
      // console.log(model);
      next();
    });
  });
};
