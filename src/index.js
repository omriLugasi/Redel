const pending = require('./modules/pendingModule')
const cancel = require('./modules/cancelModule')
const statistics = require('./modules/statisticsModule')
const logger = require('./services/logger')

const basicModules = {
  pending,
  cancel,
  statistics
}

function Ambience() {
  this.signedModules = []
  return this
}

function use(axios, config) {
  this._axios = axios
  if (config && typeof config === 'object' && !Array.isArray(config)) {
    Object.keys(config).forEach((key) => {
      if (basicModules[key]) {
        logger.log(` ${key} Middleware was sign`)
        basicModules[key].applyMiddleware(axios)
        this.signedModules.push(key)
      }
    })
  } else {
    throw new Error('Ambiance: try to initialize the "use" function with wrong config type')
  }
}

function getSignedMiddleware() {
  return [...this.signedModules]
}


Ambience.prototype.use = use
Ambience.prototype.getSignedMiddleware = getSignedMiddleware

Ambience.prototype.pending = pending
Ambience.prototype.cancel = cancel
Ambience.prototype.statistics = statistics


module.exports = new Ambience()
