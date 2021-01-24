const dotenv = require('dotenv');
const path = require('path');

const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV.trim() : 'local';

// console.log(`node_env ${NODE_ENV}`);

let envPath;
switch (NODE_ENV.trim()) {
case 'local':
  envPath = path.resolve(__dirname, `./.env.local`);
  break;

case 'staging.local':
  envPath = path.resolve(__dirname, `./.env.staging.local`);
  break;

case 'production.local':
  envPath = path.resolve(__dirname, `./.env.production.local`);
  break;
default:
  break;
}

dotenv.config({
  path: envPath
});

const environment = {
  NODE_ENV,
  SERVER_PORT: process.env.PORT || 8080,
  /* DATABASE */
  DATABASE_CLIENT: process.env.DATABASE_CLIENT,
  DATABASE_HOST: process.env.DATABASE_HOST,
  DATABASE_PORT: process.env.DATABASE_PORT,
  DATABASE_USER: process.env.DATABASE_USER,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_NAME: process.env.DATABASE_NAME,
  /* BASIC ACL */
  BASIC_ACL_BASE_URL: process.env.BASIC_ACL_BASE_URL,
  BASIC_ACL_COMPANY_UUID: process.env.BASIC_ACL_COMPANY_UUID,
  BASIC_ACL_USER_ROLE_CODE: process.env.BASIC_ACL_USER_ROLE_CODE,
  BASIC_ACL_ADMIN_EMAIL: process.env.BASIC_ACL_ADMIN_EMAIL,
  BASIC_ACL_ADMIN_PASSWORD: process.env.BASIC_ACL_ADMIN_PASSWORD,
  BASIC_ACL_PROJECT_CODE: process.env.BASIC_ACL_PROJECT_CODE,
  /* SMT */
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PW: process.env.SMTP_PW,
  /* GENERAL */
  FROM_EMAIL: process.env.FROM_EMAIL,
  /* TWILIO */
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  /* FRONT */
  FRONT_BASE_URL: process.env.FRONT_BASE_URL
};

module.exports = environment;
