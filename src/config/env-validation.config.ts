import * as Joi from 'joi';

export const envValidationObjectSchema = Joi.object({
  //APP
  PORT: Joi.number().required(),
  APP_DOMAIN: Joi.string().required(),
  APP_REFRESH_PATH: Joi.string().required(),
  //DATABASE
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_NAME: Joi.string().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  //ACCESS TOKEN
  JWT_SECRET_ACCESS_TOKEN: Joi.string().required(),
  JWT_EXPIRATION_TIME_ACCESS_TOKEN: Joi.string().required(),
  //REFRESH TOKEN
  JWT_SECRET_REFRESH_TOKEN: Joi.string().required(),
  JWT_EXPIRATION_TIME_REFRESH_TOKEN: Joi.string().required(),
});
