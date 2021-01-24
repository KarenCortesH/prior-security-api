const Joi = require('joi');

const createSchema = Joi.object({
  user_id: Joi.number().required(),
  longitude: Joi.number().required(),
  latitude: Joi.number().required()
});

module.exports = {
  createSchema
};
