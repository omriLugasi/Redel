const url = require('url')
const logger = require('./../services/logger')

class Cancel {
  constructor() {
    this.cancelRequestMap = {}
    this.cancelRequestGroupMap = {}
  }


  _generateKeys(config) {
    const urlPathName = url.parse(config.url).pathname
    const requestKey = `${urlPathName} -> ${config.method}`
    const groupKey = config.headers.cancelGroupKey
    return [requestKey, groupKey]
  }

  _getGroupByKey(groupKey) {
    return Array.isArray(this.cancelRequestGroupMap[groupKey])
      ? [...this.cancelRequestGroupMap[groupKey]]
      : []
  }

  _signToGroup(key, groupKey) {
    if (!groupKey) {
      return
    }
    if (Array.isArray(this.cancelRequestGroupMap[groupKey])) {
      this.cancelRequestGroupMap[groupKey].push(key)
      return
    }
    this.cancelRequestGroupMap[groupKey] = [key]
  }

  _sign(config) {
    const [key, groupKey] = this._generateKeys(config)
    const { CancelToken } = this._axios
    const source = CancelToken.source()
    this.cancelRequestMap[key] = source
    this._signToGroup(key, groupKey)
    return source.token
  }

  _delete(config) {
    const [key, groupKey] = this._generateKeys(config)
    if (this.cancelRequestMap[key]) {
      delete this.cancelRequestMap[key]
    }
    this._deleteFromGroup(key, groupKey)
  }

  _deleteFromGroup(key, groupKey) {
    let cancelGroup = [...this._getGroupByKey(groupKey)]
    if (groupKey && cancelGroup) {
      cancelGroup = cancelGroup.filter(requestKey => requestKey !== key)
      if (!cancelGroup.length) {
        delete this.cancelRequestGroupMap[groupKey]
      } else {
        this.cancelRequestGroupMap[groupKey] = cancelGroup
      }
    }
  }

  _onRequestSuccess(config) {
    const [key] = this._generateKeys(config)
    if (this.cancelRequestMap[key]) {
      this.cancelRequestMap[key].cancel(config)
    }
    const cancelToken = this._sign(config)
    return { ...config, cancelToken }
  }

  _onResponseFailed(error) {
    const config = error.config || error.message
    const customError = { ...error, config }
    const isCanceledByAxios = this._axios.isCancel(error)
    this._delete(config)
    if (isCanceledByAxios) {
      const { method, url: configUrl } = config
      logger.group('cancel request execute')
      logger.log(`Method: [${method}]`)
      logger.log(`URL: [${configUrl}]`)
      logger.groupEnd('cancel request execute')
      customError.isCanceled = true
    }
    return Promise.reject(customError)
  }

  _onResponseSuccess(response) {
    this._delete(response.config)
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

  cancelAllGroupRequest(groupKey) {
    const cancelGroup = this.cancelRequestGroupMap[groupKey]
    if (!Array.isArray(cancelGroup)) {
      return
    }

    cancelGroup.forEach(key => {
      const [configUrl, method] = key.split(' -> ')
      const fakeConfig = { url: configUrl, method, headers: { groupKey } }
      this.cancelRequestMap[key].cancel(fakeConfig)
      this._delete(fakeConfig)
    })
    delete this.cancelRequestGroupMap[groupKey]
  }
}

module.exports = new Cancel()