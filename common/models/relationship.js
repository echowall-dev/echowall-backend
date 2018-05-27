'use strict';

module.exports = function(Relationship) {
  // Whenever a user followed another user,
  // if the target user is also following this user,
  // they become friends automatically
  Relationship.observe('after save', (ctx, next) => {
    const { Account } = app.models;

    if (ctx.isNewInstance && ctx.instance.status === 'follow') {
      // Find if the target user is also following this user
      Relationship.findOne({
        where: {
          subjectUserId: ctx.instance.objectUserId,
          objectUserId: ctx.instance.subjectUserId,
          status: 'follow'
        }
      }, (err, foundRelationship) => {
        if (err) {
          console.error(err);
          return next(err);
        }

        // Assume they are friends first
        let mutualStatus = 'friend';

        // The target user is indeed also following this user
        if (foundRelationship) {
          // Change the status of these two users to 'friend'
          Relationship.updateAll({
            // This argument itself is a where filter so no 'where:' is needed
            // 'inq:' is faster than 'or:' on fields which are indexes
            id: {inq: [foundRelationship.id, ctx.instance.id]}
          }, {
            status: 'friend'
          }, (err, info) => {
            if (err) {
              console.error(err);
              return next(err);
            }
            // console.log(info);
          });
        } else {
          // The target user is not following this user
          mutualStatus = 'follow';
        }

        if (mutualStatus === 'friend') {
          Account.findById(ctx.instance.subjectUserId, (err, oldAccount) => {
            if (err) return next(err);
            oldAccount.updateAttributes({
              friendCount: oldAccount.friendCount + 1
            }, (err, newAccount) => {
              if (err) return next(err);
            });
          });

          Account.findById(ctx.instance.objectUserId, (err, oldAccount) => {
            if (err) return next(err);
            oldAccount.updateAttributes({
              friendCount: oldAccount.friendCount + 1
            }, (err, newAccount) => {
              if (err) return next(err);
            });
          });
        } else {
          Account.findById(ctx.instance.subjectUserId, (err, oldAccount) => {
            if (err) return next(err);
            oldAccount.updateAttributes({
              followeeCount: oldAccount.followeeCount + 1
            }, (err, newAccount) => {
              if (err) return next(err);
            });
          });

          Account.findById(ctx.instance.objectUserId, (err, oldAccount) => {
            if (err) return next(err);
            oldAccount.updateAttributes({
              followerCount: oldAccount.followerCount + 1
            }, (err, newAccount) => {
              if (err) return next(err);
            });
          });
        }

        next();
      });
    }
  });

  // TODO: update followeeCount, followerCount and friendCount for block status

  // TODO: handle delete
  // Relationship.observe('after delete', (ctx, next) => {});
};
