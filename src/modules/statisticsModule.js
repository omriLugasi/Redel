const url = require('url')
const logger = require('./../services/logger')

class StatisticsModule {

  constructor() {
    this._inner_set = {}
  }

  _onRequestSuccess(config) {
    this._create(config)
    return config
  }

  _onResponseSuccess(response) {
    this._update(response)
    this._printByKey(response.config.url)
    this._delete(response.config.url)
    return response
  }

  _onResponseFailed(error) {
    this._update(error)
    this._printByKey(error.config.url)
    this._delete(error.config.url)
    return Promise.reject(error)
  }

  _create(config) {
    this._inner_set[config.url] = {
      url: config.url,
      method: config.method,
      startTime: Date.now(),
      endTime: null,
      totalTime: null,
      requestData: this._extractDataFromRequest(config),
      responseData: null,
      classTransform: null
    }
  }

  _delete(key) {
    delete this._inner_set[key]
  }

  _update({ config, data }) {
    const basicObject = this._inner_set[config.url]
    const updateLogQuery = {
      endTime: Date.now(),
      totalTime: `${ Date.now() - basicObject.startTime }ms`,
      responseData: data
    }
    this._inner_set[config.url] = {
      ...basicObject,
      ...updateLogQuery
    }
  }

  _printByKey(key) {
    logger.group(key)
    logger.log(this._inner_set[key])
    logger.groupEnd(key)
  }


  _extractDataFromRequest(config) {
    const urlObject = url.parse(config.url)
    const query = {}
    if (urlObject.query) {
      urlObject.query.split('&').forEach(queryParam => {
        const arr = queryParam.split('=')
        query[ arr[ 0 ] ] = arr[ 1 ]
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


module.exports = new StatisticsModule()
