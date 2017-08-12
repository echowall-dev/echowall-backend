'use strict';

module.exports = function(Post) {
  Post.validatesUniquenessOf('url');
};
