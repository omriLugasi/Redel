const pending = require('./plugins/pendingModule')
const cancel = require('./plugins/cancelModule')
const statistics = require('./plugins/statisticsModule')
const logger = require('./services/logger')

const basicModules = {
  pending,
  cancel,
  statistics,
}

function Redel() {
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
    throw new Error('Redel: try to initialize the "use" function with wrong config type')
  }
}

function getSignedMiddleware() {
  return [...this.signedModules]
}


Redel.prototype.use = use
Redel.prototype.getSignedMiddleware = getSignedMiddleware

Redel.prototype.pending = pending
Redel.prototype.cancel = cancel
Redel.prototype.statistics = statistics


module.exports = new Redel()
