const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(10).required(),
  full_name: Joi.string().min(10).max(100).required(),
  user_id: Joi.number().required()
});

const getUserContact = Joi.object({
  user_id: Joi.number().required()
});

const updateSchema = Joi.object({
  email: Joi.string().email().optional(),
  phone: Joi.string().min(10).max(10).optional(),
  full_name: Joi.string().min(10).max(100).optional()
});

module.exports = {
  registerSchema,
  getUserContact,
  updateSchema
};
