const logger = require('./../services/logger')

class CancelModule {
  constructor() {
    this._inner_set = {}
  }

  _generateKey(config) {
    return config.url + config.method
  }

  _generateCancelGroupKey(config) {
    return config.headers.cancelGroupKey
  }

  _sign(key) {
    const { CancelToken } = this._axios
    const source = CancelToken.source()
    this._inner_set[key] = source
    return source.token
  }

  _delete(key) {
    delete this._inner_set[key]
  }

  _onRequestSuccess(config) {
    const key = this._generateKey(config)
    if (this._inner_set[key]) {
      this._inner_set[key].cancel(config)
    }
    const cancelToken = this._sign(key)
    return { ...config, cancelToken }
  }

  _onResponseFailed(error) {
    const key = this._generateKey(error.message)
    if (this._inner_set[key]) {
      this._delete(key)
    }
    if (this._axios.isCancel(error)) {
      const { method, url } = error.message
      logger.group('cancel request execute')
      logger.log(`Method: [${method}]`)
      logger.log(`URL: [${url}]`)
      logger.groupEnd('cancel request execute')
    }
    return Promise.reject({ ...error, isCanceled: true })
  }

  _onResponseSuccess(response) {
    this._delete(this._generateKey(response.config))
    return response
  }


  /** EXPOSE * */

  applyMiddleware(axios) {
    this._axios = axios
    axios.interceptors.request.use(this._onRequestSuccess.bind(this))
    axios.interceptors.response.use(
      this._onResponseSuccess.bind(this),
      this._onResponseFailed.bind(this),
    )
  }
}


module.exports = new CancelModule()
