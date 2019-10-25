const axios = require('axios')
const { assert } = require('chai')
const Redel = require('./../../src')
const { BASIC_URL } = require('./../utils')


describe('Test the main module', () => {
  beforeEach(() => {
    Redel.ejectAll()
  })

  context('validate main module with injected axios param', () => {
    const errorMessage = 'Redel must init with an axios instance!'

    it('should throw exception if not sending axios instance', () => {
      assert.throws(() => Redel.use({}, { log: true }), errorMessage)
    })

    it('should work with axios.create functionality', () => {
      const axiosInstance = axios.create()
      assert.doesNotThrow(() => Redel.use(axiosInstance, { log: true }), errorMessage)
    })
  })

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
      assert.isTrue(singedMiddleware[0] === key)
      assert.isTrue(singedMiddleware.length === 1)
    })
  })

  context('validate that eject work well', () => {
    context('eject all', () => {
      it('should return 0 length of signed plugins', () => {
        Redel.use(axios, { log: true, cancel: true })
        Redel.ejectAll()
        assert.isTrue(Redel.getSignedMiddleware().length === 0)
      })
    })

    context('eject by key', () => {
      it('should eject the relevant plugin by key', () => {
        Redel.use(axios, { pending: true, cancel: true })
        Redel.eject('pending')
        assert.isTrue(Redel.getSignedMiddleware().length === 1)

        axios.get(`${BASIC_URL}/basic`).catch(() => {})
        axios.get(`${BASIC_URL}/basic`).catch(() => {})

        setImmediate(() => {
          assert.isTrue(Redel.getPendingRequests() === undefined)
        })
      })

      it('should not eject plugin that not exist', () => {
        Redel.use(axios, { pending: true, cancel: true })
        Redel.eject('not-exist-plugin-name')
        assert.isTrue(Redel.getSignedMiddleware().length === 2)
      })

      it('should not eject plugin that exist but not sign', () => {
        Redel.use(axios, { pending: true, log: true })
        Redel.eject('cancel')
        assert.isTrue(Redel.getSignedMiddleware().length === 2)
      })
    })
  })

  context('validate that add plugin work well', () => {
    it('should assign new plugin', () => {
      Redel.use(axios, {})
      Redel.add('log')
      assert.isTrue(Redel.getSignedMiddleware().length === 1)
    })

    it('should not work with custom plugin name', () => {
      Redel.use(axios, {})
      Redel.add('customPluginName')
      assert.isTrue(Redel.getSignedMiddleware().length === 0)
    })

    it('should not sign plugin that already singed', () => {
      const pluginName = 'log'
      Redel.use(axios, { [pluginName]: true })
      Redel.add(pluginName)
      assert.isTrue(Redel.getSignedMiddleware().length === 1)
    })

    it('should work with already singed plugins', () => {
      const pluginName = 'log'
      Redel.use(axios, { cancel: true })
      Redel.add(pluginName)
      assert.isTrue(Redel.getSignedMiddleware().length === 2)
    })
  })

  context('validate api functionality when user didn\'t init the relevant plugin', () => {

    it('should provide informative error about trying to use functionality of pending plugin that didn\'t init', () => {
      Redel.use(axios, {})
      assert.isTrue(Redel.getPendingRequests() === undefined)
    })

  })
})
