'use strict';

let app = require('../../server/server');
// let appPros = require('../app-properties');
// let accountDomain = appPros.hostDomain + '/account';

module.exports = function(Account) {
  Account.validatesUniquenessOf('username');

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
        next(err);
      }
    }
    next();
  });

  /**
   * Get posts of following users
   * @param {number} amount The amount of posts to get
   * @param {date} lastFetchTime The time of last fetch
   * @param {Function(Error, array)} callback
   */
  Account.prototype.postFollow = function(amount, lastFetchTime, callback) {
    amount = (amount) ? amount : 10;
    lastFetchTime = (lastFetchTime) ? lastFetchTime : new Date().toISOString();

    const sqlQuery = `
    SELECT objectUserId FROM Relationship
    WHERE subjectUserId = "${this.id}";
    `;

    let mysqlDs = app.dataSources.mysqlDs;
    mysqlDs.connector.execute(sqlQuery, null, (err, objectUserList) => {
      if (err) console.error(err);

      let objectUserIdList = objectUserList.map(
        objectUser => objectUser.objectUserId
      );

      let Post = app.models.Post;
      Post.find({
        where: {
          and: [{
            createdAt: {lt: lastFetchTime}
          }, {
            privacy: 'public'
          }, {
            creatorId: {inq: objectUserIdList}
          }]
        },
        order: 'createdAt DESC',
        limit: amount,
        include: ['creator', 'collaborators']
      }, (err, postList) => {
        callback(null, postList);
      });
    });
  };
};
