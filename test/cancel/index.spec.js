const axiosInstance = require('axios')
const { assert } = require('chai')
const Redel = require('./../../src')
const { BASIC_URL } = require('./../utils')
const server = require('./../../server')

const axios = axiosInstance.create()
const cancelGroupKey = 'customGroupKey'

describe('Cancel plugin', () => {
  before(() => {
    Redel.use(axios, { cancel: true })
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
        canceledRequestsTimes += 1
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
        Redel.cancel.cancelGroupRequests(cancelGroupKey)
        setImmediate(() => {
          assert.ok(canceledRequestsTimes, 5)
          done()
        })
      })
    })

    context('check that cancel of one group dosen\'t effect on other group', () => {
      const customConfig = { headers: { cancelGroupKey: 'custom' } }

      before(() => {
        canceledRequestsTimes = 0
        axios.get(generateUrl(basicNum + 20), customConfig).catch(catchFn)
        axios.get(generateUrl(basicNum + 30), customConfig).catch(catchFn)
        axios.get(generateUrl(basicNum + 40), customConfig).catch(catchFn)
      })

      it('should validate that "cancelAllGroupRequests" cancel only the requests with the group key', done => {
        Redel.cancel.cancelGroupRequests('another-custom-group-key')
        setImmediate(() => {
          assert.equal(canceledRequestsTimes, 0)
          done()
        })
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

    context('When the request failed without any connection to the plugin', () => {
      it('should return the exception without indicator about the cancellation', done => {
        axios.get(`${url}/not-exist`).catch(e => {
          assert.isUndefined(e.isCanceled)
          done()
        })
      })
    })
  })
})
