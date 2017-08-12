'use strict';

module.exports = function(Tag) {
  Tag.validatesUniquenessOf('name');
};
