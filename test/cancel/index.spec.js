const axios = require('axios')
const ambiance = require('./../../src')
const logger = require('./../../src/services/logger')

ambiance.use(axios, { cancel: true })


axios.get('https://jsonplaceholder.typicode.com/todos/1', { headers: { cancelGroupKey: 'Omri Luggasi' } })
  .then(response => logger.log(response))
  .catch(() => {})
axios.get('https://jsonplaceholder.typicode.com/todos/1')
  .then(response => logger.log(response))
  .catch(() => {})
axios.get('https://jsonplaceholder.typicode.com/todos/1')
  .then(() => {})
  .catch(e => {
    if (e.isCanceled) {
      return logger.log('axios canceled by the middleware')
    }
    return logger.log('something is fucked up')
  })
axios.get('https://jsonplaceholder.typicode.com/todos/1')
  .then(response => logger.log(response.data))
  .catch(e => logger.error(e))
