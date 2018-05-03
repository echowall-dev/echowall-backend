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

  // Users cannot follow themselves
  // Need to do this checking in remote hooks instead of operation hooks,
  // otherwise there will be error "Callback was already called"
  Account.beforeRemote('**', (ctx, unused, next) => {
    // console.log(ctx.req.params);
    // console.log(ctx.req.body);

    if (ctx.req.params) {
      if (ctx.req.params.id === ctx.req.params.fk) {
        let err = new Error('Users cannot follow themselves');
        err.statusCode = 422;
        // console.error(err);
        // throw err;
        return next(err);
      }
    }
    next();
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
   * Follow another user
   * @param {string} userId The ID of the target user
   * @param {Function(Error, string)} callback
   */
  Account.prototype.follow = function(userId, callback) {
    let success;
    // TODO
    callback(null, userId, success);
  };

  /**
   * Unfollow another user
   * @param {string} userId The ID of the target user
   * @param {Function(Error, string, boolean)} callback
   */
  Account.prototype.unfollow = function(userId, callback) {
    let success;
    // TODO
    callback(null, userId, success);
  };

  /**
   * Block another user
   * @param {string} userId The ID of the target user
   * @param {Function(Error, string, boolean)} callback
   */
  Account.prototype.block = function(userId, callback) {
    let success;
    // TODO
    callback(null, userId, success);
  };
};
