const axios = require('axios')
const { assert } = require('chai')
const { spy } = require('sinon')
const Redel = require('../../src/index')
const server = require('../../server/index')
const { BASIC_URL } = require('../utils/index')


describe('Test the main module with combination of log and cancel', () => {
  let consoleLogSpy
  // eslint-disable-next-line no-console
  const storeLog = console.log
  const basicUrl = `${BASIC_URL}/basic`

  before(() => {
    // change the console.log function to anonymous function to work on the test in easier format
    // eslint-disable-next-line no-console
    console.log = () => {}
    consoleLogSpy = spy(console, 'log')

    Redel.ejectAll()
    Redel.use(axios, { log: true, cancel: true, pending: true })
    server.init()
  })

  after(() => {
    server.close()
    // eslint-disable-next-line no-console
    console.log = storeLog
  })

  afterEach(() => {
    consoleLogSpy.resetHistory()
  })

  context('is cancel plugin work well with combination', () => {
    let canceledRequests = 0
    const catchFn = e => {
      if (e.isCanceled) {
        canceledRequests += 1
      }
    }
    before(async () => {
      await Promise.all([
        axios.get(basicUrl).catch(catchFn),
        axios.get(basicUrl).catch(catchFn),
        axios.get(basicUrl).catch(catchFn),
      ])
    })

    it('should cancel relevant requests', () => {
      assert.isTrue(canceledRequests === 2)
    })
  })

  context('is log plugin work well with combination', () => {
    before(async () => {
      await axios.get(basicUrl).catch(() => {})
      await axios.get(basicUrl).catch(() => {})
      await axios.get(basicUrl).catch(() => {})
    })

    it('should plugin find the relevant ', () => {
      assert.isTrue(consoleLogSpy.callCount === 6)
    })
  })

  context('is pending plugin work well with combination', () => {
    it('should save the pending requests according to the cancel plugin work', done => {
      Promise.all([
        axios.get(`${BASIC_URL}/time-out/12`).catch(() => {}),
        axios.get(`${BASIC_URL}/time-out/12`).catch(() => {}),
        axios.get(`${BASIC_URL}/time-out/12`).catch(() => {}),
      ]).then(() => {
        assert.isTrue(Redel.pending.getPendingRequests().length === 0)
        done()
      })
      setImmediate(() => {
        // the pending request is 1 because the cancel
        // plugin already remove two of those promises
        assert.isTrue(Redel.pending.getPendingRequests().length === 1)
      })
    })

    it('should check if pending plugin work well with combination between plugins', done => {
      const promises = [
        axios.post(`${BASIC_URL}/time-out/10`).catch(() => {}),
        axios.post(`${BASIC_URL}/time-out/11`).catch(() => {}),
        axios.post(`${BASIC_URL}/time-out/12`).catch(() => {}),
        axios.get(`${BASIC_URL}/time-out/13`).catch(() => {}),
        axios.get(`${BASIC_URL}/time-out/14`).catch(() => {}),
        axios.delete(`${BASIC_URL}/time-out/15`).catch(() => {}),
      ]
      Promise.all(promises)
        .then(() => {
          assert.isTrue(Redel.pending.getPendingRequests().length === 0)
          done()
        })
      setImmediate(() => {
        assert.isTrue(Redel.pending.getPendingRequests().length === promises.length)
      })
    })
  })
})
