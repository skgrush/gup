export interface IEnv {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_REDIRECT_URI: string;
  AWS_ROLE_ARN: string;
  GOOGLE_HD?: string;
}

const env: IEnv = require('../../env.json');
const { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI, AWS_ROLE_ARN, GOOGLE_HD } = env;
export { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI, AWS_ROLE_ARN, GOOGLE_HD };
