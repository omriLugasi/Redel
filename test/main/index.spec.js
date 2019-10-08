const axios = require('axios')
const { assert } = require('chai')
const Redel = require('./../../src')

describe('Test the main module', () => {
  context('validate main module with different types of params', () => {
    const errorMessage = 'Redel: try to initialize the "use" function with wrong config type'

    it('should throw exception if user try to initialize the main module with Array', () => {
      assert.throws(() => Redel.use(axios, []), errorMessage)
    })

    it('should throw exception if user try to initialize the main module with Function', () => {
      assert.throws(() => Redel.use(axios, () => {}), errorMessage)
    })

    it('should throw exception if user try to initialize the main module with Null', () => {
      assert.throws(() => Redel.use(axios, null), errorMessage)
    })

    it('should throw exception if user try to initialize the main module with Undefined', () => {
      assert.throws(() => Redel.use(axios, undefined), errorMessage)
    })

    it('should throw exception if user try to initialize the main module with primitives', () => {
      assert.throws(() => Redel.use(axios, 'string'), errorMessage)
      assert.throws(() => Redel.use(axios, 0), errorMessage)
      assert.throws(() => Redel.use(axios, true), errorMessage)
    })
  })

  context('validate that main module singed only allowed middleware\'s', () => {
    it('should validate that only allowed keys are consume from the config', () => {
      const key = 'pending'
      Redel.use(axios, { [key]: true, customKey: true })
      const singedMiddleware = Redel.getSignedMiddleware()
      assert.ok(singedMiddleware[0], key)
      assert.ok(singedMiddleware.length, 0)
    })
  })
})
