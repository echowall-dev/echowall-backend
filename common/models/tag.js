'use strict';

module.exports = function(Tag) {
  // Remove all the spaces in the tag name
  Tag.observe('before save', (ctx, next) => {
    if (ctx.instance) {
      ctx.instance.name = ctx.instance.name.replace(/\s+/g, '');
    } else {
      ctx.data.name = ctx.data.name.replace(/\s+/g, '');
    }
    next();
  });

  Tag.validatesUniquenessOf('name');
};
