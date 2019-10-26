const axios = require('axios')
const { assert } = require('chai')
const Redel = require('./../../src')
const { BASIC_URL } = require('./../utils')
const server = require('./../../server')

const cancelGroupKey = 'customGroupKey'

describe('Cancel plugin', () => {
  before(() => {
    Redel.ejectAll()
    Redel.use(axios, { cancel: true })
    server.init()
  })

  after(() => {
    server.close()
  })

  describe('cancel group requests', () => {
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
        const headers = Redel.getCancelGroupHeader(cancelGroupKey)
        canceledRequestsTimes = 0
        axios.get(generateUrl(basicNum + 6), { headers }).catch(catchFn)
        axios.get(generateUrl(basicNum + 7), { headers }).catch(catchFn)
        axios.get(generateUrl(basicNum + 8), { headers }).catch(catchFn)
        axios.get(generateUrl(basicNum + 9), { headers }).catch(catchFn)
        axios.get(generateUrl(basicNum + 10), { headers }).catch(catchFn)
      })

      it('should validate that requests with "cancelGroupKey" canceled', done => {
        Redel.cancelGroupRequests(cancelGroupKey)
        setImmediate(() => {
          assert.isTrue(canceledRequestsTimes === 5)
          done()
        })
      })
    })

    context('check that cancel of one group dosen\'t effect on other group', () => {
      before(() => {
        const headers = Redel.getCancelGroupHeader(cancelGroupKey)
        canceledRequestsTimes = 0
        axios.get(generateUrl(basicNum + 6), { headers }).catch(catchFn)
        axios.get(generateUrl(basicNum + 7), { headers }).catch(catchFn)
        axios.get(generateUrl(basicNum + 9), { headers }).catch(catchFn)
      })

      it('should validate that "cancelAllGroupRequests" cancel only the requests with the group key', done => {
        Redel.cancelGroupRequests('another-custom-group-key')
        setImmediate(() => {
          assert.isTrue(canceledRequestsTimes === 0)
          done()
        })
      })
    })

    context('throw an error if developer try to use get header function without inject any key', () => {

      it('should validate that get headers without key throw exception', () => {
        assert.throw(() => Redel.getCancelGroupHeader(), `"getCancelGroupHeader" should invoke 
      with cancel group key, please verify that you didn't 
      invoke the function with undefined or null`)
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
        assert.isTrue(canceledRequestsTimes === 4)
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
        assert.isTrue(canceledRequestsTimes === 1)
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
        assert.isTrue(canceledRequestsTimes === 2)
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
