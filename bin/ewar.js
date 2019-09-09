#!/usr/bin/env node
/*
 * @Date: 2019-07-18 09:41:57
 * @Author: mkyo <ejbscm@hotmail.com>
 * @Description: If you have some questions, please contact: ejbscm@hotmail.com.
 */
const resolveCwd = require('resolve-cwd');

const localCLI = resolveCwd.silent('ewar/bin/ewar');
if (localCLI && localCLI !== __filename) {
  const debug = require('debug')('ewar');
  debug('Using local install of ewar');
  require(localCLI);
} else {
  require('../cli');
}
