const { env } = require('process')

const isStringEqualToTrue = isEnvVariableTrue => isEnvVariableTrue === 'true'

const general = Object.freeze({
  ALLOW_LOG: isStringEqualToTrue(env.ALLOW_LOG || 'true'),
})

module.exports = {
  ...general,

}
