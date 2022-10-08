#!/usr/bin/env node
const npmCiLogin = require('./npmCiLogin');
const {registry, username, password} = npmCiLogin.init();
npmCiLogin(username, password, registry);
