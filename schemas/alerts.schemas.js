const Joi = require('joi');

const createSchema = Joi.object({
  user_id: Joi.number().required()
});

module.exports = {
  createSchema
};
