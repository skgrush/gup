import { CognitoJwt } from './cognito-jwt';

describe('CognitoJwt', () => {
  it('should create an instance', () => {
    expect(new CognitoJwt()).toBeTruthy();
  });
});
