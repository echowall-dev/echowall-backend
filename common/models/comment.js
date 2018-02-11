'use strict';

const app = require('../../server/server');

module.exports = function(Comment) {
  // To ensure the comment is not empty when the type is "text"
  Comment.observe('before save', (ctx, next) => {
    if (ctx.instance) {
      if (ctx.instance.type === 'text' && (ctx.instance.message === null || ctx.instance.message === '')) {
        let err = new Error('The comment is empty');
        err.statusCode = 422;
        next(err);
      } else {
        next();
      }
    } else {
      if (ctx.data.type === 'text' && (ctx.data.message === null || ctx.data.message === '')) {
        let err = new Error('The comment is empty');
        err.statusCode = 422;
        next(err);
      } else {
        next();
      }
    }
  });

  Comment.observe('after save', (ctx, next) => {
    if (ctx.isNewInstance) {
      const { Account, Post } = app.models;

      Account.findById(ctx.instance.creatorId, (err, oldAccount) => {
        if (err) next(err);
        oldAccount.updateAttributes({
          commentCount: oldAccount.commentCount + 1
        }, (err, newAccount) => {
          if (err) next(err);
        });
      });

      Post.findById(ctx.instance.postId, (err, oldPost) => {
        if (err) next(err);
        oldPost.updateAttributes({
          commentCount: oldPost.commentCount + 1
        }, (err, newPost) => {
          if (err) next(err);
        });
      });
    }
  });
};
