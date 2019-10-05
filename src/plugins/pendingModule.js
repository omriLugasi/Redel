class PendingModule {
  constructor() {
    this._inner_set = new Set()
  }

  _onRequestSuccess(config) {
    this._add(config.url)
    return config
  }

  _onResponseSuccess(response) {
    this._delete(response.config.url)
    return response
  }

  _onResponseFailed(error) {
    this._delete(error.config.url)
    return Promise.reject(error)
  }

  _add(key) {
    if (typeof key !== 'string') {
      throw new Error('Redel pending request should work only with string')
    }
    this._inner_set.add(key)
  }

  _delete(key) {
    this._inner_set.delete(key)
  }

  clear() {
    this._inner_set = new Set()
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

  getPendingRequests() {
    return [...this._inner_set]
  }
}


module.exports = new PendingModule()
