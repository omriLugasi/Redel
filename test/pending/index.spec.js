const axios = require('axios')
const { assert } = require('chai')
const sinon = require('sinon')
const { BASIC_URL } = require('./../utils')

/**
 * AMBIANCE
 * */
const ambiance = require('../../src/index')


describe('Pending middleware', () => {
  before(() => {
    ambiance.use(axios, { pending: true })
  })

  afterEach(() => {
    ambiance.pending.clear()
  })

  describe('Pending Request check exists in main module', () => {
    it('should exist under the "pending" field', () => {
      assert.ok(!!ambiance.pending)
    })
  })

  describe('Pending Request "_add" functionality', () => {
    it('should be a function', () => {
      assert.ok(typeof ambiance.pending._add === 'function')
    })

    it('should work only with string as first parameter', () => {
      assert.throws(() => ambiance.pending._add(null), 'Ambiance pending request should work only with string')
    })


    it('should add new param into the pending array', () => {
      ambiance.pending._add('somekey')
      ambiance.pending._add('somekey2')
      assert.ok(ambiance.pending.getPendingRequests().length === 2)
    })
  })

  describe('Pending Request "_delete" functionality', () => {
    it('should be a function', () => {
      assert.typeOf(ambiance.pending._delete, 'function')
    })

    it('should delete specific key by value', () => {
      const key = 'somekey'
      ambiance.pending._add(key)
      assert.ok(ambiance.pending.getPendingRequests().length === 1)
      ambiance.pending._delete(key)
      assert.ok(ambiance.pending.getPendingRequests().length === 0)
    })

    it('should *NOT* remove the key', () => {
      const key = 'somekey'
      const anotherKey = 'someAnotherKey'
      ambiance.pending._add(key)
      assert.ok(ambiance.pending.getPendingRequests().length === 1)
      ambiance.pending._delete(anotherKey)
      assert.ok(ambiance.pending.getPendingRequests().length === 1)
    })
  })

  describe('Pending Request "clear" functionality', () => {
    it('should be a function', () => {
      assert.typeOf(ambiance.pending.clear, 'function')
    })

    it('should create new set object', () => {
      const oldPointer = ambiance.pending._inner_set
      ambiance.pending.clear()
      assert.notEqual(oldPointer, ambiance.pending._inner_set)
    })
  })

  describe('Pending Request "getPendingRequests"', () => {
    it('should be a function', () => {
      assert.ok(typeof ambiance.pending.getPendingRequests === 'function')
    })

    it('should return an empty array', () => {
      const pendingRequests = ambiance.pending.getPendingRequests()
      assert.ok(Array.isArray(pendingRequests) && !pendingRequests.length)
    })

    it('should return array of strings', () => {
      const key = 'somekey'
      const length = 10
      new Array(length).fill(key).forEach((Qkey, index) => ambiance.pending._add(Qkey + index))
      const pendingRequests = ambiance.pending.getPendingRequests()
      const isArrayOfStrings = pendingRequests.every(item => typeof item === 'string')
      assert.ok(isArrayOfStrings && pendingRequests.length === length)
    })

    it('should add the key to the pending requests array', () => {
      const key = 'somekey'
      ambiance.pending._add(key)
      assert.equal(ambiance.pending.getPendingRequests()[0], key)
    })
  })

  describe('Spy on interceptors function', () => {
    const spyOnRequestSuccess = sinon.spy(ambiance.pending, '_onRequestSuccess')
    const spyOnResponseSuccess = sinon.spy(ambiance.pending, '_onResponseSuccess')
    const spyOnResponseFailed = sinon.spy(ambiance.pending, '_onResponseFailed')

    it('should trigger the functions', async () => {
      await axios.get(BASIC_URL)
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
