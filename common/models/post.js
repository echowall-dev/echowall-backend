'use strict';

const app = require('../../server/server');

module.exports = function(Post) {
  const { PostDouble } = app.models;

  // Create or update PostDouble instance after a post is created
  Post.observe('after save', (ctx, next) => {
    PostDouble.upsertWithWhere({
      postId: ctx.instance.id
    }, {
      postId: ctx.instance.id,
      creatorId: ctx.instance.creatorId,
      privacy: ctx.instance.privacy,
      status: ctx.instance.status,
      createdAt: ctx.instance.createdAt,
      updatedAt: ctx.instance.updatedAt
    }, (err, model) => {
      if (err) {
        return next(err);
      }
      // console.log(model);
      next();
    });
  });
};
