/**
 *  Basic url for promise function
 */

const BASIC_URL = 'http://localhost:3002'


const generateQueryStringFromObject = query => Object.keys(query).map(key => `${key}=${query[key]}`).join('&')

const getSpyCallValue = (spy, itemsBefore = 1) => spy.getCall(spy.callCount - itemsBefore).args[0]

module.exports = {
  BASIC_URL,
  getSpyCallValue,
  generateQueryStringFromObject,
}
