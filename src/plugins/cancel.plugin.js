const { isCancel: isAxiosCancel, CancelToken } = require('axios')
const url = require('url')
const qs = require('qs')
const logger = require('./../services/logger')

// Cancel Custom Group Key
const uniqueGroupKey = 'ccgk'

/**
 * @description
 * Cancel plugin is a plugin that wrap your requests
 * before firing them to the server with cancellation functionality
 *
 * @further-information
 * The cancel plugin work with 2 different functionalities:
 * 1. single cancel
 * 2. cancel by group key
 *
 * @Single
 * Cancel request that still didn't return
 * when a new request with the same method and pathname
 * gonna be fired to the server
 *
 * @cancel-by-group-key
 * Cancel all requests with the unique group key
 */
class Cancel {
  constructor() {
    this.cancelRequestMap = {}
    this.cancelRequestGroupMap = {}
    // for export
    this.ccgk = uniqueGroupKey
  }


  /**
   * @description
   * Extract the url pathname method and cancelGroupKey if exist
   * @param config
   * @returns [requestKey, groupKey]
   * @private
   */
  _generateKeys(config) {
    const urlObject = url.parse(config.url)
    const query = qs.parse(urlObject.query)
    const urlPathName = urlObject.pathname
    const requestKey = `${urlPathName} -> ${config.method}`
    const groupKey = query[uniqueGroupKey]
    return [requestKey, groupKey]
  }

  /**
   * @description
   * Return array of cancel objects that sign to the specific group key
   * @param groupKey - string
   * @returns [cancelObject]
   * @private
   */
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

  /**
   * @description
   * Sign the request to the cancelMainObject and,
   * cancelMainGroupObject if a groupKey exists.
   * Return an axios cancel token instance
   * @param axios config
   * @returns axios cancel token instance
   * @private
   */
  _sign(config) {
    const [key, groupKey] = this._generateKeys(config)
    const source = CancelToken.source()
    this.cancelRequestMap[key] = source
    this._signToGroup(key, groupKey)
    return source.token
  }

  /**
   * @description
   * Will delete the request only after the cancellation process execute
   * Or Request resolved/rejected
   * @param config
   * @private
   */
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
    const isCanceledByAxios = isAxiosCancel(error)
    this._delete(config)
    if (isCanceledByAxios) {
      logger.group('cancel request execute')
      logger.log(config)
      logger.groupEnd('cancel request execute')
      customError.isCanceled = true
    }
    return Promise.reject(customError)
  }

  _onResponseSuccess(response) {
    this._delete(response.config)
    return response
  }


  /*  EXPOSE   */

  /**
   * @description
   * This function is a must function in each plugin.
   * The function should sign the plugin into the
   * axios interceptors request and response
   * @param axios
   */
  applyMiddleware(axios) {
    axios.interceptors.request.use(this._onRequestSuccess.bind(this))
    axios.interceptors.response.use(
      this._onResponseSuccess.bind(this),
      this._onResponseFailed.bind(this),
    )
  }

  /**
   * @description
   * Cancel all requests that belong to the groupKey
   * @param groupKey
   */
  cancelGroupRequests(groupKey) {
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
