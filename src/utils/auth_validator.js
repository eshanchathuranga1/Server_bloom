const Joi = require("joi");


module.exports = {
  authSchema: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    ip: Joi.string().required(),
    location: Joi.string().required(),
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
