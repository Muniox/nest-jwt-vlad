import * as Joi from 'joi';

export const envValidationObjectSchema = Joi.object({
  //TODO: better env naming!
  PORT: Joi.number().required(),
  APP_DOMAIN: Joi.string().required(),

  DATABASE: Joi.string().required(),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),

  JWT_SECRET_ACCESS_TOKEN: Joi.string().required(),
  JWT_EXPIRATION_TIME_ACCESS_TOKEN: Joi.string().required(),

  JWT_SECRET_REFRESH_TOKEN: Joi.string().required(),
  JWT_EXPIRATION_TIME_REFRESH_TOKEN: Joi.string().required(),
});
