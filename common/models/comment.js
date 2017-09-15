'use strict';

module.exports = function(Comment) {
  // To ensure the comment is not empty when the type is "text"
  Comment.observe('before save', (context, next) => {
    if (context.instance) {
      if (context.instance.type === 'text' && (context.instance.message === null || context.instance.message === '')) {
        let err = new Error('The comment is empty');
        err.statusCode = 422;
        next(err);
      } else {
        next();
      }
    } else {
      if (context.data.type === 'text' && (context.data.message === null || context.data.message === '')) {
        let err = new Error('The comment is empty');
        err.statusCode = 422;
        next(err);
      } else {
        next();
      }
    }
  });
};
