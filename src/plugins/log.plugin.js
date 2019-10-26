const url = require('url')
const qs = require('qs')
const { generateUniqueRequestKey, logUniqueRequestKey, ensureGetConfig } = require('./../utils')
/**
 * @description
 * Log plugin is a plugin that help you monitoring your requests
 * by printing a very informative log about each request
 */
class Log {
  constructor() {
    this.logRequestsMap = {}
    this.interceptorsRef = {}
  }

  _obtainKey(config) {
    if (!config[logUniqueRequestKey]) {
      Object.assign(config, { [logUniqueRequestKey]: generateUniqueRequestKey() })
    }
    return config[logUniqueRequestKey]
  }

  _isRequestsMapContain(key) {
    return typeof this.logRequestsMap[key] !== 'undefined'
  }

  _onRequestSuccess(config) {
    this._create(config)
    return config
  }

  _onResponseSuccess(response) {
    const key = this._obtainKey(response.config)
    this._update(response)
    this._printByKey(key, response.config.url)
    this._delete(key)
    return response
  }

  _onResponseFailed(error) {
    const config = ensureGetConfig(error)
    const key = this._obtainKey(config)
    // Those rows related to the cancel plugin, the issue is that
    // we cancel request before it sign to the log plugin
    // and because of that we cant find any reference to the desire object
    const isRequestNotSignBeforeCanceled = config.isCanceled && !this._isRequestsMapContain(key)
    if (isRequestNotSignBeforeCanceled) {
      return Promise.reject(error)
    }
    this._update({ ...error, config })
    this._printByKey(key, config.url)
    this._delete(key)
    return Promise.reject(error)
  }

  /**
   * @description
   * Create the log object in the request build process
   * @param config
   * @private
   */
  _create(config) {
    const key = this._obtainKey(config)
    this.logRequestsMap[key] = {
      url: config.url,
      method: config.method,
      startTime: Date.now(),
      endTime: null,
      totalTime: null,
      timeout: config.timeout,
      proxy: config.proxy,
      maxContentLength: config.maxContentLength,
      requestHeaders: config.headers,
      requestData: this._extractDataFromRequest(config),
      responseData: null,
      isCompletedWithoutError: null,
    }
  }

  _delete(key) {
    delete this.logRequestsMap[key]
  }

  /**
   * @description
   * Update the object that we create sooner (from the _create function),
   * with the data from the response.
   * @param config object
   * @private
   */
  _update({ config, data, status }) {
    const key = this._obtainKey(config)
    const currentTime = Date.now()
    const basicObject = this.logRequestsMap[key]
    const updateLogQuery = {
      endTime: currentTime,
      totalTime: `${currentTime - basicObject.startTime}ms`,
      responseData: data,
      isCompletedWithoutError: config.validateStatus(status),
    }
    this.logRequestsMap[key] = {
      ...basicObject,
      ...updateLogQuery,
    }
  }

  /**
   * @description
   * print the informative object with console group
   * to add better human readable format
   * @param key uuid4
   * @param key request url
   * @private
   */
  _printByKey(key, urlPath) {
    /* eslint-disable no-console */
    console.group(urlPath)
    console.log(this.logRequestsMap[key])
    console.groupEnd()
    /* eslint-disable no-console */
  }


  /**
   * @description
   * build an object that include all the request data that send to the server
   * @param config
   * @returns {{query: {}, data: {}, params: {}}}
   * @private
   */
  _extractDataFromRequest(config) {
    const urlObject = url.parse(config.url)
    const query = urlObject.query ? qs.parse(urlObject.query) : {}
    return {
      query,
      data: config.data || {},
      params: config.params || {},
    }
  }


  /* EXPOSE */

  /**
   * @description
   * This function is a must function in each plugin.
   * The function should sign the plugin into the
   * axios interceptors request and response
   * @param axios
   */
  applyPlugin(axios) {
    this.interceptorsRef.request = axios.interceptors.request.use(
      this._onRequestSuccess.bind(this),
    )
    this.interceptorsRef.response = axios.interceptors.response.use(
      this._onResponseSuccess.bind(this),
      this._onResponseFailed.bind(this),
    )
  }

  /**
   * @description
   * eject the current axios interceptor from the axios instance
   * @param axios
   */
  eject(axios) {
    axios.interceptors.request.eject(this.interceptorsRef.request)
    axios.interceptors.response.eject(this.interceptorsRef.response)
  }
}


module.exports = new Log()
