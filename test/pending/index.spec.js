const axios = require('axios')
const { assert } = require('chai')
const sinon = require('sinon')
const { BASIC_URL } = require('./../utils')
const Redel = require('../../src/index')
const server = require('./../../server')

describe('Pending middleware', () => {
  before(() => {
    Redel.use(axios, { pending: true })
    server.init()
  })

  after(() => {
    server.close()
  })

  afterEach(() => {
    Redel.pending.clear()
  })

  describe('Pending Request check exists in main module', () => {
    it('should exist under the "pending" field', () => {
      assert.ok(!!Redel.pending)
    })
  })

  describe('Pending Request "_add" functionality', () => {
    it('should be a function', () => {
      assert.ok(typeof Redel.pending._add === 'function')
    })

    it('should work only with string as first parameter', () => {
      assert.throws(() => Redel.pending._add(null), 'Redel pending request should work only with string')
    })


    it('should add new param into the pending array', () => {
      Redel.pending._add('somekey')
      Redel.pending._add('somekey2')
      assert.ok(Redel.pending.getPendingRequests().length === 2)
    })
  })

  describe('Pending Request "_delete" functionality', () => {
    it('should be a function', () => {
      assert.typeOf(Redel.pending._delete, 'function')
    })

    it('should delete specific key by value', () => {
      const key = 'somekey'
      Redel.pending._add(key)
      assert.ok(Redel.pending.getPendingRequests().length === 1)
      Redel.pending._delete(key)
      assert.ok(Redel.pending.getPendingRequests().length === 0)
    })

    it('should *NOT* remove the key', () => {
      const key = 'somekey'
      const anotherKey = 'someAnotherKey'
      Redel.pending._add(key)
      assert.ok(Redel.pending.getPendingRequests().length === 1)
      Redel.pending._delete(anotherKey)
      assert.ok(Redel.pending.getPendingRequests().length === 1)
    })
  })

  describe('Pending Request "clear" functionality', () => {
    it('should be a function', () => {
      assert.typeOf(Redel.pending.clear, 'function')
    })

    it('should create new set object', () => {
      const oldPointer = Redel.pending._inner_set
      Redel.pending.clear()
      assert.notEqual(oldPointer, Redel.pending._inner_set)
    })
  })

  describe('Pending Request "getPendingRequests"', () => {
    it('should be a function', () => {
      assert.ok(typeof Redel.pending.getPendingRequests === 'function')
    })

    it('should return an empty array', () => {
      const pendingRequests = Redel.pending.getPendingRequests()
      assert.ok(Array.isArray(pendingRequests) && !pendingRequests.length)
    })

    it('should return array of strings', () => {
      const key = 'somekey'
      const length = 10
      new Array(length).fill(key).forEach((Qkey, index) => Redel.pending._add(Qkey + index))
      const pendingRequests = Redel.pending.getPendingRequests()
      const isArrayOfStrings = pendingRequests.every(item => typeof item === 'string')
      assert.ok(isArrayOfStrings && pendingRequests.length === length)
    })

    it('should add the key to the pending requests array', () => {
      const key = 'somekey'
      Redel.pending._add(key)
      assert.equal(Redel.pending.getPendingRequests()[0], key)
    })
  })

  describe('Spy on interceptors function', () => {
    const spyOnRequestSuccess = sinon.spy(Redel.pending, '_onRequestSuccess')
    const spyOnResponseSuccess = sinon.spy(Redel.pending, '_onResponseSuccess')
    const spyOnResponseFailed = sinon.spy(Redel.pending, '_onResponseFailed')

    it('should trigger the spy functions', async () => {
      await axios.get(`${BASIC_URL}/time-out/0`)
      assert.ok(spyOnRequestSuccess.called)
      assert.ok(spyOnResponseSuccess.called)
    })

    it('should trigger the failed function', done => {
      axios.get('someWrongUrl').catch(() => {
        assert.ok(spyOnResponseFailed.called)
        done()
      })
    })
  })
})
