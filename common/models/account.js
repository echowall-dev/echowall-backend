'use strict';

const app = require('../../server/server');
// let appPros = require('../app-properties');
// let accountDomain = appPros.hostDomain + '/account';

module.exports = function(Account) {
  Account.validatesUniquenessOf('username');

  // Create or update AccountDouble instance after an account is created
  Account.observe('after save', (context, next) => {
    app.models.AccountDouble.upsertWithWhere({
      accountId: context.instance.id
    }, {
      accountId: context.instance.id,
      createdAt: context.instance.createdAt,
      updatedAt: context.instance.updatedAt
    }, (err, model) => {
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
  Account.beforeRemote('**', (context, unused, next) => {
    // console.log(context.req.params);
    // console.log(context.req.body);

    if (context.req.params) {
      if (context.req.params.id === context.req.params.fk) {
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
   * @param {Function(Error, array)} callback
   */
  Account.prototype.postFetch = function(amount, lastFetchTime, callback) {
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
    	AND (P.privacy = "friend" AND R.status = "friend"
    	OR P.privacy = "public" AND R.status != "block")
    	AND P.createdAt < "${lastFetchTime}"
    	AND P.status = "active"
    	LIMIT ${amount}
    )) AS PD
    ORDER BY createdAt DESC
    LIMIT ${amount};
    `;

    const mariaDs = app.dataSources.mariaDs;
    mariaDs.connector.execute(sqlQuery, null, (err, postDoubleList) => {
      if (err) console.error(err);

      let postIdList = postDoubleList.map(
        postDouble => postDouble.postId
      );

      app.models.Post.find({
        where: {
          id: {inq: postIdList}
        },
        order: 'createdAt DESC',
        include: ['creator', 'collaborators']
      }, (err, postList) => {
        if (err) console.error(err);
        callback(null, postList);
      });
    });
  };
};
