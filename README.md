# Grushup

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.1.

## Environment variables

You'll need to define the file [`env.json`](env.json) to set your specific variable values.
You **must** provide all "<required:\*>" fields.

```json
{
  "awsRoleArn": "<optional>",
  "awsIdentityRegion": "<required>",
  "awsIdentityGuid": "<required>",
  "awsUserPoolSuffix": "<required>",
  "awsUserPool": "<required>",
  "awsS3EndpointARN": "<required>",
  "awsS3Prefix": "<required|\"\">",
  "oauth": {
    "provider": "cognito|google",
    "endpoint": "<required|optional>",
    "clientId": "<required>",
    "redirectUri": "<optional>"
  },
  "GOOGLE_HD": "<optional>"
}
```

This interface to match against is [`src/app/services/env-config/env-config.interface.ts`](src/app/services/env-config/env-config.interface.ts).

**Google OAuth is not currently supported, but can be used through Cognito.**

## Angular Stuff

### Development server

Run `npm start` for a ~~dev server~~ HTTP server. Navigate to `http://localhost:8080/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

---

## AWS Configuration and lessons

### OAuth via Cognito

To provide authentication, we need a set of existing authenticatable users and
an authority that AWS can trust.
I chose to create an OAuth 2.0 provider using my existing Google API Project
using [AWS's knowledge center article on setting up Google as a federated
identity provider in an Amazon Cognito user pool](https://aws.amazon.com/premiumsupport/knowledge-center/cognito-google-social-identity-provider/),
and set the callback URL to `$HOST/gup?path=authed`, where `$HOST` is the domain where this app is hosted.
I then filled the file [`env.json`](./env.json) with the associated data from the User Pools "App integration" section: `oauth.provider` is set to `"cognito"`, `oauth.endpoint` set to the URL like `"$AUTH_DOMAIN/login"` from the "Domain name" page, and `clientId` from yourClientId from "App client settings".
Finally I set `awsUserPoolSuffix` to the last half of the User Pool ID from "General settings".

Next I created a Cognito Identity Pool where the authentication provider is set to Cognito, with the user pool ID (including region!) and client ID from the aforementioned user pool.
Copy the region (the first half) and the "GUID" (the latter half) of the Identity Pool ID into the [`env.json`](./env.json) fields `awsIdentityRegion` and `awsIdentityGuid`.
The associated Authenticated Role will need to be granted the same S3 Actions
discussed in [S3 Actions](#Actions).

### S3

The [`env.json`](./env.json) field `awsS3Prefix` lets you limit the response to file keys with the given prefix.

#### Actions

The following S3 actions are used in this app:

- `"s3:ListBucket"`
  - necessary for enumerating files
- `"s3:GetObject"`
  - necessary for enumerating and retrieving files
- `"s3:PutObject"`
  - optional, necessary for uploading
- `"s3:DeleteObject"`
  - optional, necessary for deleting

#### Endpoint

An S3 bucket access point visible to the Internet is necessary,
with an access point policy that exposes the necessary actions above
to the appropriate resources. My Access Point Policy looks something like this:

```json
{
  "Statement": [
    {
      "Sid": "MyBucketSid",
      "Effect": "Allow",
      "Principal": {
        "AWS": "$AUTHENTICATED_ROLE_ARN"
      },
      "Action": "s3:ListBucket",
      "Resource": "$ACCESS_POINT_ARN",
      "Condition": {
        "StringLike": {
          "s3:prefix": "$PREFIX/*"
        }
      }
    },
    {
      "Sid": "MyResourceSid",
      "Effect": "Allow",
      "Principal": {
        "AWS": "$AUTHENTICATED_ROLE_ARN"
      },
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "$ACCESS_POINT_ARN/object/$PREFIX/*"
    }
  ]
}
```

This exposes the `s3:ListBucket` to authenticated users only on the specified prefix, and `s3:GetObject` and `s3:PutObject` only to objects with the prefix.
It can probably be written better but this works and is explicit.

#### CORS

Since we utilize S3's HTTP endpoints, our browsers _will_ care about CORS settings. My CORS configuration looks something like this (comments added for explanation):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
  <CORSRule>
    <!-- Only for testing, replace with your deployed domain name -->
    <AllowedOrigin>http://localhost:8080</AllowedOrigin>
    <!-- allow request headers -->
    <AllowedHeader>*</AllowedHeader>
    <!-- necessary for retrieving file info -->
    <AllowedMethod>HEAD</AllowedMethod>
    <!-- necessary for enumerating and retrieving files -->
    <AllowedMethod>GET</AllowedMethod>
    <!-- optional, but necessary for uploading -->
    <AllowedMethod>PUT</AllowedMethod>
    <!-- optional, but necessary for deleting -->
    <AllowedMethod>DELETE</AllowedMethod>
    <!-- necessary for detecting redirect files -->
    <ExposeHeader>x-amz-website-redirect-location</ExposeHeader>
    <!-- necessary for seeing the uploader -->
    <ExposeHeader>x-amz-meta-uploader</ExposeHeader>
    <!-- necessary for seeing the ETag -->
    <ExposeHeader>ETag</ExposeHeader>
  </CORSRule>
</CORSConfiguration>
```
