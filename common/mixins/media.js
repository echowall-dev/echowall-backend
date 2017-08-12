module.exports = function(Model, options) {
  // Model is the model class
  // options is an object containing the config properties from model definition
  Model.defineProperty('name', {type: String, required: true});
  Model.defineProperty('storage', {type: String});
  Model.defineProperty('format', {type: String});
  Model.defineProperty('url', {type: String});
};
