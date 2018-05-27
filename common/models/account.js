'use strict';

const app = require('../../server/server');

module.exports = function(Account) {
  Account.validatesUniquenessOf('username');

  const { AccountDouble, Post } = app.models;
  const { mariaDs } = app.dataSources;

  // Create or update AccountDouble instance after an account is created
  Account.observe('after save', (ctx, next) => {
    AccountDouble.upsertWithWhere({
      accountId: ctx.instance.id
    }, {
      accountId: ctx.instance.id,
      role: ctx.instance.role,
      status: ctx.instance.status,
      createdAt: ctx.instance.createdAt,
      updatedAt: ctx.instance.updatedAt
    }, (err, newAccountDouble) => {
      if (err) {
        return next(err);
      }
      // console.log(model);
      next();
    });
  });

  /**
   * Fetch available posts
   * @param {number} amount The amount of posts to get
   * @param {date} lastFetchTime The time of last fetch
   * @param {Function(Error, array)} cb
   */
  Account.prototype.postFetch = function(amount, lastFetchTime, cb) {
    amount = (amount) ? amount : 10;
    lastFetchTime = (lastFetchTime) ? lastFetchTime : new Date().toISOString();

    const sqlQuery = `
    SELECT postId from ((
    	SELECT P.postId, P.createdAt
    	FROM PostDouble AS P LEFT JOIN Collaboration AS C
    	ON C.postId = P.postId AND C.collaboratorId = "${this.id}"
    	WHERE (P.creatorId = "${this.id}" OR C.collaboratorId = "${this.id}")
    	AND P.createdAt < "${lastFetchTime}"
    	AND P.status = "active"
    	LIMIT ${amount}
    ) UNION (
    	SELECT P.postId, P.createdAt
    	FROM PostDouble AS P INNER JOIN Relationship AS R
    	ON R.objectUserId = P.creatorId AND R.subjectUserId = "${this.id}"
    	AND (P.privacy = "friend" AND R.status = "friend" AND R.access = "free"
    	OR P.privacy = "public" AND R.access = "free")
    	AND P.createdAt < "${lastFetchTime}"
    	AND P.status = "active"
    	LIMIT ${amount}
    )) AS PD
    ORDER BY createdAt DESC
    LIMIT ${amount};
    `;

    mariaDs.connector.execute(sqlQuery, null, (err, postDoubleList) => {
      if (err) console.error(err);

      let postIdList = postDoubleList.map(postDouble => postDouble.postId);

      Post.find({
        where: {
          id: {inq: postIdList}
        },
        order: 'createdAt DESC',
        include: ['creator', 'collaborators']
      }, (err, postList) => {
        if (err) console.error(err);
        cb(null, postList);
      });
    });
  };

  /**
   * Perform a relationship action to another user
   * @param {string} userId The ID of the target user
   * @param {string} action Can be follow, unfollow, block or unblock
   * @param {Function(Error, string, boolean)} callback
   */
  Account.prototype.relationship = function(userId, action, callback) {
    if (userId === this.id) {
      let err = new Error('Target user and current user are the same');
      err.statusCode = 422;
      callback(err, userId, false);
    } else {
      const { Relationship } = app.models;

      switch (action) {
        case 'follow':
          Relationship.create({
            subjectUser: this.id,
            objectUser: userId,
            status: 'follow'
          }, (err, relationship) => {
            if (err) {
              console.error(err);
              callback(err, userId, false);
            } else {
              callback(null, userId, true);
            }
          });
          break;
        case 'unfollow':
          callback(null, userId, true);
          break;
        case 'block':
          callback(null, userId, true);
          break;
        case 'unblock':
          callback(null, userId, true);
          break;
        default:
          let err = new Error('Invalid action');
          err.statusCode = 422;
          callback(err, userId, false);
      }
    }
  };
};
