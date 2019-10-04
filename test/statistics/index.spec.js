const axios = require('axios')
const ambiance = require('./../../src')
const { BASIC_URL } = require('./../utils')

const server = require('./../../server')
server.init()
ambiance.use(axios, { statistics: true })
axios.get(`${BASIC_URL}/time-out/900?io=omri lugasi the king`)
  .then(() => {
    server.close()
  })
  .catch(() => {
    server.close()
  })

// axios.post(`${BASIC_URL}/time-out/900`, { param1: true })
//   .then(() => {
//     server.close()
//   })
//   .catch(() => {
//     server.close()
//   })
