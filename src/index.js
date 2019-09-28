const pending = require('./modules/pendingModule')
const cancel = require('./modules/cancelModule')
const logger = require('./services/logger')

const basicModules = {
  pending,
  cancel,
}

function Ambience() {
  return this
}


Ambience.prototype.use = (axios, config = {}) => {
  this._axios = axios
  if (config && typeof config === 'object') {
    Object.keys(config).forEach((key) => {
      if (basicModules[key]) {
        logger.log(` ${key} Middleware was sign`)
        basicModules[key].applyMiddleware(axios)
      }
    })
  }
}

Ambience.prototype.pending = pending
Ambience.prototype.cancel = cancel


module.exports = new Ambience()
