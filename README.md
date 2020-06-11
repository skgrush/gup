# GUP

> Authenticated S3 file manager.

GUP is a file manager for hosting on AWS (Amazon Web Services).
Made for deployment on, and management of, Amazon S3 (Simple Storage Service)
and authenticated through Amazon Cognito.

This is my experimental project into Angular and AWS.

## Getting Started

### Prerequisites

The project itself only depends on node|yarn or any other JavaScript package
manager that may come along.

But this project is built for AWS, so you'll need
an account and some infrastructure configured that I still don't 100%
have conceptualized either... I've left all my findings summed up in
[AWS Configuration and lessons](#aws-configuration-and-lessons) below.
By the time I got around to this project I already had S3 set up, so that
stage is presumed but should eventually be added here.

### Environment variables

You'll need to define the file [`env.json`](env.json) to set your specific variable values.
You **must** provide all "<required:\*>" fields.

```json
{
  "awsRoleArn": "<optional>",
  "awsIdentityRegion": "<required>",
  "awsIdentityGuid": "<required>",
  "awsUserPoolSuffix": "<required>",
  "awsUserPool": "<optional>",
  "awsS3EndpointARN": "<required>",
  "awsS3Prefix": "<optional>",
  "oauth": {
    "provider": "cognito",
    "endpoint": "<required>",
    "clientId": "<required>",
    "redirectUri": "<optional>"
  },
  "publicRoot": "<optional>",
  "siteName": "<required>"
}
```

This interface to match against is [`src/app/services/env-config/env-config.interface.ts`](src/app/services/env-config/env-config.interface.ts).

### Angular Stuff

#### Development server

Run `npm run http-server` to start the HTTP server and `npm run build:watch` to start a live build process. Navigate to `http://localhost:8080/`.

#### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

#### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

#### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

#### Running end-to-end tests

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

## Author

- **Samuel K. Grush**
