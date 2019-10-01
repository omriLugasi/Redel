const axios = require('axios')
const { assert } = require('chai')
const ambiance = require('./../../src')
const { BASIC_URL } = require('./../utils')
const server = require('./../../server')

const cancelGroupKey = 'customGroupKey'

describe('Cancel module', () => {
  before(() => {
    ambiance.use(axios, { cancel: true })
    server.init()
  })

  after(() => {
    server.close()
  })

  describe('cancel group requests', () => {
    const config = { headers: { cancelGroupKey } }
    const generateUrl = time => `${BASIC_URL}/time-out/${time}`
    const basicNum = 300
    let canceledRequestsTimes = 0
    const catchFn = e => {
      if (e.isCanceled) {
        canceledRequestsTimes++
      }
    }

    context('basic cancel group logic', () => {
      before(() => {
        canceledRequestsTimes = 0
        axios.get(generateUrl(basicNum + 20), config).catch(catchFn)
        axios.get(generateUrl(basicNum + 50), config).catch(catchFn)
        axios.get(generateUrl(basicNum + 70), config).catch(catchFn)
        axios.get(generateUrl(basicNum + 100), config).catch(catchFn)
        axios.get(generateUrl(basicNum + 190), config).catch(catchFn)
      })

      it('should validate that requests with "cancelGroupKey" canceled', done => {
        ambiance.cancel.cancelAllGroupRequest(cancelGroupKey)
        setTimeout(() => {
          assert.ok(canceledRequestsTimes, 5)
          done()
        }, 0)
      })
    })
  })

  describe('cancel single request', () => {
    let canceledRequestsTimes = 0
    const url = `${BASIC_URL}/basic`
    const catchFn = e => {
      if (e.isCanceled) {
        canceledRequestsTimes += 1
      }
    }

    context('When using the same http method', () => {
      before(() => {
        canceledRequestsTimes = 0
        axios.get(url).catch(catchFn)
        axios.get(url).catch(catchFn)
        axios.get(url).catch(catchFn)
        axios.get(url).catch(catchFn)
        axios.get(url).catch(catchFn) // the last one should be fulfilled without cancellation
      })

      it('should check if the number of canceled request is valid', () => {
        assert.ok(canceledRequestsTimes, 4)
      })
    })

    context('When using different methods', () => {
      before(() => {
        canceledRequestsTimes = 0
        axios.get(url).catch(catchFn)
        axios.get(url).catch(catchFn)
        axios.delete(url).catch(catchFn)
        axios.patch(url).catch(catchFn)
        axios.post(url).catch(catchFn) // the last one should be fulfilled without cancellation
      })

      it('should validate that different methods on the same url sign under different keys', () => {
        assert.ok(canceledRequestsTimes, 1)
      })
    })

    context('When using the same http request with different params', () => {
      before(() => {
        canceledRequestsTimes = 0
        axios.get(`${url}?param=1`).catch(catchFn)
        axios.get(`${url}?param=2`).catch(catchFn)
        axios.get(`${url}?param=3`).catch(catchFn) // the last one should be fulfilled without cancellation
      })

      it('should validate that different params doesn\'t effect on the cancel logic', () => {
        assert.ok(canceledRequestsTimes, 2)
      })
    })
  })
})
