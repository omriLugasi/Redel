const Redel = require('./src')
const axios = require('axios')


Redel.use(axios, {})

axios.get('https://jsonplaceholder.typicode.com/todos/1')

setTimeout(() => {
  console.log(Redel.getPendingRequests())
})
