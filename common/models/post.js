'use strict';

let appPros = require('../app-properties');
let postDomain = appPros.hostDomain + 'post/';

module.exports = function(Post) {
  Post.observe('before save', (ctx, next) => {
    if (ctx.instance) {
      if (ctx.instance.url === null) {
        ctx.instance.url = postDomain + ctx.instance.uuid;
      }
    } else {
      if (ctx.data.url === null) {
        ctx.data.url = postDomain + ctx.data.uuid;
      }
    }
    next();
  });

  Post.validatesUniquenessOf('url');
};
