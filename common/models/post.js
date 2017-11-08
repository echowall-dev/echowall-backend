'use strict';

const app = require('../../server/server');
// let appPros = require('../app-properties');
// let postDomain = appPros.hostDomain + '/post';

module.exports = function(Post) {
  // Create or update PostDouble instance after a post is created
  Post.observe('after save', (context, next) => {
    const PostDouble = app.models.PostDouble;

    PostDouble.upsertWithWhere({
      postId: context.instance.id
    }, {
      postId: context.instance.id,
      creatorId: context.instance.creatorId,
      privacy: context.instance.privacy,
      status: context.instance.status,
      createdAt: context.instance.createdAt,
      updatedAt: context.instance.updatedAt
    }, (err, model) => {
      if (err) {
        return next(err);
      }
      // console.log(model);
      next();
    });
  });
};
