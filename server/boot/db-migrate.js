'use strict';

const app = require('../server');

module.exports = function(app, callback) {
  /*
   * The `app` object provides access to a variety of LoopBack resources such as
   * models (e.g. `app.models.YourModelName`) or data sources (e.g.
   * `app.datasources.YourDataSource`). See
   * http://docs.strongloop.com/display/public/LB/Working+with+LoopBack+objects
   * for more info.
   */
  const mariaDs = app.dataSources.mariaDs;

  mariaDs.autoupdate('AccountDouble', (err) => {
    if (err) throw err;
  });

  mariaDs.autoupdate('PostDouble', (err) => {
    if (err) throw err;

    const sqlQuery = `
    ALTER TABLE PostDouble
    MODIFY COLUMN creatorId VARCHAR(255),
    MODIFY COLUMN privacy VARCHAR(255),
    MODIFY COLUMN status VARCHAR(255);
    `;

    mariaDs.connector.execute(sqlQuery, null, (err) => {
      if (err) console.error(err);
    });
  });

  mariaDs.autoupdate('Collaboration', (err) => {
    if (err) throw err;

    const sqlQuery = `
    ALTER TABLE Collaboration
    MODIFY COLUMN collaboratorId VARCHAR(255),
    MODIFY COLUMN postId VARCHAR(255),
    MODIFY COLUMN status VARCHAR(255),
    ADD CONSTRAINT collaborationPair UNIQUE (collaboratorId, postId);
    `;

    mariaDs.connector.execute(sqlQuery, null, (err) => {
      if (err) console.error(err);
    });
  });

  mariaDs.autoupdate('Relationship', (err) => {
    if (err) throw err;

    const sqlQuery = `
    ALTER TABLE Relationship
    MODIFY COLUMN status VARCHAR(255),
    MODIFY COLUMN subjectUserId VARCHAR(255),
    MODIFY COLUMN objectUserId VARCHAR(255),
    ADD CONSTRAINT relationshipPair UNIQUE (subjectUserId, objectUserId);
    `;

    mariaDs.connector.execute(sqlQuery, null, (err) => {
      if (err) console.error(err);
    });
  });

  mariaDs.autoupdate('LikePost', (err) => {
    if (err) throw err;

    const sqlQuery = `
    ALTER TABLE LikePost
    MODIFY COLUMN likerId VARCHAR(255),
    MODIFY COLUMN postId VARCHAR(255),
    ADD CONSTRAINT likePostPair UNIQUE (likerId, postId);
    `;

    mariaDs.connector.execute(sqlQuery, null, (err) => {
      if (err) console.error(err);
    });
  });

  process.nextTick(callback); // Remove if you pass `callback` to an async function yourself
};
