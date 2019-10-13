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

module.exports = {
  pendingUniqueRequestKey,
  statisticsUniqueRequestKey,
  generateUniqueRequestKey: uuid4,
}
