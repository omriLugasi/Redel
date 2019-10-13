const pending = require('./plugins/pending.plugin')
const cancel = require('./plugins/cancel.plugin')
const statistics = require('./plugins/statistics.plugin')
const logger = require('./services/logger')

/**
 * The Only Authorized plugins for this version.
 * In the future we want to let developers to create middlewares
 * and use our API to create custom plugins
 */
const AuthorizedPlugins = {
  pending,
  cancel,
  statistics,
}

function Redel() {
  this.signedModules = []
  return this
}

/**
 * @description
 * "use" will search for desire and authorized plugins to invoke there "init" function,
 * this function called "applyMiddleware".
 * Please notice that plugin key must be follow by *true* value
 * @param axios - the axios instance ( also work with axios.create())
 * @param config -
 * should be an object that contain the names of the desire plugins as key and
 * true as value for example { pending: true }
 */
function use(axios, config) {
  if (config && typeof config === 'object' && !Array.isArray(config)) {
    Object.keys(config).forEach((key) => {
      if (AuthorizedPlugins[key]) {
        logger.log(` ${key} Middleware was sign`)
        AuthorizedPlugins[key].applyMiddleware(axios)
        this.signedModules.push(key)
      }
    })
  } else {
    throw new Error('Redel: try to initialize the "use" function with wrong config type')
  }
}

/**
 * @description
 * Will return Array of singed plugins name
 * @returns ["plugin-name"]
 */
function getSignedMiddleware() {
  return [...this.signedModules]
}


/**
 * @description
 * List of functions that can be invoke from the main Redel Object
 * @param use - for init the library
 * @param getSignedMiddleware - to get the singed plugins as strings array
 */
Redel.prototype.use = use
Redel.prototype.getSignedMiddleware = getSignedMiddleware


/**
 * @description
 * List of plugins that Redel Authorize to use
 * @param pending - A pending plugin, plugin that give you control on the pending requests
 * @param cancel - A cancel plugin - plugin that give to the cancelToken a super powers,
 * cancel irrelevant request like nobody watch
 * @param statistics - A statistics plugin - print statistics on each request, for example
 * time, requestData, responseData, proxies, and much more ...
 */
Redel.prototype.pending = pending
Redel.prototype.cancel = cancel
Redel.prototype.statistics = statistics


module.exports = new Redel()
