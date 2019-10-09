const url = require('url')

/**
 * @description
 * Statistics plugin is a plugin that help you monitoring your requests
 * by printing a very informative log about each request
 */
class Statistics {
  constructor() {
    this.statisticsRequestsMap = {}
  }

  _onRequestSuccess(config) {
    this._create(config)
    return config
  }

  _onResponseSuccess(response) {
    const key = response.config.url
    this._update(response)
    this._printByKey(key)
    this._delete(key)
    return response
  }

  _onResponseFailed(error) {
    const key = error.config.url
    this._update(error)
    this._printByKey(key)
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
    this.statisticsRequestsMap[config.url] = {
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
    const currentTime = Date.now()
    const basicObject = this.statisticsRequestsMap[config.url]
    const updateLogQuery = {
      endTime: currentTime,
      totalTime: `${currentTime - basicObject.startTime}ms`,
      responseData: data,
      isCompletedWithoutError: config.validateStatus(status),
    }
    this.statisticsRequestsMap[config.url] = {
      ...basicObject,
      ...updateLogQuery,
    }
  }

  /**
   * @description
   * print the informative object with console group
   * to add better human readable format
   * @param key
   * @private
   */
  _printByKey(key) {
    /* eslint-disable no-console */
    console.group(key)
    console.log(this.statisticsRequestsMap[key])
    console.groupEnd(key)
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
