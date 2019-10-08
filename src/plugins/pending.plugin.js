/**
 * @description
 * Store information about requests in pending status.
 * expose function that help the developer know if there are any request in pending status.
 *
 * @further-information
 * The request url will be used as key, and the key will be store at pendingRequestsSet.
 * The url will be removed from pendingRequestsSet only when the request rejected or resolved,
 * until then the pending plugin will save the request as pending request
 */
class Pending {
  constructor() {
    // hold the requests status to know if there are any pending requests
    this.pendingRequestsSet = new Set()
  }

  /**
   * @description
   * on request ready to send, add the url as key to the pendingRequestsSet
   * @param config
   * @returns {*}
   * @private
   */
  _onRequestSuccess(config) {
    this._add(config.url)
    return config
  }

  /**
   * @description
   * on request resolved, remove the url as key from the pendingRequestsSet set
   * @param response
   * @returns {*}
   * @private
   */
  _onResponseSuccess(response) {
    this._delete(response.config.url)
    return response
  }


  /**
   * @description
   * on request rejected, remove the url as key from the pendingRequestsSet set
   * @param error
   * @returns {*}
   * @private
   */
  _onResponseFailed(error) {
    this._delete(error.config.url)
    return Promise.reject(error)
  }

  _add(key) {
    if (typeof key !== 'string') {
      throw new Error('Redel pending request should work only with string')
    }
    this.pendingRequestsSet.add(key)
  }

  _delete(key) {
    this.pendingRequestsSet.delete(key)
  }

  /* EXPOSE FUNCTIONS */

  /**
   * @description
   * Reset the pendingRequestsSet
   */
  clear() {
    this.pendingRequestsSet = new Set()
  }

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

  /**
   * @desciprion
   * Return array of Strings that each string is a request url in pending status.
   * @returns {*[]}
   */
  getPendingRequests() {
    return [...this.pendingRequestsSet]
  }
}


module.exports = new Pending()
