const url = require('url')

class Statistics {
  constructor() {
    this._inner_set = {}
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

  _create(config) {
    this._inner_set[config.url] = {
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
    delete this._inner_set[key]
  }

  _update({ config, data, status }) {
    const currentTime = Date.now()
    const basicObject = this._inner_set[config.url]
    const updateLogQuery = {
      endTime: currentTime,
      totalTime: `${currentTime - basicObject.startTime}ms`,
      responseData: data,
      isCompletedWithoutError: config.validateStatus(status),
    }
    this._inner_set[config.url] = {
      ...basicObject,
      ...updateLogQuery,
    }
  }

  _printByKey(key) {
    /* eslint-disable no-console */
    console.group(key)
    console.log(this._inner_set[key])
    console.groupEnd(key)
    /* eslint-disable no-console */
  }


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


  /* EXPOSE FUNCTIONS */

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
