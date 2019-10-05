/**
 *  Basic url for promise function
 */

const BASIC_URL = 'http://localhost:3002'


const generateQueryStringFromObject = query => Object.keys(query).map(key => key + '=' + query[key]).join('&')

module.exports = {
  BASIC_URL,
  generateQueryStringFromObject
}
