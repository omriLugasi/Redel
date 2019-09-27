
class CancelModule {

  constructor() {
    this._ = {}
  }

  _sign(key) {
    const CancelToken = this._axios.CancelToken
    const source = CancelToken.source()
    this._[key] = source
    return source.token
  }

  _onRequestSuccess(config) {
    config.cancelToken = this._sign(config.url)
    setTimeout(() => {
      console.log('here', this._)
      this._[config.url].cancel('cancelled!')
    }, 50)
    // this._[config.url].cancel('cancelled!')
    return config
  }

  _onResponseFailed(error) {
    if (this._axios.isCancel(error)) {
      return { message: 'Axios cancellation process' }
    }
    return error
  }


  /** EXPOSE **/

  applyMiddleware(axios) {
    this._axios = axios
    axios.interceptors.request.use(this._onRequestSuccess.bind(this))
    axios.interceptors.response.use(r => r, this._onResponseFailed.bind(this))
  }

}


module.exports = new CancelModule()
