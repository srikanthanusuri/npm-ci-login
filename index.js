#!/usr/bin/env node
const registry = process.env.NPM_REGISTRY;
const name = process.env.NPM_USERNAME;
const password = process.env.NPM_PASSWORD;
if(!registry || !name || !password) {
  console.error('------------------------------------------------------------------------------------------------------------');
  console.error('Please specify all the following environment variables');
  console.error('NPM_REGISTRY - The URL of the registry. Eg: https://registry.npmjs.org');
  console.error('NPM_USERNAME - The username used to login to the repository.');
  console.error('NPM_PASSWORD - The password used to login to the repository.');
  console.error('------------------------------------------------------------------------------------------------------------');
  throw new Error('Missing environment variables.');
}

const https = require('https');
const registryUrl = new URL(`${registry}/-/user/org.couchdb.user:${name}`)
const data = { name, password };
const options = {
  hostname: registryUrl.hostname,
  port: 443,
  path: registryUrl.pathname,
  method: 'PUT',
  headers: {
       'Content-Type': 'application/json',
       'Accept': 'application/json'
     }
};

const req = https.request(options, (res) => {
  console.log('Response from registry', registry);
  console.log('statusCode:', res.statusCode);

  res.on('data', (d) => {
    const { token } = JSON.parse(d.toString());
    const key = registry.trim().substring(registryUrl.protocol.length) + '/:_authToken';

    const { spawn } = require('child_process');
    const npmLogin = spawn('npm', ['config', '--global', 'set', `${key}=${token}`].filter(Boolean));
    let consoleOutput = '';
    npmLogin.stderr.on('data', (data) => {
      consoleOutput += data.toString("utf-8");
    });
    npmLogin.on('close', () => {
      if(/ERR!/.test(consoleOutput)) {
        console.error(`User ${name} could not login to npm registry ${registry}`);
        console.error(consoleOutput)
        process.exit(1);
      } else {
        console.info(`User ${name} successfully logged into the npm registry ${registry}`);
        process.exit(0);
      }
    });
  });
});

req.on('error', (e) => {
  console.error(`Could not retrieve the token from the registry ${registry}`, e);
});

req.write(JSON.stringify(data));
req.end();
