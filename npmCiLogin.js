const init = () => {
    const registry = process.env.NPM_REGISTRY;
    const username = process.env.NPM_USERNAME;
    const password = process.env.NPM_PASSWORD;
    return { registry, username, password };
  }
  
  const validate = (username, password) => {
    if(!username || !password) {
      console.error('------------------------------------------------------------------------------------------------------------');
      console.error('Please specify all the following environment variables');
      console.error('NPM_USERNAME - The username used to login to the repository.');
      console.error('NPM_PASSWORD - The password used to login to the repository.');
      console.error('------------------------------------------------------------------------------------------------------------');
      console.error('If you are programmatically calling the npmCiLogin module, use as follows.');
      console.error('const npmCiLogin = require("@srikanthanusuri/npm-ci-login");');
      console.error('npmCiLogin("username", "password", "https://your-registry");');
      console.error('------------------------------------------------------------------------------------------------------------');
      throw new Error('Missing environment variables.');
    }
  }
  
  const login = (username, password, registry = 'https://registry.npmjs.org') => {
    validate(username, password);
    const https = require('https');
    const registryUrl = new URL(`${registry}/-/user/org.couchdb.user:${username}`)
    const data = { name: username, password };
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
      if(res.statusCode > 299 || res.statusCode < 200) {
        res.on('data', (d) => {
            const body = JSON.parse(d.toString());
            console.error('Error:', body.error || body.message || body);
            throw new Error(`Could not fetch token from the registry [${registry}]`);
        })
      }
    
      res.on('data', (d) => {
        const { token } = JSON.parse(d.toString());
        const key = registry.trim().substring(registryUrl.protocol.length) + '/:_authToken';
    
        const { spawn } = require('child_process');
        const npmLogin = spawn('npm', ['config', '--global', 'set', `${key}=${token}`]);
        let consoleOutput = '';
        npmLogin.stderr.on('data', (data) => {
          consoleOutput += data.toString("utf-8");
        });
        npmLogin.on('close', () => {
          if(/ERR!/.test(consoleOutput)) {
            console.error(`User ${username} could not login to npm registry ${registry}`);
            console.error(consoleOutput)
            throw new Error(`User ${username} could not login to npm registry ${registry}`)
          } else {
            console.info(`User ${username} successfully logged into the npm registry ${registry}`);
          }
        });
      });
    });
    
    req.on('error', (e) => {
      console.error(`Could not retrieve the token from the registry ${registry}`, e);
    });
    
    req.write(JSON.stringify(data));
    req.end();
  };
  
  module.exports = login;
  module.exports.init = init;