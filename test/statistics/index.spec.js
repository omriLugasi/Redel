const axios = require('axios')
const { assert } = require('chai')
const { spy } = require('sinon')
const { BASIC_URL } = require('./../utils')
const server = require('./../../server')
const ambiance = require('./../../src')


describe('Statistics module', () => {
  before(() => {
    server.init()
    ambiance.use(axios, { statistics: true })
  })

  after(() => {
    server.close()
  })

  context('is statistics sign to the main module', () => {
    it('should find statistics in the main module', () => {
      assert.ok(ambiance.getSignedMiddleware()[0], 'statistics')
      assert.ok(ambiance.getSignedMiddleware().length, 1)
    })
  })

  context('check if the basic printed data is valid', () => {
    let consoleLogSpy
    const url = `${BASIC_URL}/basic`

    before(() => {
      consoleLogSpy = spy(console, 'log')
    })

    after(() => {
      consoleLogSpy.restore()
    })

    it('should call to the log function on the console instance 3 times', async () => {
      await axios.get(url)
      assert.ok(consoleLogSpy.callCount, 3)
    })

    it('should be the same url in the printedData and the url that send to the request', async () => {
      await axios.get(url)
      const printedData = consoleLogSpy.getCall(1).args[0]
      assert.isTrue(consoleLogSpy.called)
      assert.ok(printedData.url, url)
    })

    it('should validate that end time bigger then start time', async () => {
      await axios.get(url)
      const printedData = consoleLogSpy.getCall(1).args[0]
      assert.isAbove(printedData.endTime, printedData.startTime)
    })

    it('should validate that total time property include "ms" charters', async () => {
      await axios.get(url)
      const printedData = consoleLogSpy.getCall(1).args[0]
      assert.include(printedData.totalTime, 'ms')
    })

    it('should validate that isCompletedWithoutError property exists', async () => {
      await axios.get(url)
      const printedData = consoleLogSpy.getCall(1).args[0]
      assert.include(Object.keys(printedData), 'isCompletedWithoutError')
    })


    it('should validate that method property equal to the printed data object', async () => {
      const method = 'get'
      await axios[method](url)
      const printedData = consoleLogSpy.getCall(1).args[0]
      assert.ok(printedData.method, method)
    })
  })

  context('is statistics object has default properties', () => {
    let consoleLogSpy
    const url = `${BASIC_URL}/basic`

    before(() => {
      consoleLogSpy = spy(console, 'log')
    })

    after(() => {
      consoleLogSpy.restore()
    })

    it('should validate that proxy is undefined by default', async () => {
      await axios.get(url)
      const printedData = consoleLogSpy.getCall(1).args[0]
      assert.isUndefined(printedData.proxy)
    })

    it('should validate that timeout is 0 by default', async () => {
      await axios.get(url)
      const printedData = consoleLogSpy.getCall(1).args[0]
      assert.isAtMost(printedData.timeout, 0)
    })

    it('should validate that maxContentLength is -1 by default', async () => {
      await axios.get(url)
      const printedData = consoleLogSpy.getCall(1).args[0]
      assert.isAtMost(printedData.maxContentLength, -1)
    })

    it('should validate that requestData include the relevant properties', async () => {
      await axios.get(url)
      const printedData = consoleLogSpy.getCall(1).args[0]
      assert.include(Object.keys(printedData.requestData), 'query')
      assert.include(Object.keys(printedData.requestData), 'params')
      assert.include(Object.keys(printedData.requestData), 'data')
    })
  })

  // check if the user send other value of the default properties
  // try to remove the log from the tests
  // check if the responseData is undefind if user catch a http request

  context('on request failed', () => {
    let consoleLogSpy
    const url = `${BASIC_URL}/basic/not-exist`

    before(() => {
      consoleLogSpy = spy(console, 'log')
    })

    after(() => {
      consoleLogSpy.restore()
    })

    it('should validate that spy functions called', async () => {
      await axios.get(url).catch(() => {})
      assert.ok(consoleLogSpy.callCount, 3)
    })

    it('should validate that the message is printed', async () => {
      await axios.get(url).catch(() => {})
      const printedData = consoleLogSpy.getCall(1).args[0]
      assert.exists(printedData)
    })

    it('should validate that isCompletedWithoutError is false', async () => {
      await axios.get(url).catch(() => {})
      const printedData = consoleLogSpy.getCall(1).args[0]
      assert.isFalse(printedData.isCompletedWithoutError)
    })
  })
})
