const axios = require('axios')
const { assert } = require('chai')
const { spy } = require('sinon')
const { BASIC_URL, generateQueryStringFromObject, getSpyCallValue } = require('./../utils')
const server = require('./../../server')
const Redel = require('./../../src')


describe('Statistics plugin', () => {
  let consoleLogSpy
  // eslint-disable-next-line no-console
  const storeLog = console.log

  before(() => {
    server.init()
    Redel.ejectAll()
    Redel.use(axios, { statistics: true })

    // change the console.log function to anonymous function to work on the test in easier format
    // eslint-disable-next-line no-console
    console.log = () => {}

    consoleLogSpy = spy(console, 'log')
  })

  after(() => {
    server.close()
    consoleLogSpy.restore()
    // eslint-disable-next-line no-console
    console.log = storeLog
  })


  context('is statistics sign to the main module', () => {
    it('should find statistics in the main module', () => {
      assert.ok(Redel.getSignedMiddleware()[0], 'statistics')
      assert.ok(Redel.getSignedMiddleware().length, 1)
    })
  })

  context('check if the basic printed data is valid', () => {
    const url = `${BASIC_URL}/basic`

    it('should call to the log function on the console instance 3 times', async () => {
      await axios.get(url)
      assert.ok(consoleLogSpy.callCount, 3)
    })

    it('should be the same url in the printedData and the url that send to the request', async () => {
      await axios.get(url)
      const printedData = consoleLogSpy.lastCall.args[0]
      assert.isTrue(consoleLogSpy.called)
      assert.ok(printedData.url, url)
    })

    it('should validate that end time bigger then start time', async () => {
      await axios.get(url)
      const printedData = consoleLogSpy.lastCall.args[0]
      assert.isAbove(printedData.endTime, printedData.startTime)
    })

    it('should validate that total time property include "ms" charters', async () => {
      await axios.get(url)
      const printedData = consoleLogSpy.lastCall.args[0]
      assert.include(printedData.totalTime, 'ms')
    })

    it('should validate that isCompletedWithoutError property exists', async () => {
      await axios.get(url)
      const printedData = consoleLogSpy.lastCall.args[0]
      assert.include(Object.keys(printedData), 'isCompletedWithoutError')
    })


    it('should validate that method property equal to the printed data object', async () => {
      const method = 'get'
      await axios[method](url)
      const printedData = consoleLogSpy.lastCall.args[0]
      assert.ok(printedData.method, method)
    })
  })

  context('is statistics object has default properties', () => {
    const url = `${BASIC_URL}/basic`

    it('should validate that proxy is undefined by default', async () => {
      await axios.get(url)
      const printedData = consoleLogSpy.lastCall.args[0]
      assert.isUndefined(printedData.proxy)
    })

    it('should validate that timeout is 0 by default', async () => {
      await axios.get(url)
      const printedData = consoleLogSpy.lastCall.args[0]
      assert.isAtMost(printedData.timeout, 0)
    })

    it('should validate that maxContentLength is -1 by default', async () => {
      await axios.get(url)
      const printedData = consoleLogSpy.lastCall.args[0]
      assert.isAtMost(printedData.maxContentLength, -1)
    })

    it('should validate that requestData include the relevant properties', async () => {
      await axios.get(url)
      const printedData = consoleLogSpy.lastCall.args[0]
      assert.include(Object.keys(printedData.requestData), 'query')
      assert.include(Object.keys(printedData.requestData), 'params')
      assert.include(Object.keys(printedData.requestData), 'data')
    })
  })

  context('is default values change when we get them in the config', () => {
    let printedData
    const url = `${BASIC_URL}/basic`
    const customTimeout = 10000
    const customMaxContentLength = 100000
    const proxy = {
      host: '127.0.0.1',
      port: 3002,
    }

    before(async () => {
      await axios.get(url, {
        timeout: customTimeout,
        maxContentLength: customMaxContentLength,
        proxy,
      })
      const [data] = consoleLogSpy.lastCall.args
      printedData = data
    })


    it('should validate that timeout property is not default', () => {
      assert.ok(printedData.timeout, customTimeout)
    })

    it('should validate that proxy property is not default', async () => {
      assert.deepEqual(printedData.proxy, proxy)
    })

    it('should validate that maxContentLength property is not default', async () => {
      assert.ok(printedData.maxContentLength, customMaxContentLength)
    })
  })

  context('on request failed', () => {
    const url = `${BASIC_URL}/basic/not-exist`

    it('should validate that spy functions called', async () => {
      await axios.get(url).catch(() => {})
      assert.ok(consoleLogSpy.callCount, 3)
    })

    it('should validate that the message is printed', async () => {
      await axios.get(url).catch(() => {})
      const printedData = consoleLogSpy.lastCall.args[0]
      assert.exists(printedData)
    })

    it('should validate that isCompletedWithoutError is false', async () => {
      await axios.get(url).catch(() => {})
      const printedData = consoleLogSpy.lastCall.args[0]
      assert.isFalse(printedData.isCompletedWithoutError)
    })

    it('should validate that responseData is undefined', async () => {
      await axios.get(url).catch(() => {})
      const printedData = consoleLogSpy.lastCall.args[0]
      assert.isUndefined(printedData.responseData)
    })
  })

  context('is statistics object contains the right parameters for request', () => {
    let printedData
    const url = `${BASIC_URL}/basic`
    const query = { queryParam1: '1', queryParam2: '2' }
    const params = { param1: 1 }
    const data = { dataParam: 1, dataParam2: 'string' }
    const queryString = generateQueryStringFromObject(query)

    before(async () => {
      await axios.post(`${url}?${queryString}`, data, { params })
      const [args] = consoleLogSpy.lastCall.args
      printedData = args
    })

    it('should validate that request sent with the right query params', async () => {
      assert.deepEqual(printedData.requestData.query, query)
    })

    it('should validate that request sent with the right params', async () => {
      assert.deepEqual(printedData.requestData.params, params)
    })

    it('should validate that request sent with the right data', async () => {
      assert.deepEqual(printedData.requestData.data, data)
    })
  })

  context('requests with the same url', () => {
    const url = `${BASIC_URL}/time-out`

    it('should check if two request with the same url and a different method are valid', async () => {
      const getRequestUrl = `${url}/10`
      await Promise.all([
        axios.get(getRequestUrl),
        axios.post(`${url}/20`, { poi: true }),
      ])
      const postPrintedData = { ...consoleLogSpy.lastCall.args[0] }
      assert.deepEqual(postPrintedData.requestData.data, { poi: true })
      // check if the printed data of get request really printed
      const getPrintedData = getSpyCallValue(consoleLogSpy, 3)
      assert.equal(getPrintedData.method, 'get')
      assert.equal(getPrintedData.url, getRequestUrl)
    })

    it('should check if two request with the same url and the same method are valid', async () => {
      await Promise.all([
        axios.patch(`${url}/10`),
        axios.patch(`${url}/20`),
      ])
      const patchPrintedDataSecond = { ...consoleLogSpy.lastCall.args[0] }
      assert.equal(patchPrintedDataSecond.method, 'patch')
      const firstPatchPrintedRequest = getSpyCallValue(consoleLogSpy, 3)
      assert.equal(firstPatchPrintedRequest.method, 'patch')
    })
  })
})
