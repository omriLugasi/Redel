const { ALLOW_LOG } = require('./../../config')

const defaultConsole = Object.keys(console).reduce((acc, key) => {
  acc[key] = () => {}
  return acc
}, {})

module.exports =  ALLOW_LOG ? console : defaultConsole
