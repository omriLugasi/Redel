const axios = require('axios')
const { assert } = require('chai')
const { BASIC_URL } = require('./../utils')
const Redel = require('../../src/index')
const server = require('./../../server')


describe('Pending plugin', () => {
  before(() => {
    Redel.ejectAll()
    Redel.use(axios, { pending: true })
    server.init()
  })

  after(() => {
    server.close()
  })

  beforeEach(() => {
    Redel.pending.clear()
  })

  context('is Found in the main module', () => {
    it('should exist under the "pending" field', () => {
      assert.exists(Redel.pending)
    })
  })

  context('basic pending logic', () => {
    it('should validate assignment of request to the plugin', done => {
      axios.get(`${BASIC_URL}/time-out/1`).then(() => {
        assert.isTrue(Redel.pending.getPendingRequests().length === 0)
        done()
      })
      setImmediate(() => {
        assert.isTrue(Redel.pending.getPendingRequests().length === 1)
      })
    })
  })

  context('is request failed should not effect the plugin logic', () => {
    it('should check that request failed not effect', done => {
      axios.get(`${BASIC_URL}/basic/not-exist`)
        .catch(() => {
          assert.isTrue(Redel.pending.getPendingRequests().length === 0)
          done()
        })

      setImmediate(() => {
        assert.isTrue(Redel.pending.getPendingRequests().length === 1)
      })
    })
  })

  context('is two request with the same url and params', () => {
    it('should validate the plugin functionality', done => {
      Promise.all([
        axios.get(`${BASIC_URL}/time-out/1`),
        axios.get(`${BASIC_URL}/time-out/1`),
      ]).then(() => {
        assert.isTrue(Redel.pending.getPendingRequests().length === 0)
        done()
      })

      setImmediate(() => {
        assert.isTrue(Redel.pending.getPendingRequests().length === 2)
      })
    })
  })

  context('Working with different requests with the same url or not the same url', () => {
    it('should check if the plugin work under real world pressure', done => {
      const promises = [
        axios.put(`${BASIC_URL}/time-out/1`),
        axios.get(`${BASIC_URL}/time-out/1`),
        axios.put(`${BASIC_URL}/time-out/1`),
        axios.get(`${BASIC_URL}/time-out/1`),
        axios.delete(`${BASIC_URL}/time-out/1`),
        axios.get(`${BASIC_URL}/time-out/1`),
        axios.post(`${BASIC_URL}/time-out/1`),
      ]
      Promise.all(promises).then(() => {
        assert.isTrue(Redel.pending.getPendingRequests().length === 0)
        done()
      })

      setImmediate(() => {
        assert.isTrue(Redel.pending.getPendingRequests().length === promises.length)
      })
    })
  })
})
