'use strict';

module.exports = function(Relationship) {
  // Users cannot follow themselves
  // Need to do this checking in remote hooks instead of operation hooks,
  // otherwise there will be error "Callback was already called"
  Relationship.beforeRemote('**', (context, unused, next) => {
    // console.log(context.req.params);
    // console.log(context.req.body);

    if (context.req.body) {
      if (context.req.body.subjectUserId === context.req.body.objectUserId) {
        let err = new Error('Users cannot follow themselves');
        err.statusCode = 422;
        // console.error(err);
        // throw err;
        return next(err);
      }
    }
    next();
  });

  // Whenever a user followed another user,
  // if the target user is also following this user,
  // they become friends automatically
  Relationship.observe('after save', (context, next) => {
    if (context.instance) {
      Relationship.findOne({
        where: {
          subjectUserId: context.instance.objectUserId,
          objectUserId: context.instance.subjectUserId,
          status: 'follow'
        }
      }, (err, model) => {
        if (err) {
          console.error(err);
          return next(err);
        }

        if (model) {
          Relationship.updateAll({
            // This argument itself is a where filter so no 'where:' is needed
            // 'inq:' is faster than 'or:' on fields which are indexes
            id: {inq: [model.id, context.instance.id]}
          }, {
            status: 'friend'
          }, (err, info) => {
            if (err) {
              console.error(err);
              return next(err);
            }
            // console.log(info);
          });
        }

        next();
      });
    }
  });

  // Relationship.observe('after delete', (context, next) => {});
};
