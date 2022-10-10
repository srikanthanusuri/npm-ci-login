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

  const fetchToken = async (registry, data) => {
    const registryUrl = new URL(`${registry}/-/user/org.couchdb.user:${data.username}`)
    const axios = require('axios');
    const response = await axios.put(registryUrl, data, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    console.log('Response from registry', registry);
    console.log('statusCode:', response.status);
    const key = registry.trim().substring(registryUrl.protocol.length) + '/:_authToken';
    const token = response.data.token;
    return {key, token};
  };

  const setToken = async (key, token) => {
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
  };
  
  const login = async (username, password, registry = 'https://registry.npmjs.org') => {
    validate(username, password);
    
    const data = { name: username, password };
    const {key, token} = await fetchToken(registry, data);

    await setToken(key, token);
  };
  
  module.exports = login;
  module.exports.init = init;