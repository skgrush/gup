# Grushup

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.1.

## Environment variables

You'll need to define the file [`env.json`](env.json) to set your specific variable values.
You **must** provide all "<required:\*>" fields.

```json
{
  "awsRoleArn": "<required>",
  "awsIdentityRegion": "<required>",
  "awsIdentityGuid": "<required>",
  "awsIdentityPool": "<required>",
  "awsUserPoolSuffix": "<required>",
  "awsUserPool": "<required>",
  "awsS3EndpointARN": "<required>",
  "awsS3Prefix": "<required|\"\">",
  "oauth": {
    "provider": "cognito|google",
    "endpoint": "<required|optional>",
    "clientId": "<required>",
    "redirectUri": "<required>"
  },
  "GOOGLE_HD": "<optional>"
}
```

This interface to match against is [`src/app/services/env-config/env-config.interface.ts`](src/app/services/env-config/env-config.interface.ts).

**Google OAuth is not currently supported, but can be used through Cognito.**

## Development server

Run `npm start` for a ~~dev server~~ HTTP server. Navigate to `http://localhost:8080/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
