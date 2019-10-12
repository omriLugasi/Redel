const uuid4 = require('uuid/v4')

/**
 * @description
 * Statistics Unique request key
 * @type {string}
 */
const statisticsUniqueRequestKey = '__Redel_statistics_request_key__'

module.exports = {
  statisticsUniqueRequestKey,
  generateUniqueRequestKey: uuid4,
}
