'use strict';

module.exports = function(Tag) {
  // Remove all the spaces in the tag name
  Tag.observe('before save', (context, next) => {
    if (context.instance) {
      context.instance.name = context.instance.name.replace(/\s+/g, '');
    } else {
      context.data.name = context.data.name.replace(/\s+/g, '');
    }
    next();
  });

  Tag.validatesUniquenessOf('name');
};
