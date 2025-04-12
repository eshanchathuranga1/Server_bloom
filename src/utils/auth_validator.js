const Joi = require("joi");

module.exports = {
  authSchema: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    ip: Joi.string().required(),
    location: Joi.object({
      country: Joi.string().required(),
      city: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required()
    }).required(),
    id: Joi.string().required(),
  }),
  refreshTokenSchema:
    Joi.object({
      refreshToken: Joi.string().required(),
      id: Joi.string().required(),
    }),
  logoutSchema: Joi.object({
    id: Joi.string().required(),
  }),
};