'use strict';

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
};
