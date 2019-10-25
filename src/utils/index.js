const uuid4 = require('uuid/v4')

/**
 * @description
 * Log Unique request key
 * @type {string}
 */
const logUniqueRequestKey = '__Redel_log_request_key__'

/**
 * @description
 * Pending Unique request key
 * @type {string}
 */
const pendingUniqueRequestKey = '__Redel_pending_request_key__'

/**
 * @description
 * return the config object
 * check if it's canceled request, if does take the config from the message property
 * if dosen't take from the original please config property
 * @type {axios config object}
 */
const ensureGetConfig = error => error.config || error.message

module.exports = {
  pendingUniqueRequestKey,
  logUniqueRequestKey,
  generateUniqueRequestKey: uuid4,
  ensureGetConfig,
}
