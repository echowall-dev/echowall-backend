'use strict';

module.exports = function(Relationship) {
  /**
   * To let a user follow another user
   * @param {string} subjectUserId The ID of subject user
   * @param {string} objectUserId The ID of object user
   * @param {Function(Error, boolean)} callback
   */
  Relationship.follow = function(subjectUserId, objectUserId, callback) {
    let success;
    // TODO
    callback(null, success);
  };

  /**
   * To let a user unfollow another user
   * @param {string} subjectUserId The ID of subject user
   * @param {string} objectUserId The ID of object user
   * @param {Function(Error, boolean)} callback
   */
  Relationship.unfollow = function(subjectUserId, objectUserId, callback) {
    let success;
    // TODO
    callback(null, success);
  };

  /**
   * To let a user block another user
   * @param {string} subjectUserId The ID of subject user
   * @param {string} objectUserId The ID of object user
   * @param {Function(Error, boolean)} callback
   */
  Relationship.block = function(subjectUserId, objectUserId, callback) {
    let success;
    // TODO
    callback(null, success);
  };

  /**
   * To let a user unblock another user
   * @param {string} subjectUserId The ID of subject user
   * @param {string} objectUserId The ID of object user
   * @param {Function(Error, boolean)} callback
   */
  Relationship.unblock = function(subjectUserId, objectUserId, callback) {
    let success;
    // TODO
    callback(null, success);
  };
};
