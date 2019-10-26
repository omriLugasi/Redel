const pending = require('./plugins/pending.plugin')
const cancel = require('./plugins/cancel.plugin')
const log = require('./plugins/log.plugin')
const logger = require('./services/logger')
const { GITHUB_REPO } = require('./config')

/**
 * The Only Authorized plugins for this version.
 * In the future we want to let developers to create plugin
 * and use our API to create custom plugins
 */

const PluginsNamesEnum = Object.freeze({
  PENDING: 'pending',
  CANCEL: 'cancel',
  LOG: 'log',
})

const AuthorizedPlugins = {
  [PluginsNamesEnum.PENDING]: pending,
  [PluginsNamesEnum.CANCEL]: cancel,
  [PluginsNamesEnum.LOG]: log,
}

function Redel() {
  this.signedPlugins = []
  return this
}


/**
 * @description
 * The best option for right now to check if param is a axios instance
 * The check is if axios exist AND is interceptors exist on the object
 * this double check provide us to check if it's axios instance or axios.create
 * @param axios
 * @returns {*|boolean}
 */
function isAxiosInstance(axios) {
  return axios && typeof axios.interceptors === 'object'
}

/**
 * @description
 * "use" will search for desire and authorized plugins to invoke there "init" function,
 * this function called "applyPlugin".
 * Please notice that plugin key must be follow by *true* value
 * @param axios - the axios instance ( also work with axios.create())
 * @param config -
 * should be an object that contain the names of the desire plugins as key and
 * true as value for example { pending: true }
 */
function use(axios, config) {
  if (!isAxiosInstance(axios)) {
    throw new Error('Redel must init with an axios instance!')
  }
  if (this._axios) {
    // if developer try to call `use` twice or more
    // we should eject all plugins before init the Redel instance again,
    // this will ensure that we avoid memory leak or mismatch
    ejectAll.call(this)
  }
  this._axios = axios
  if (config && typeof config === 'object' && !Array.isArray(config)) {
    Object.keys(config).forEach((key) => {
      if (AuthorizedPlugins[key]) {
        logger.log(` ${key} Plugin was sign`)
        _addPlugin.call(this, key)
      }
    })
  } else {
    throw new Error('Redel: try to initialize the "use" function with wrong config type')
  }
}

/**
 * @description
 * Return Array of singed plugins name
 * @returns ["plugin-name"]
 */
function getSignedPlugins() {
  return [...this.signedPlugins]
}


/**
 * @description
 * Let the user the option to delete all the Redel plugins
 * from the axios instance (reset the Redel plugins)
 */
function ejectAll() {
  this.signedPlugins.forEach(key => {
    AuthorizedPlugins[key].eject(this._axios)
  })
  this.signedPlugins = []
}


/**
 * @description
 * eject plugin by key, current keys displayed on the "AuthorizedPlugins" object
 * @param key
 */
function eject(key) {
  if (!AuthorizedPlugins[key]) {
    // eslint-disable-next-line no-console
    console.error(`You are trying to eject plugin that not exist [${key}],
     currently available plugins are [${Object.keys(AuthorizedPlugins).toString()}]`)
    return
  }
  if (!this.signedPlugins.includes(key)) {
    // eslint-disable-next-line no-console
    console.error(`You are trying to eject plugin that not signed to the 
    Redel instance [${key}], currently singed plugins are [${this.signedPlugins.toString()}]`)
    return
  }
  AuthorizedPlugins[key].eject(this._axios)
  this.signedPlugins = this.signedPlugins.filter(pluginName => pluginName !== key)
}

/**
 * @description
 * add plugin at run time,
 * before assignment the function check if the plugin authorized by the library,
 * and if the plugin not already signed before, if both of the conditions true
 * Redel will singed the plugin.
 * @param key
 */
function add(key) {
  if (!AuthorizedPlugins[key]) {
    // eslint-disable-next-line no-console
    console.error(`You are trying to add plugin that not exist [${key}],
     currently available plugins are [${Object.keys(AuthorizedPlugins).toString()}]`)
    return
  }
  if (this.signedPlugins.includes(key)) {
    // eslint-disable-next-line no-console
    console.error(`You are trying to add plugin that already signed to the 
    Redel instance [${key}], currently singed plugins are [${this.signedPlugins.toString()}]`)
    return
  }
  _addPlugin.call(this, key)
}

/**
 * @description
 * List of functions that can be invoke from the main Redel Object
 * @param use - for init the library
 * @param add - add plugin
 * @param ejectAll - eject all plugins
 * @param eject - eject plugin
 * @param getSignedPlugins - to get the singed plugins as strings array
 */
Redel.prototype.use = use
Redel.prototype.add = add
Redel.prototype.getSignedPlugins = getSignedPlugins
Redel.prototype.ejectAll = ejectAll
Redel.prototype.eject = eject


/**
 * @description
 * expose functions from pending plugin
 */
Redel.prototype.getPendingRequests = function getPendingRequests() {
  _validatePlugin.call(this, PluginsNamesEnum.PENDING, pending.getPendingRequests.name)
  return pending.getPendingRequests()
}
Redel.prototype.clearPendingRequests = function clearPendingRequests() {
  _validatePlugin.call(this, PluginsNamesEnum.PENDING, 'clearPendingRequests')
  return pending.clear()
}

/**
 * @description
 * expose functions from cancel plugin
 */
Redel.prototype.cancelGroupRequests = function cancelGroupRequests(customCancelGroupKey) {
  _validatePlugin.call(this, PluginsNamesEnum.CANCEL, cancel.cancelGroupRequests.name)
  return cancel.cancelGroupRequests(customCancelGroupKey)
}
Redel.prototype.getCancelGroupHeader = function getCancelGroupHeader(customCancelGroupKey) {
  _validatePlugin.call(this, PluginsNamesEnum.CANCEL, cancel.getCancelGroupHeader.name)
  return cancel.getCancelGroupHeader(customCancelGroupKey)
}

/**
 * @description
 * add plugin into the singedPlugins array and init the plugins with the axios instance
 * @param key
 * @private HELPER
 */

function _addPlugin(key) {
  AuthorizedPlugins[key].applyPlugin(this._axios)
  this.signedPlugins.push(key)
}

/**
 * @description
 * Validate that plugin with this "pluginName" initialize before
 * letting the developer work with the plugin functionality
 * @param pluginName - the desire plugin name
 * @param fnName - the function that user try to invoke
 * @private
 */
function _validatePlugin(pluginName, fnName) {
  if (!this.signedPlugins.includes(pluginName)) {
    throw new Error(
      `${pluginName} plugin not initialized while you trying to call "${fnName}",
      try to pass the "${pluginName}" property into the Redel config to init the plugin,
      for more information please visit our docs at ${GITHUB_REPO}`,
    )
  }
}

module.exports = new Redel()
