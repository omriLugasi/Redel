const { env } = require('process')

/**
 * @description
 * Will return boolean if the environment variable is equal to true
 * @param isEnvVariableTrue
 * @returns {boolean}
 */
const isStringEqualToTrue = isEnvVariableTrue => isEnvVariableTrue === 'true'

/**
 * @description
 * Hold the general configuration of the library
 */
const general = Object.freeze({
  ALLOW_LOG: isStringEqualToTrue(env.ALLOW_LOG || 'false'),
  GITHUB_REPO: 'https://github.com/omriLugasi/Redel',
})

module.exports = {
  ...general,
}
