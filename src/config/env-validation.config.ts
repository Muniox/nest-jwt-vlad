import * as Joi from 'joi';

export const envValidationObjectSchema = Joi.object({
  PORT: Joi.number().required(),
  APP_DOMAIN: Joi.string().required(),

  DATABASE: Joi.string().required(),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),

  REFRESH_TOKEN_SECRET: Joi.string().required(),
  AUTHORIZATION_TOKEN_SECRET: Joi.string().required(),
});
