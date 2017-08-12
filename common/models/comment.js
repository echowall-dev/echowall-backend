'use strict';

module.exports = function(Comment) {
  Comment.observe('before save', (ctx, next) => {
    if (ctx.instance.type === 'text' && (ctx.instance.text === null || ctx.instance.text === '')) {
      let err = new Error('The comment is empty');
      err.statusCode = 422;
      next(err);
    } else {
      next();
    }
  });
};
