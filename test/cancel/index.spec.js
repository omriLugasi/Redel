const axios = require('axios')
const ambiance = require('./../../src')
const logger = require('./../../src/services/logger')
const { BASIC_URL } = require('./../utils')

ambiance.use(axios, { cancel: true })

const cancelGroupKey = 'Omri Luggasi'

axios.get(`${BASIC_URL}/time-out/2000`, { headers: { cancelGroupKey } })
  .then(response => logger.log(response.data, '87678'))
  .catch(() => logger.log('remove the response'))

axios.get(`${BASIC_URL}/time-out/1500`, { headers: { cancelGroupKey } })
  .then(response => logger.log(response.data, '87678'))
  .catch(() => logger.log('remove the response'))

axios.get(`${BASIC_URL}/time-out/872`, { headers: { cancelGroupKey } })
  .then(response => logger.log(response.data, '87678'))
  .catch(() => logger.log('remove the response'))

setTimeout(() => {
  ambiance.cancel.cancelAllGroupRequest(cancelGroupKey)
}, 350)
