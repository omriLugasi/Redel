const { ALLOW_LOG } = require('./../../config')

const fakeConsole = Object.keys(console).reduce((acc, key) => {
  acc[key] = () => {}
  return acc
}, {})

module.exports = ALLOW_LOG ? console : fakeConsole
