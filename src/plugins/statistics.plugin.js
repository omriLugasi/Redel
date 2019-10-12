const url = require('url')
const { generateUniqueRequestKey, statisticsUniqueRequestKey } = require('./../utils')
/**
 * @description
 * Statistics plugin is a plugin that help you monitoring your requests
 * by printing a very informative log about each request
 */
class Statistics {
  constructor() {
    this.statisticsRequestsMap = {}
  }

  _generateKey(config) {
    if (!config[statisticsUniqueRequestKey]) {
      Object.assign(config, { [statisticsUniqueRequestKey]: generateUniqueRequestKey() })
    }
    return config[statisticsUniqueRequestKey]
  }

  _onRequestSuccess(config) {
    this._create(config)
    return config
  }

  _onResponseSuccess(response) {
    const key = this._generateKey(response.config)
    this._update(response)
    this._printByKey(key, response.config.url)
    this._delete(key)
    return response
  }

  _onResponseFailed(error) {
    const key = this._generateKey(error.config)
    this._update(error)
    this._printByKey(key, error.config.url)
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
    const key = this._generateKey(config)
    this.statisticsRequestsMap[key] = {
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
    delete this.statisticsRequestsMap[key]
  }

  /**
   * @description
   * Update the object that we create sooner (from the _create function),
   * with the data from the response.
   * @param config object
   * @private
   */
  _update({ config, data, status }) {
    const key = this._generateKey(config)
    const currentTime = Date.now()
    const basicObject = this.statisticsRequestsMap[key]
    const updateLogQuery = {
      endTime: currentTime,
      totalTime: `${currentTime - basicObject.startTime}ms`,
      responseData: data,
      isCompletedWithoutError: config.validateStatus(status),
    }
    this.statisticsRequestsMap[key] = {
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
    console.log(this.statisticsRequestsMap[key])
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
    const query = {}
    if (urlObject.query) {
      urlObject.query.split('&').forEach(queryParam => {
        const [key, value] = queryParam.split('=')
        query[key] = value
      })
    }

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
  applyMiddleware(axios) {
    axios.interceptors.request.use(
      this._onRequestSuccess.bind(this),
    )
    axios.interceptors.response.use(
      this._onResponseSuccess.bind(this),
      this._onResponseFailed.bind(this),
    )
  }
}


module.exports = new Statistics()
