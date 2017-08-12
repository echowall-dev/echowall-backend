'use strict';

module.exports = function(Location) {
  Location.validatesUniquenessOf('name');
};
