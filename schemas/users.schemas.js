const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().min(10).max(10).required(),
  full_name: Joi.string().min(10).max(100).required()
});

const sendForgottenPasswordEmailSchema = Joi.object({
  email: Joi.string().email().required()
});

const changePasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  old_password: Joi.string().required(),
  new_password: Joi.string().required()
});

const meSchema = Joi.object({
  uuid: Joi.string().required()
});

const updateParamsSchema = Joi.object({
  id: Joi.number().required()
});

const updateBodySchema = Joi.object({
  phone: Joi.string().min(10).max(10).optional(),
  full_name: Joi.string().optional()
});

module.exports = {
  registerSchema,
  sendForgottenPasswordEmailSchema,
  changePasswordSchema,
  meSchema,
  updateParamsSchema,
  updateBodySchema
};
