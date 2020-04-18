# Grushup

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.1.

## `private` variables

You'll need to define the file [`env.json`](env.json) as follows:

```json
{
  "GOOGLE_CLIENT_ID": "<required>",
  "GOOGLE_REDIRECT_URI": "<required>",
  "AWS_ROLE_ARN": "<required>",
  "GOOGLE_HD": "<optional>"
}
```

Fields valued above as "<optional>" may be omitted and will be undefined in [`env.ts`](src/environments/env.ts).

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
