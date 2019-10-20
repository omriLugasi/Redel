const uuid4 = require('uuid/v4')

/**
 * @description
 * Statistics Unique request key
 * @type {string}
 */
const statisticsUniqueRequestKey = '__Redel_statistics_request_key__'

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
  statisticsUniqueRequestKey,
  generateUniqueRequestKey: uuid4,
  ensureGetConfig,
}
