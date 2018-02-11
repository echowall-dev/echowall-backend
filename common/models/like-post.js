'use strict';

const app = require('../../server/server');

module.exports = function(Likepost) {
  Likepost.observe('after save', (ctx, next) => {
    if (ctx.isNewInstance) {
      const { Account, Post } = app.models;

      Account.findById(ctx.instance.likerId, (err, oldAccount) => {
        if (err) next(err);
        oldAccount.updateAttributes({
          postLikeCount: oldAccount.postLikeCount + 1
        }, (err, newAccount) => {
          if (err) next(err);
        });
      });

      Post.findById(ctx.instance.postId, (err, oldPost) => {
        if (err) next(err);
        oldPost.updateAttributes({
          likeCount: oldPost.likeCount + 1
        }, (err, newPost) => {
          if (err) next(err);
        });
      });
    }
  });
};
