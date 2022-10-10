# npm-ci-login
Inspired from [npm-ci-login](https://github.com/postmanlabs/npm-cli-login)

Allows you to log in to NPM without STDIN, STDOUT. Use in places like CI build systems.

### Installation

    npm install --location=global @srikanthanusuri/npm-cli-login

Use --location=global flag to use npm-cli-login via the CLI

### Usage

##### CLI

`npm-cli-login` expects the following environment variables to be set before you can use it to authenticate:

- `NPM_USERNAME`: NPM username
- `NPM_PASSWORD`: NPM password
- `NPM_REGISTRY`: (optional) Private NPM registry to log in to (Default: https://registry.npmjs.org)

Once the required ones are set, you can just run the following to log in:

    npm-cli-login

You can also export variables and run it all in one line:

    NPM_USERNAME=testUser NPM_PASSWORD=testPass npm-cli-login

##### Module usage
Usage
```javascript
const npmCiLogin = require('@srikanthanusuri/npm-ci-login');
npmCiLogin('username', 'password', 'https://your-registry-url'); // Registry defaults to https://registry.npmjs.org when unspecified
```